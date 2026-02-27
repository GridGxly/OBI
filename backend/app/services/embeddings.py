import random

async def get_embedding(audio_path: str):
    # Fake embedding: 128 random floats
    embedding = [random.random() for _ in range(128)]
    return embedding



