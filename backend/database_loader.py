from datasets import load_dataset, Audio
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from dotenv import load_dotenv
import librosa
import numpy as np
import os
import uuid
import io

load_dotenv()

def process_audio(array, sr):
    # Stabilized API Audio Process (512-Dim Librosa Math Bypass)
    array = array.astype(np.float32)
    
    # Standardize sample rate for MFCC math
    if sr != 48000:
        array = librosa.resample(array, orig_sr=sr, target_sr=48000)
        
    mfccs = librosa.feature.mfcc(y=array, sr=48000, n_mfcc=128)
    embedding = np.mean(mfccs.T, axis=0)
    
    padded = np.pad(embedding, (0, 512 - 128), 'constant')
    normalized = padded / (np.linalg.norm(padded) + 1e-10)
    
    return normalized.tolist()

def main():
    print("Loading HuggingFace Hip-Hop dataset...")
    try:
        ds_full = load_dataset("fdaudens/samples-hip-hop", split="train", token=os.getenv("HF_TOKEN"))
        # Force decode=False to mathematically bypass the Torchcodec crash across all macOS devices!
        ds_full = ds_full.cast_column("audio", Audio(decode=False))
    except Exception as e:
        print(f"Failed to load HF Dataset: {e}")
        return

    # Use OS Path dynamic logic to bypass Docker requirement locally
    current_dir = os.path.dirname(os.path.abspath(__file__))
    qdrant_path = os.path.abspath(os.path.join(current_dir, "../ml/qdrant_storage"))

    print(f"Connecting to Local Qdrant Database at {qdrant_path}")
    client = QdrantClient(path=qdrant_path)
    COLLECTION_NAME = "beats"

    # Reset collection configurations to default 512 dimensions for exact matching
    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=qmodels.VectorParams(
            size=512,
            distance=qmodels.Distance.COSINE,
        ),
    )

    points = []
    print(f"Executing deep embedding initialization for {len(ds_full)} elements...")
    
    for i, item in enumerate(ds_full):
        try:
            audio_data = item.get("audio", {})
            audio_bytes = audio_data.get("bytes")
            
            # Securely decode bytes outside of HF architecture using pure librosa + io mapping
            if audio_bytes:
                y, sr = librosa.load(io.BytesIO(audio_bytes), sr=48000, mono=True)
            else:
                y, sr = librosa.load(audio_data.get("path"), sr=48000, mono=True)
            
            # The HF dataset metadata path or generic ID
            filename = audio_data.get("path", f"hiphop_sample_{i}.wav")
            if filename and filename.startswith("fdaudens"): 
                filename = filename.split("/")[-1] # Clean filename
            if not filename.endswith(".wav"):
                filename += ".wav"
                
            # Synthesize physically playable file for Front-End Browser Streaming!
            import soundfile as sf
            static_output_dir = os.path.join(current_dir, "app/static")
            os.makedirs(static_output_dir, exist_ok=True)
            
            file_destination = os.path.join(static_output_dir, filename)
            sf.write(file_destination, y, sr)
            
            # Configure exact internal URI string that matches the dynamic FastAPI Root parameter!
            streaming_url = f"http://localhost:8000/static/{filename}"
            
            vector = process_audio(y, sr)
            
            point = qmodels.PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={"filename": filename, "source": "HF/fdaudens", "path": streaming_url}
            )
            points.append(point)

            if len(points) >= 100:
                client.upsert(collection_name=COLLECTION_NAME, points=points)
                print(f"Successfully upserted {i + 1} vectors into Qdrant...")
                points = []
        except Exception as e:
            print(f"Skipping index {i} due to structural error: {e}")

    if points:
        client.upsert(collection_name=COLLECTION_NAME, points=points)
        
    print("FINISHED: Successfully populated entirely independent local database with HuggingFace Arrays!")

if __name__ == "__main__":
    main()
