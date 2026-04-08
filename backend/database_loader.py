from datasets import load_dataset
import pandas as pd
from huggingface_hub import login
from dotenv import load_dotenv
import os

load_dotenv()


ds_full = load_dataset("fdaudens/samples-hip-hop", split="train", token=os.getenv("HF_TOKEN"))
print(len(ds_full))
print(ds_full.features)
