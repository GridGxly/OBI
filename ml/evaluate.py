"""
Purpose:
- Quick quality check of embedding + search pipeline

Current implementation:
- Takes a query audio file
- Embeds it
- Queries Qdrant
- Prints top matches and distances
"""

from qdrant_client import QdrantClient
from embed import embed_audio


COLLECTION_NAME = "beats"


def evaluate(query_path: str, top_k: int = 5):
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    client = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))

    query_vector = embed_audio(query_path)

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector.tolist(),
        limit=top_k,
    ).points

    print(f"\nTop {top_k} matches for: {query_path}\n")

    for rank, result in enumerate(results, start=1):
        print(f"{rank}. {result.payload.get('filename')}")
        print(f"   Score: {result.score:.4f}")
        print()


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python evaluate.py path/to/query.wav")
        sys.exit(1)

    evaluate(sys.argv[1])