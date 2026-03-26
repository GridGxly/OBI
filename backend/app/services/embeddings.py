# services/embeddings.py

from typing import List

import httpx

JACOB_EMBED_URL = "http://jacob-embed-service:8000/embed"


async def get_embedding(audio_path: str) -> List[float]:
    async with httpx.AsyncClient() as client:
        resp = await client.post(JACOB_EMBED_URL, json={"audio_path": audio_path})
        resp.raise_for_status()
        data = resp.json()

    embedding = data["embedding"]
    return embedding

