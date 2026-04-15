"""
Purpose:
- Load seed audio files and insert into Qdrant

Current implementation:
- Assumes a local folder of seed audio files
- Generates embeddings using embed.py
- Uploads them into a Qdrant collection
"""

import os
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

from embed import embed_audio, EMBEDDING_DIM


SEED_FOLDER = "seed_data"
COLLECTION_NAME = "beats"


def main():
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    client = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))

    # Create collection if it doesn't exist
    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=EMBEDDING_DIM,
            distance=Distance.COSINE,
        ),
    )

    points = []

    for filename in os.listdir(SEED_FOLDER):
        if not filename.lower().endswith((".wav", ".mp3")):
            continue

        path = os.path.join(SEED_FOLDER, filename)

        print(f"Embedding {filename}...")
        vector = embed_audio(path)

        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector.tolist(),
            payload={
                "filename": filename,
                "path": path,
            },
        )

        points.append(point)

    if points:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points,
        )

    print(f"Indexed {len(points)} files into Qdrant.")


if __name__ == "__main__":
    main()
