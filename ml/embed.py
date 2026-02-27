"""
Purpose:
- Convert audio file → embedding vector

Current implementation:
- Uses a simple placeholder embedding based on MFCC features.
- This will later be replaced with CLAP or another contrastive audio model.
"""

import numpy as np
import librosa


EMBEDDING_DIM = 128  # fixed size output vector


def embed(audio_path: str) -> np.ndarray:
    """
    Convert an audio file into a fixed-length embedding vector.

    Steps:
    1. Load audio
    2. Extract MFCC features
    3. Average across time
    4. Pad or trim to fixed embedding size
    """

    # Load audio (mono)
    y, sr = librosa.load(audio_path, sr=22050, mono=True)

    # Extract MFCCs
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=EMBEDDING_DIM)

    # Average across time axis
    embedding = np.mean(mfcc, axis=1)

    # Ensure fixed size
    if len(embedding) > EMBEDDING_DIM:
        embedding = embedding[:EMBEDDING_DIM]
    elif len(embedding) < EMBEDDING_DIM:
        padding = EMBEDDING_DIM - len(embedding)
        embedding = np.pad(embedding, (0, padding))

    return embedding.astype(np.float32)


if __name__ == "__main__":
    # Simple local test
    import sys

    if len(sys.argv) < 2:
        print("Usage: python embed.py path/to/audio.wav")
        sys.exit(1)

    vec = embed(sys.argv[1])
    print("Embedding shape:", vec.shape)
    print("First 5 values:", vec[:5])
