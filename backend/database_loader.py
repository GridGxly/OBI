import os
import sys
import uuid
import subprocess

import soundfile as sf
import numpy as np

from datasets import load_dataset
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from dotenv import load_dotenv

# Load .env from this file's directory (OBI/backend/app/.env)
load_dotenv(os.path.join(os.path.dirname(__file__), "app/.env"))

# Make ml/ importable so we can use the same CLAP embed_audio as the search router
_ML_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../ml"))
if _ML_PATH not in sys.path:
    sys.path.insert(0, _ML_PATH)

from embed import embed_audio  # CLAP — same embedding space as search queries


_YTDLP = os.path.join(os.path.dirname(sys.executable), "yt-dlp")


def download_clip(ytid: str, start_s: float, end_s: float, out_path: str) -> bool:
    """Download a trimmed YouTube clip as WAV. Returns True on success."""
    url = f"https://www.youtube.com/watch?v={ytid}"
    try:
        result = subprocess.run(
            [
                _YTDLP,
                url,
                "--download-sections", f"*{start_s}-{end_s}",
                "-x", "--audio-format", "wav",
                "--audio-quality", "0",
                "-o", out_path,
                "--force-overwrites",
            ],
            timeout=60,
        )
        return result.returncode == 0 and os.path.exists(out_path)
    except Exception as e:
        print(f"  yt-dlp failed for {ytid}: {e}")
        return False


def main():
    hf_token  = os.getenv("HF_TOKEN")
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_key = os.getenv("QDRANT_API_KEY")

    if not qdrant_url or not qdrant_key:
        raise RuntimeError("QDRANT_URL and QDRANT_API_KEY must be set in backend/app/.env")

    print("Loading MusicCaps metadata from HuggingFace...")
    try:
        ds = load_dataset("google/MusicCaps", split="train", token=hf_token)
    except Exception as e:
        print(f"Failed to load MusicCaps: {e}")
        return

    print(f"Dataset loaded — {len(ds)} clips")

    client = QdrantClient(url=qdrant_url, api_key=qdrant_key)
    COLLECTION_NAME = "beats"

    # Wipe and recreate collection
    if client.collection_exists(COLLECTION_NAME):
        client.delete_collection(COLLECTION_NAME)
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=qmodels.VectorParams(
            size=512,
            distance=qmodels.Distance.COSINE,
        ),
    )

    current_dir  = os.path.dirname(os.path.abspath(__file__))
    static_dir   = os.path.join(current_dir, "app/static")
    os.makedirs(static_dir, exist_ok=True)

    points   = []
    success  = 0
    skipped  = 0

    for i, item in enumerate(ds):
        ytid    = item["ytid"]
        start_s = item["start_s"]
        end_s   = item["end_s"]
        caption = item.get("caption", "")

        filename = f"{ytid}.wav"
        out_path = os.path.join(static_dir, filename)
        streaming_url = f"http://localhost:8000/static/{filename}"

        print(f"[{i+1}/{len(ds)}] {ytid} ({start_s}s–{end_s}s)")

        # Skip if already downloaded
        if not os.path.exists(out_path):
            ok = download_clip(ytid, start_s, end_s, out_path)
            if not ok:
                print(f"  Skipping — download failed")
                skipped += 1
                continue

        try:
            vector = embed_audio(out_path).tolist()
        except Exception as e:
            print(f"  Skipping — embed failed: {e}")
            skipped += 1
            continue

        points.append(
            qmodels.PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={
                    "filename": filename,
                    "ytid": ytid,
                    "caption": caption,
                    "path": streaming_url,
                    "source": "google/MusicCaps",
                },
            )
        )
        success += 1

        if len(points) >= 50:
            client.upsert(collection_name=COLLECTION_NAME, points=points)
            print(f"  → Upserted batch ({success} total so far)")
            points = []

    if points:
        client.upsert(collection_name=COLLECTION_NAME, points=points)

    print(f"\nDONE — {success} clips indexed, {skipped} skipped.")


if __name__ == "__main__":
    main()
