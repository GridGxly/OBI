# tests/test_api.py

import io
import pytest
from httpx import AsyncClient

from main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_embed_endpoint(monkeypatch):
    # --- monkeypatch embedding ---
    async def fake_get_embedding(audio_path: str):
        return [0.1] * 128

    # --- monkeypatch qdrant upsert/search ---
    def fake_upsert_embedding(embedding, payload=None):
        return "test-point-id"

    def fake_search_neighbors(embedding, top_k: int = 5):
        return [
            {"id": "neighbor-1", "score": 0.99, "payload": {}},
            {"id": "neighbor-2", "score": 0.95, "payload": {}},
        ]

    from services import embeddings, qdrant_service

    monkeypatch.setattr(embeddings, "get_embedding", fake_get_embedding)
    monkeypatch.setattr(qdrant_service, "upsert_embedding", fake_upsert_embedding)
    monkeypatch.setattr(qdrant_service, "search_neighbors", fake_search_neighbors)

    # --- build fake audio file ---
    fake_audio = io.BytesIO(b"fake audio data")
    files = {"file": ("test.wav", fake_audio, "audio/wav")}

    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/embed/", files=files)

    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "test-point-id"
    assert len(data["nearest_neighbors"]) == 2


@pytest.mark.asyncio
async def test_search_endpoint(monkeypatch):
    async def fake_get_embedding(audio_path: str):
        return [0.2] * 128

    def fake_search_neighbors(embedding, top_k: int = 5):
        return [
            {"id": "neighbor-3", "score": 0.9, "payload": {}},
        ]

    from services import embeddings, qdrant_service

    monkeypatch.setattr(embeddings, "get_embedding", fake_get_embedding)
    monkeypatch.setattr(qdrant_service, "search_neighbors", fake_search_neighbors)

    fake_audio = io.BytesIO(b"fake audio data")
    files = {"file": ("query.wav", fake_audio, "audio/wav")}

    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/search/", files=files)

    assert resp.status_code == 200
    data = resp.json()
    assert len(data["nearest_neighbors"]) == 1
    assert data["nearest_neighbors"][0]["id"] == "neighbor-3"
