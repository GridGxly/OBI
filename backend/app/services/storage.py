import os

UPLOAD_DIR = "uploaded_audio"

async def save_audio_file(file):
    # Ensure folder exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Build full file path
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Read file bytes
    contents = await file.read()

    # Write bytes to disk
    with open(file_path, "wb") as f:
        f.write(contents)

    return file_path

