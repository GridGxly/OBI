"""
Purpose:
- Load seed audio files from Hugging Face dataset and insert into cloud Qdrant.
- Stores filename + streaming URL in payload so the frontend can play results.
"""

import os
import uuid
import tempfile
import soundfile as sf

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../backend/app/.env"))

from datasets import load_dataset, Audio
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

from embed import embed_audio, EMBEDDING_DIM

COLLECTION_NAME = "beats"
BACKEND_STATIC_URL = os.getenv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:8000")


def main():
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_key = os.getenv("QDRANT_API_KEY")
    hf_token = os.getenv("HF_TOKEN")

    if not qdrant_url or not qdrant_key:
        raise RuntimeError("QDRANT_URL and QDRANT_API_KEY must be set in backend/app/.env")

    client = QdrantClient(url=qdrant_url, api_key=qdrant_key)

    # (Re)create collection with correct dimensions
    if client.collection_exists(COLLECTION_NAME):
        client.delete_collection(COLLECTION_NAME)
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=EMBEDDING_DIM,  # 512 — laion/clap-htsat-unfused projected embedding
            distance=Distance.COSINE,
        ),
    )

    print("Loading HuggingFace Hip-Hop dataset...")
    dataset = load_dataset(
        "fdaudens/samples-hip-hop",
        split="train",
        token=hf_token,
    )
    # decode=False → get raw bytes, avoids torchcodec crash
    dataset = dataset.cast_column("audio", Audio(decode=False))

    points = []

    for i, item in enumerate(dataset):
        try:
            audio_data = item.get("audio", {})
            audio_bytes = audio_data.get("bytes")

            # Derive a clean .wav filename from the HF path
            raw_name = audio_data.get("path") or f"hiphop_sample_{i}"
            base_name = os.path.splitext(os.path.basename(raw_name))[0]
            filename = f"{base_name}.wav"

            # Write to a temp file so embed_audio() can read it
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp_path = tmp.name
                if audio_bytes:
                    import io, librosa
                    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=48000, mono=True)
                else:
                    import librosa
                    y, sr = librosa.load(audio_data["path"], sr=48000, mono=True)
                sf.write(tmp_path, y, sr)

            vector = embed_audio(tmp_path).tolist()
            os.unlink(tmp_path)

            # Streaming URL — matches the /static mount in main.py
            streaming_url = f"{BACKEND_STATIC_URL}/static/{filename}"

            point = PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={
                    "filename": filename,
                    "source": "HF/fdaudens",
                    "path": streaming_url,
                    "label": item.get("label"),
                },
            )
            points.append(point)

            # Batch upsert every 50 items
            if len(points) >= 50:
                client.upsert(collection_name=COLLECTION_NAME, points=points)
                print(f"Upserted {i + 1} vectors into cloud Qdrant...")
                points = []

        except Exception as e:
            print(f"Skipping index {i}: {e}")

    # Final flush
    if points:
        client.upsert(collection_name=COLLECTION_NAME, points=points)

    print(f"FINISHED: Indexed dataset into cloud Qdrant collection '{COLLECTION_NAME}'.")


if __name__ == "__main__":
    main()
