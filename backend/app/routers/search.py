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

    # 2) Get embedding from Jacob's service
    embedding = await get_embedding(saved_path)

    # 3) Search Qdrant
    neighbors = search_neighbors(embedding, top_k=top_k)

    # 4) Return results
    return {
        "query_path": saved_path,
        "nearest_neighbors": neighbors,
    }
