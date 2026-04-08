# routers/upload.py

from fastapi import APIRouter, UploadFile, File
from models.schemas import UploadResponse
from services.storage import save_audio_file

router = APIRouter()

@router.post("/", response_model=UploadResponse)
async def upload_audio(file: UploadFile = File(...)):
    # 1) Save uploaded file
    saved_path = await save_audio_file(file)

    # 2) Return upload success info
    return {
        "filename": file.filename,
        "saved_path": saved_path,
        "status": "success"
    }
