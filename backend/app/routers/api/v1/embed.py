# routers/embed.py

from fastapi import APIRouter, UploadFile, File, Query

from services.storage import save_audio_file
from services.embeddings import get_embedding
from services.qdrant_service import upsert_embedding, search_neighbors

router = APIRouter()


@router.post("/")
async def embed_audio(
    file: UploadFile = File(...),
    top_k: int = Query(5, ge=1, le=50),
):
    # 1) Save uploaded file
    saved_path = await save_audio_file(file)

    # 2) Get embedding from Jacob's service
    embedding = await get_embedding(saved_path)

    # 3) Upsert into Qdrant
    point_id = upsert_embedding(
        embedding,
        payload={"filename": file.filename, "path": saved_path},
    )

    # 4) Search nearest neighbors
    neighbors = search_neighbors(embedding, top_k=top_k)

    # 5) Return full result
    return {
        "id": point_id,
        "saved_path": saved_path,
        "nearest_neighbors": neighbors,
    }
