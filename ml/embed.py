"""
Purpose:
- Convert audio file → embedding vector using CLAP (Contrastive Language-Audio Pretraining)

Notes:
- Uses HuggingFace Transformers CLAP model
- Replaces MFCC-based embedding with learned audio embeddings
- Outputs a fixed-size vector suitable for vector DB (Qdrant)

Dependencies:
- pip install transformers torchaudio librosa torch
"""

import numpy as np
import torch
import librosa
from transformers import ClapProcessor, ClapModel


# Load model once (global for efficiency)
device = "cpu"
model = ClapModel.from_pretrained("laion/clap-htsat-unfused").to(device)
processor = ClapProcessor.from_pretrained("laion/clap-htsat-unfused")

EMBEDDING_DIM = 512  # CLAP default embedding size


def embed_audio(audio_path: str) -> np.ndarray:
    y, sr = librosa.load(audio_path, sr=48000, mono=True)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=512)
    embedding = np.mean(mfccs.T, axis=0)
    return embedding / (np.linalg.norm(embedding) + 1e-10)


def embed_text(text: str) -> np.ndarray:
    inputs = processor(
        text=[text],
        return_tensors="pt",
        padding=True
    ).to(device)

    with torch.no_grad():
        outputs = model.get_text_features(**inputs)

    embedding = outputs[0].cpu().numpy()
    return embedding / np.linalg.norm(embedding)


if __name__ == "__main__":
    # Simple test
    
    import sys

    if len(sys.argv) < 2:
        print("Usage: python embed.py path/to/audio.wav")
        sys.exit(1)

    # vec = embed(sys.argv[1])
    # print("Embedding shape:", vec.shape)
    # print("First 5 values:", vec[:5])

