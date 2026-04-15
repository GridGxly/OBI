"""
Purpose:
- Load seed audio files (now from Hugging Face dataset) and insert into Qdrant
"""

import os
import uuid
import tempfile
import soundfile as sf

from datasets import load_dataset  # ✅ NEW
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

from embed import embed_audio, EMBEDDING_DIM

COLLECTION_NAME = "beats"


def main():
    client = QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
    )

    # Create collection if it doesn't exist
    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=EMBEDDING_DIM,
            distance=Distance.COSINE,
        ),
    )

    # hf dataset
    dataset = load_dataset("fdaudens/samples-hip-hop", split="train")

    points = []

    for item in dataset:

        audio = item["audio"]

        # CASE 1: file path exists
        if "path" in audio and audio["path"]:
            vector = embed_audio(audio["path"])

        # CASE 2: raw audio array
        else:
            with tempfile.NamedTemporaryFile(suffix=".wav") as f:
                sf.write(f.name, audio["array"], audio["sampling_rate"])
                vector = embed_audio(f.name)

        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector.tolist(),
            payload={
                "source": "huggingface",
                "label": item.get("label"),
            },
        )

        points.append(point)

        # batch upload
        if len(points) >= 50:
            client.upsert(
                collection_name=COLLECTION_NAME,
                points=points,
            )
            points = []

    # final flush
    if points:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points,
        )

    print(f"Indexed dataset into Qdrant.")


if __name__ == "__main__":
    main()