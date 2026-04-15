# services/qdrant_service.py

import uuid
from typing import List

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from core.config import settings

COLLECTION_NAME = "beats"
VECTOR_SIZE = 512

client = QdrantClient(
    url=settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY,
)


def ensure_collection():
    if not client.collection_exists(COLLECTION_NAME):
        client.create_collection(
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

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=embedding,
        limit=top_k,
    ).points

    neighbors = [
        {
            "id": str(point.id),
            "score": point.score,
            "payload": point.payload or {},
        }
        for point in results
    ]

    return neighbors
