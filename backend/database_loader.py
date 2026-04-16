import os
import sys
import uuid
import io

import librosa
import soundfile as sf
import numpy as np

from datasets import load_dataset, Audio
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env from this file's directory (OBI/backend/app/.env)
load_dotenv(os.path.join(os.path.dirname(__file__), "app/.env"))

# Make ml/ importable so we can use the same CLAP embed_audio as the search router
_ML_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../ml"))
if _ML_PATH not in sys.path:
    sys.path.insert(0, _ML_PATH)

from embed import embed_audio  # CLAP — same embedding space as search queries

SUPABASE_BUCKET = "audio-samples"


def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in backend/app/.env")
    return create_client(url, key)


def upload_to_supabase(supabase: Client, wav_bytes: bytes, filename: str) -> str:
    """Upload WAV bytes to Supabase Storage and return the public URL."""
    try:
        # upsert=True so re-runs don't fail on duplicate filenames
        supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=filename,
            file=wav_bytes,
            file_options={"content-type": "audio/wav", "upsert": "true"},
        )
    except Exception as e:
        # If already exists and upsert didn't work, just get the URL
        print(f"  Upload warning for {filename}: {e}")

    public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(filename)
    return public_url


def main():
    print("Loading HuggingFace Hip-Hop dataset...")

    hf_token = os.getenv("HF_TOKEN")
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_key = os.getenv("QDRANT_API_KEY")

    if not qdrant_url or not qdrant_key:
        raise RuntimeError("QDRANT_URL and QDRANT_API_KEY must be set in backend/app/.env")

    supabase = get_supabase_client()

    # Ensure the bucket exists and is public
    try:
        buckets = supabase.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        if SUPABASE_BUCKET not in bucket_names:
            supabase.storage.create_bucket(SUPABASE_BUCKET, options={"public": True})
            print(f"Created Supabase bucket: {SUPABASE_BUCKET}")
        else:
            print(f"Using existing Supabase bucket: {SUPABASE_BUCKET}")
    except Exception as e:
        print(f"Bucket setup warning: {e}")

    try:
        ds_full = load_dataset(
            "fdaudens/samples-hip-hop",
            split="train",
            token=hf_token,
        )
        # decode=False → get raw bytes, avoids torchcodec crash on macOS/Windows
        ds_full = ds_full.cast_column("audio", Audio(decode=False))
    except Exception as e:
        print(f"Failed to load HF Dataset: {e}")
        return

    client = QdrantClient(url=qdrant_url, api_key=qdrant_key)

    COLLECTION_NAME = "beats"

    if client.collection_exists(COLLECTION_NAME):
        client.delete_collection(COLLECTION_NAME)
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=qmodels.VectorParams(
            size=512,  # laion/clap-htsat-unfused projected embedding size
            distance=qmodels.Distance.COSINE,
        ),
    )

    points = []

    for i, item in enumerate(ds_full):
        try:
            audio_data = item.get("audio", {})
            audio_bytes = audio_data.get("bytes")

            if audio_bytes:
                y, sr = librosa.load(io.BytesIO(audio_bytes), sr=48000, mono=True)
            else:
                y, sr = librosa.load(audio_data.get("path"), sr=48000, mono=True)

            # Clean filename: strip any existing extension, always save as .wav
            raw_name = audio_data.get("path") or f"hiphop_sample_{i}"
            base_name = os.path.splitext(os.path.basename(raw_name))[0]
            filename = f"{base_name}.wav"

            # Encode to WAV bytes in memory
            wav_buffer = io.BytesIO()
            sf.write(wav_buffer, y, sr, format="WAV")
            wav_bytes_out = wav_buffer.getvalue()

            # Upload to Supabase Storage and get public URL
            streaming_url = upload_to_supabase(supabase, wav_bytes_out, filename)
            print(f"[{i}] Uploaded {filename} → {streaming_url}")

            # Use CLAP embed_audio — same model/space as embed_text and search router
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(wav_bytes_out)
                tmp.flush()
                vector = embed_audio(tmp.name).tolist()
            os.unlink(tmp.name)

            points.append(
                qmodels.PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload={
                        "filename": filename,
                        "source": "HF/fdaudens",
                        "path": streaming_url,
                        "label": item.get("label"),
                    },
                )
            )

            if len(points) >= 50:
                client.upsert(collection_name=COLLECTION_NAME, points=points)
                print(f"Upserted {i + 1} vectors into cloud Qdrant...")
                points = []

        except Exception as e:
            print(f"Skipping index {i}: {e}")

    if points:
        client.upsert(collection_name=COLLECTION_NAME, points=points)

    print("FINISHED: Uploaded dataset to Supabase Storage + Qdrant Cloud with CLAP embeddings!")


if __name__ == "__main__":
    main()
