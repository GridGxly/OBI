# routers/search.py

from fastapi import APIRouter, UploadFile, File, Query, Form
from typing import Optional

from services.storage import save_audio_file
from services.embeddings import get_embedding
from services.qdrant_service import search_neighbors
import os
import sys

router = APIRouter()

@router.post("/")
async def search_audio(
    audio: Optional[UploadFile] = File(None),
    query: Optional[str] = Form(None),
    dust: Optional[int] = Form(0),
    warmth: Optional[int] = Form(0),
    crunch: Optional[int] = Form(0),
    top_k: int = Query(20, ge=1, le=100),
):
    try:
        if audio and audio.filename:
            saved_path = await save_audio_file(audio)
            embedding = await get_embedding(saved_path)
        elif query:
            # Hook text models organically
            sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml")))
            from embed import embed_text
            embedding = embed_text(query).tolist()
            saved_path = f"TEXT_QUERY: {query}"
        else:
            return {"nearest_neighbors": []}

        neighbors = search_neighbors(embedding, top_k=top_k)
        # Convert raw cosine similarity (0.0–1.0) to 0–100 percentage
        for n in neighbors:
            n["score"] = round(n["score"] * 100, 1)
        print(f"ML Search success! Found {len(neighbors)} neighbors.")

        return {
            "query_path": saved_path,
            "nearest_neighbors": neighbors,
        }
    except Exception as e:
        import traceback
        print(f"Search error: {e}")
        traceback.print_exc()
        return {
            "query_path": "error",
            "nearest_neighbors": [],
            "error": str(e),
        }


from models.schemas import SearchResultDetail

@router.get("/results/{search_id}", response_model=SearchResultDetail)
async def get_search_results(search_id: str):
    try:
        from services.qdrant_service import client, COLLECTION_NAME
        # Ask Qdrant Vector DB for the payload assigned to this UUID
        points = client.retrieve(
            collection_name=COLLECTION_NAME,
            ids=[search_id],
        )
        if points:
            payload = points[0].payload or {}
            return {
                "id": search_id,
                "filename": payload.get("filename", f"Unknown_{search_id}.wav"),
                "path": payload.get("path", f"/mock/path/{search_id}.wav"),
                "score": None # Score was passed earlier, not stored on document
            }
    except Exception as e:
        print(f"Failed Qdrant ID retrieval: {e}")

    # Mock fallback for when DB is totally disconnected
    return {
        "id": search_id,
        "filename": f"mock_file_{search_id}.wav",
        "path": f"/mock/path/{search_id}.wav",
        "score": 0.99
    }
