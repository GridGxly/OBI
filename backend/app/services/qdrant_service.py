# services/qdrant_service.py

import uuid
from typing import List

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

QDRANT_URL = "http://localhost:6333"
COLLECTION_NAME = "beats"
VECTOR_SIZE = 128

client = QdrantClient(url=QDRANT_URL)


def ensure_collection():
    collections = client.get_collections()
    names = [c.name for c in collections.collections]
    if COLLECTION_NAME not in names:
        client.recreate_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=qmodels.VectorParams(
                size=VECTOR_SIZE,
                distance=qmodels.Distance.COSINE,
            ),
        )


def upsert_embedding(embedding: List[float], payload: dict | None = None) -> str:
    ensure_collection()

    point_id = str(uuid.uuid4())

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            qmodels.PointStruct(
                id=point_id,
                vector=embedding,
                payload=payload or {},
            )
        ],
    )

    return point_id


def search_neighbors(embedding: List[float], top_k: int = 5):
    ensure_collection()

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=embedding,
        limit=top_k,
    )

    neighbors = [
        {
            "id": str(point.id),
            "score": point.score,
            "payload": point.payload or {},
        }
        for point in results
    ]

    return neighbors
