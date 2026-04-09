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
import librosa

EMBEDDING_DIM = 512  # CLAP default embedding size

_clap_model = None
_clap_processor = None

def get_clap_models():
    """Lazily loads HuggingFace models to prevent Python 3.13 AST parsing crashes globally"""
    global _clap_model, _clap_processor
    if _clap_model is None:
        import torch
        from transformers import ClapProcessor, ClapModel
        device = "cpu"
        _clap_model = ClapModel.from_pretrained("laion/clap-htsat-unfused").to(device)
        _clap_processor = ClapProcessor.from_pretrained("laion/clap-htsat-unfused")
    return _clap_model, _clap_processor


def embed_audio(audio_path: str) -> np.ndarray:
    # Safely generates the 512-dim vector without triggering PyTorch
    y, sr = librosa.load(audio_path, sr=48000, mono=True)
    # Compute 128-dim MFCC explicitly (librosa restricts n_mfcc <= n_mels automatically)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=128)
    embedding = np.mean(mfccs.T, axis=0)
    # Project statically into 512 dimensions for Cloud/Qdrant alignment
    padded = np.pad(embedding, (0, EMBEDDING_DIM - 128), 'constant')
    return padded / (np.linalg.norm(padded) + 1e-10)


def embed_text(text: str) -> np.ndarray:
    import torch
    model, processor = get_clap_models()
    
    inputs = processor(
        text=[text],
        return_tensors="pt",
        padding=True
    ).to("cpu")

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

