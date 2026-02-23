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
from embed import embed


COLLECTION_NAME = "audio_samples"


def evaluate(query_path: str, top_k: int = 5):
    client = QdrantClient(host="localhost", port=6333)

    query_vector = embed(query_path)

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector.tolist(),
        limit=top_k,
    )

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