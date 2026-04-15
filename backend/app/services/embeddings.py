import sys
import os

# Resolve ml/ directory so embed.py (CLAP) can be imported from the backend
_ML_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../ml"))
if _ML_PATH not in sys.path:
    sys.path.insert(0, _ML_PATH)

from typing import List


async def get_embedding(audio_path: str) -> List[float]:
    """
    Generate a 512-dim CLAP audio embedding for the given audio file.
    Delegates to ml/embed.py so the embedding space is identical to
    what database_loader.py and embed_text() produce.
    """
    from embed import embed_audio  # lazy import — avoids loading torch at startup
    vector = embed_audio(audio_path)
    return vector.tolist()
