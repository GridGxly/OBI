# services/storage.py

import os
import io
import librosa
import soundfile as sf

UPLOAD_DIR = "uploaded_audio"

# Audio types that librosa can load natively without ffmpeg
_NATIVE_TYPES = {"audio/wav", "audio/x-wav"}


async def save_audio_file(file) -> str:
    """
    Save an uploaded audio file to UPLOAD_DIR.
    Non-WAV formats (webm, ogg, mp3) are decoded via librosa and re-saved
    as 48 kHz mono WAV so downstream CLAP embedding always gets a clean file.
    Returns the saved file path.
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    contents = await file.read()
    content_type = file.content_type or ""

    # Derive a .wav output filename regardless of original extension
    base_name = os.path.splitext(file.filename or "upload")[0]
    wav_filename = f"{base_name}.wav"
    file_path = os.path.join(UPLOAD_DIR, wav_filename)

    if content_type in _NATIVE_TYPES or file.filename.endswith(".wav"):
        # Already WAV — write directly
        with open(file_path, "wb") as f:
            f.write(contents)
    else:
        # Decode via librosa (handles webm, ogg, mp3 when ffmpeg is present;
        # falls back gracefully for formats soundfile can read natively)
        try:
            y, sr = librosa.load(io.BytesIO(contents), sr=48000, mono=True)
            sf.write(file_path, y, sr)
        except Exception:
            # Last resort: write raw bytes and let librosa try later
            raw_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(raw_path, "wb") as f:
                f.write(contents)
            return raw_path

    return file_path
