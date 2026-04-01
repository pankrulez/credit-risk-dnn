# src/hf_hub.py
import os
from huggingface_hub import HfApi, hf_hub_download, ModelCard

HF_REPO_ID = os.getenv("HF_MODEL_REPO", "pankajkapri/credit-risk-dnn")
HF_TOKEN   = os.getenv("HF_TOKEN", "")

ARTIFACTS = [
    "outputs/best_model.pth",
    "outputs/scaler.pkl",
]


def upload_artifacts():
    """Upload model weights + scaler to HuggingFace Model Hub."""
    api = HfApi()

    # Create repo if it doesn't exist yet
    api.create_repo(
        repo_id   = HF_REPO_ID,
        repo_type = "model",
        token     = HF_TOKEN,
        exist_ok  = True,
        private   = False,
    )

    for path in ARTIFACTS:
        if not os.path.exists(path):
            print(f"⚠️  Skipping {path} — file not found.")
            continue

        filename = os.path.basename(path)
        print(f"📤 Uploading {filename} to {HF_REPO_ID}...")
        api.upload_file(
            path_or_fileobj = path,
            path_in_repo    = filename,
            repo_id         = HF_REPO_ID,
            repo_type       = "model",
            token           = HF_TOKEN,
            commit_message  = f"chore: update {filename}",
        )
        print(f"✅ https://huggingface.co/{HF_REPO_ID}/blob/main/{filename}")

    push_model_card()


def download_artifacts(local_dir="outputs"):
    """Download model weights + scaler from HuggingFace Model Hub."""
    os.makedirs(local_dir, exist_ok=True)

    for path in ARTIFACTS:
        filename = os.path.basename(path)
        local    = os.path.join(local_dir, filename)

        if os.path.exists(local):
            print(f"✅ {filename} already cached locally — skipping.")
            continue

        print(f"📥 Downloading {filename} from HuggingFace Hub...")
        hf_hub_download(
            repo_id   = HF_REPO_ID,
            filename  = filename,
            repo_type = "model",
            local_dir = local_dir,
            token     = HF_TOKEN or None,
        )
        print(f"✅ Saved to {local}")


def push_model_card():
    """Push README/model card to HuggingFace Hub."""
    card_content = f"""---
language: en
license: mit
tags:
  - pytorch
  - tabular-classification
  - credit-risk
  - finance
  - explainability
  - shap
  - fairness
datasets:
  - default-of-credit-card-clients
metrics:
  - roc_auc
  - f1
---

# 🏦 Credit Risk Assessment DNN

A **Deep Neural Network with Feature Attention Gate** trained on the
[Taiwan Credit Card Default dataset](https://www.openml.org/d/default-of-credit-card-clients)
(30,000 samples, 23 features) to predict credit default risk.

## Architecture
FeatureAttention(23→23) → Linear(23→128) → BN → ReLU → Dropout
→ Linear(128→64) → BN → ReLU → Dropout
→ Linear(64→32) → BN → ReLU
→ Linear(32→1)


## Performance

| Metric | Score |
|---|---|
| ROC-AUC | ~0.79 |
| F1 (default class) | ~0.68 |
| Decision Threshold | 0.4 |

## Quick Start

```python
import torch, pickle
from huggingface_hub import hf_hub_download

hf_hub_download("{HF_REPO_ID}", "best_model.pth", local_dir="outputs")
hf_hub_download("{HF_REPO_ID}", "scaler.pkl",     local_dir="outputs")

scaler = pickle.load(open("outputs/scaler.pkl", "rb"))
# load model and predict...
```

## Live Demo
- 🖥️ **Frontend**: https://credit-risk-dnn.vercel.app/
"""
    card = ModelCard(card_content.strip())
    card.push_to_hub(HF_REPO_ID, token=HF_TOKEN, repo_type="model")
    print(f"✅ Model card pushed: https://huggingface.co/{HF_REPO_ID}")