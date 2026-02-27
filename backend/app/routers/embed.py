from fastapi import APIRouter, UploadFile, File
from services.storage import save_audio_file
from services.embeddings import get_embedding
from services.search import find_nearest_neighbors

router = APIRouter()

@router.post("/")
async def embed_audio(file: UploadFile = File(...)):
    # Step 2: Save uploaded file
    saved_path = await save_audio_file(file)

    # Step 3: Generate embedding
    embedding = await get_embedding(saved_path)

    # Step 4: Search nearest neighbors
    neighbors = await find_nearest_neighbors(embedding)

    # Step 5: Return full pipeline result
    return {
        "saved_path": saved_path,
        "embedding": embedding,
        "nearest_neighbors": neighbors
    }
