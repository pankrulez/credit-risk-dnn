# src/hf_hub.py
import os
from huggingface_hub import HfApi, hf_hub_download, ModelCard
from src.config import Config

HF_REPO_ID  = os.getenv("HF_MODEL_REPO", "YOUR_HF_USERNAME/credit-risk-dnn")
HF_TOKEN    = os.getenv("HF_TOKEN", "")

ARTIFACTS = [
    "outputs/best_model.pth",
    "outputs/scaler.pkl",
]


def upload_artifacts():
    """Upload model weights + scaler to HuggingFace Hub after training."""
    api = HfApi()

    for path in ARTIFACTS:
        if not os.path.exists(path):
            print(f"⚠️ Skipping {path} — file not found.")
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
        print(f"✅ Uploaded: https://huggingface.co/{HF_REPO_ID}/blob/main/{filename}")

    push_model_card()


def download_artifacts(local_dir="outputs"):
    """Download model weights + scaler from HuggingFace Hub."""
    os.makedirs(local_dir, exist_ok=True)
    for path in ARTIFACTS:
        filename = os.path.basename(path)
        local    = os.path.join(local_dir, filename)
        if os.path.exists(local):
            print(f"✅ {filename} already exists locally — skipping download.")
            continue
        print(f"📥 Downloading {filename} from HuggingFace Hub...")
        hf_hub_download(
            repo_id   = HF_REPO_ID,
            filename  = filename,
            local_dir = local_dir,
            token     = HF_TOKEN or None,
        )
        print(f"✅ Downloaded to {local}")


def push_model_card():
    """Push a model card README to HuggingFace Hub."""
    card_content = f"""
---
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

A custom **Deep Neural Network with Feature Attention Gate** trained on the
[Taiwan Credit Card Default dataset](https://www.openml.org/d/default-of-credit-card-clients)
(30,000 samples, 23 features) to predict credit default risk.

## Model Architecture
CreditRiskDNN(
FeatureAttention(23 → 23) # soft attention gate per feature
Linear(23 → 128) + BatchNorm + ReLU + Dropout(0.3)
Linear(128 → 64) + BatchNorm + ReLU + Dropout(0.3)
Linear(64 → 32) + BatchNorm + ReLU
Linear(32 → 1) # binary output
)


## Performance

| Metric       | Score  |
|--------------|--------|
| ROC-AUC      | ~0.79  |
| F1 (default) | ~0.68  |
| Threshold    | 0.4    |

## Usage

```python
from huggingface_hub import hf_hub_download
import torch, pickle

# Download artifacts
hf_hub_download("{HF_REPO_ID}", "best_model.pth", local_dir="outputs")
hf_hub_download("{HF_REPO_ID}", "scaler.pkl",     local_dir="outputs")

# Load
scaler = pickle.load(open("outputs/scaler.pkl", "rb"))
model  = CreditRiskDNN(n_features=23)
model.load_state_dict(torch.load("outputs/best_model.pth", map_location="cpu"))
model.eval()

# Predict
raw      = [200000, 2, 2, 2, 35, -1, -1, -1, -1, -1, -1,
            50000, 48000, 45000, 43000, 41000, 40000,
            5000,  5000,  5000,  5000,  5000,  5000]
scaled   = scaler.transform([raw]).tolist()
X        = torch.tensor([scaled], dtype=torch.float32)
with torch.no_grad():
    prob = torch.sigmoid(model(X)).item()
print(f"Default probability: {{prob:.1%}}")
```

## Live Demo

- **Frontend**: https://your-app.vercel.app

## Fairness

Audited across age groups using `fairlearn` —
demographic parity difference and equalized odds reported.

## Explainability

SHAP KernelExplainer used for global feature importance
and per-prediction waterfall charts.
"""

    card = ModelCard(card_content.strip())
    card.push_to_hub(HF_REPO_ID, token=HF_TOKEN)
    print(f"✅ Model card pushed: https://huggingface.co/{HF_REPO_ID}")