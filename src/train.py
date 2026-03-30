import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau
import numpy as np
from sklearn.metrics import roc_auc_score

def train_model(model, loaders, epochs=100, lr=1e-3, patience=10, device='cpu'):
    model.to(device)

    # Class imbalance: ~70% good, 30% bad → weighted loss
    pos_weight = torch.tensor([2.33], device=device)
    criterion  = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
    optimizer  = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler  = ReduceLROnPlateau(optimizer, mode='max', patience=5, factor=0.5)

    best_val_auc = 0
    patience_counter = 0
    history = {'train_loss': [], 'val_auc': []}

    for epoch in range(1, epochs + 1):
        # ── Train ─────────────────────────────────
        model.train()
        total_loss = 0
        for X_batch, y_batch in loaders['train']:
            X_batch, y_batch = X_batch.to(device), y_batch.to(device)
            optimizer.zero_grad()
            logits, _ = model(X_batch)
            loss = criterion(logits, y_batch)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            total_loss += loss.item()

        # ── Validate ──────────────────────────────
        model.eval()
        val_probs, val_labels = [], []
        with torch.no_grad():
            for X_batch, y_batch in loaders['val']:
                X_batch = X_batch.to(device)
                logits, _ = model(X_batch)
                probs = torch.sigmoid(logits).cpu().numpy()
                val_probs.extend(probs)
                val_labels.extend(y_batch.numpy())

        val_auc = roc_auc_score(val_labels, val_probs)
        scheduler.step(val_auc)

        avg_loss = total_loss / len(loaders['train'])
        history['train_loss'].append(avg_loss)
        history['val_auc'].append(val_auc)

        if epoch % 10 == 0:
            print(f"Epoch {epoch:>3} | Loss: {avg_loss:.4f} | Val AUC: {val_auc:.4f}")

        # ── Early Stopping ────────────────────────
        if val_auc > best_val_auc:
            best_val_auc = val_auc
            torch.save(model.state_dict(), 'outputs/best_model.pth')
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"Early stopping at epoch {epoch}. Best Val AUC: {best_val_auc:.4f}")
                break

    model.load_state_dict(torch.load('outputs/best_model.pth'))
    return model, history