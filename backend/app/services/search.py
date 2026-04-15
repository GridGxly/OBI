from services.qdrant_service import search_neighbors
from typing import List


async def find_nearest_neighbors(embedding: List[float], top_k: int = 5) -> List[dict]:
    """
    Thin async wrapper around the synchronous Qdrant search.
    Returns a list of {"id": str, "score": float, "payload": dict}.
    """
    return search_neighbors(embedding, top_k=top_k)
