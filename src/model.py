import torch
import torch.nn as nn
import torch.nn.functional as F

class FeatureAttention(nn.Module):
    """Soft attention gate over input features — highlights the most
    relevant credit signals per sample (interpretable by design)."""
    def __init__(self, n_features):
        super().__init__()
        self.attn = nn.Sequential(
            nn.Linear(n_features, n_features),
            nn.Tanh(),
            nn.Linear(n_features, n_features),
            nn.Sigmoid()   # gates each feature between 0 and 1
        )

    def forward(self, x):
        weights = self.attn(x)
        return x * weights, weights  # weighted features + attention map

class CreditRiskDNN(nn.Module):
    def __init__(self, n_features=20, dropout=0.3):
        super().__init__()
        self.attention = FeatureAttention(n_features)

        self.encoder = nn.Sequential(
            nn.Linear(n_features, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(dropout),

            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(dropout),

            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
        )
        self.classifier = nn.Linear(32, 1)

    def forward(self, x):
        x_attn, attn_weights = self.attention(x)
        features = self.encoder(x_attn)
        logit = self.classifier(features)
        return logit.squeeze(-1), attn_weights