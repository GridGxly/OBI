import numpy as np
import librosa

EMBEDDING_DIM = 512  # laion/clap-htsat-unfused projected embedding size

_clap_model = None
_clap_processor = None


def get_clap_models():
    global _clap_model, _clap_processor
    if _clap_model is None:
        import torch
        from transformers import ClapProcessor, ClapModel
        _clap_model = ClapModel.from_pretrained("laion/clap-htsat-unfused").to("cpu")
        _clap_processor = ClapProcessor.from_pretrained("laion/clap-htsat-unfused")
    return _clap_model, _clap_processor


def embed_audio(audio_path: str) -> np.ndarray:
    import torch

    model, processor = get_clap_models()

    y, sr = librosa.load(audio_path, sr=48000, mono=True)

    inputs = processor(
        audio=y,
        sampling_rate=sr,
        return_tensors="pt"
    )

    with torch.no_grad():
        outputs = model.get_audio_features(**inputs)

    # get_audio_features returns a tensor [batch, embed_dim] directly
    if hasattr(outputs, "pooler_output"):
        tensor = outputs.pooler_output
    elif hasattr(outputs, "last_hidden_state"):
        tensor = outputs.last_hidden_state[:, 0, :]
    else:
        tensor = outputs  # already a plain tensor

    embedding = tensor[0].cpu().numpy().flatten()
    embedding = embedding / (np.linalg.norm(embedding) + 1e-10)
    return embedding


def embed_text(text: str) -> np.ndarray:
    import torch

    model, processor = get_clap_models()

    inputs = processor(
        text=[text],
        return_tensors="pt",
        padding=True
    )

    with torch.no_grad():
        outputs = model.get_text_features(**inputs)

    # get_text_features returns a tensor [batch, embed_dim] directly
    if hasattr(outputs, "pooler_output"):
        tensor = outputs.pooler_output
    elif hasattr(outputs, "last_hidden_state"):
        tensor = outputs.last_hidden_state[:, 0, :]
    else:
        tensor = outputs  # already a plain tensor

    embedding = tensor[0].cpu().numpy().flatten()
    embedding = embedding / (np.linalg.norm(embedding) + 1e-10)
    return embedding


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python embed.py path/to/audio.wav")
        sys.exit(1)

    vec = embed_audio(sys.argv[1])
    print("Embedding shape:", vec.shape)
    print("First 5 values:", vec[:5])
