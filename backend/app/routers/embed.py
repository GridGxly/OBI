from fastapi import APIRouter, UploadFile, File
router = APIRouter()
@router.post("/") 
async def embed_audio(file: UploadFile = File(...)):
  return {"message": "embed endpoint stub", "filename": file.filename}


