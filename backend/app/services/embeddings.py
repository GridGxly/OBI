import numpy as np
import librosa
from typing import List

async def get_embedding(audio_path: str) -> List[float]:
    # Extract MFCC using librosa (temporarily swapped as requested)
    y, sr = librosa.load(audio_path, sr=48000, mono=True)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=128)
    
    embedding = np.mean(mfccs.T, axis=0)
    padded = np.pad(embedding, (0, 512 - 128), 'constant')
    normalized_embed = padded / (np.linalg.norm(padded) + 1e-10)
    
    return normalized_embed.tolist()


