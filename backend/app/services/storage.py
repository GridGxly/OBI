# services/storage.py

import os

UPLOAD_DIR = "uploaded_audio"


async def save_audio_file(file):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    contents = await file.read()

    with open(file_path, "wb") as f:
        f.write(contents)

    return file_path

