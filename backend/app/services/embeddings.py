import numpy as np
import torch
import librosa
from transformers import ClapProcessor, ClapModel
from typing import List

# Load model globally so it exists in memory for FastAPI
device = "cpu"
model = ClapModel.from_pretrained("laion/clap-htsat-unfused").to(device)
processor = ClapProcessor.from_pretrained("laion/clap-htsat-unfused")

async def get_embedding(audio_path: str) -> List[float]:
    # Extract MFCC using librosa (temporarily swapped as requested)
    y, sr = librosa.load(audio_path, sr=48000, mono=True)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=512)
    
    embedding = np.mean(mfccs.T, axis=0)
    normalized_embed = embedding / (np.linalg.norm(embedding) + 1e-10)
    
    return normalized_embed.tolist()


