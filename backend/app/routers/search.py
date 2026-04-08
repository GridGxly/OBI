# routers/search.py

from fastapi import APIRouter, UploadFile, File, Query

from services.storage import save_audio_file
from services.embeddings import get_embedding
from services.qdrant_service import search_neighbors

router = APIRouter()


@router.post("/")
async def search_audio(
    file: UploadFile = File(...),
    top_k: int = Query(5, ge=1, le=50),
):
    # 1) Save uploaded file (optional, but useful for debugging)
    saved_path = await save_audio_file(file)

    # 2) Get embedding & Search Qdrant (Will gracefully mock if ML services offline)
    try:
        embedding = await get_embedding(saved_path)
        neighbors = search_neighbors(embedding, top_k=top_k)
        print(f"ML Search success! Found {len(neighbors)} neighbors.")
    except Exception as e:
        print(f"ML processing unavailable. Returning mock schema payload. Error: {e}")
        neighbors = [
            {"id": "mock_abc_1", "score": 98.4},
            {"id": "mock_xyz_2", "score": 85.1},
        ]
        
    # 4) Return results
    return {
        "query_path": saved_path,
        "nearest_neighbors": neighbors,
    }


from models.schemas import SearchResultDetail

@router.get("/results/{search_id}", response_model=SearchResultDetail)
async def get_search_results(search_id: str):
    # Mock fetching search results metadata
    return {
        "id": search_id,
        "filename": f"mock_file_{search_id}.wav",
        "path": f"/mock/path/{search_id}.wav",
        "score": 0.99
    }
