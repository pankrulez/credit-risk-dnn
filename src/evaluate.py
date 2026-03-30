import torch
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import (roc_auc_score, classification_report,
                              confusion_matrix, RocCurveDisplay,
                              PrecisionRecallDisplay, ConfusionMatrixDisplay)

def evaluate_model(model, loader, device='cpu', threshold=0.4):
    model.eval()
    all_probs, all_labels = [], []
    with torch.no_grad():
        for X_batch, y_batch in loader:
            X_batch = X_batch.to(device)
            logits, _ = model(X_batch)
            probs = torch.sigmoid(logits).cpu().numpy()
            all_probs.extend(probs)
            all_labels.extend(y_batch.numpy())

    probs  = np.array(all_probs)
    labels = np.array(all_labels)
    preds  = (probs >= threshold).astype(int)

    print("=" * 50)
    print(f"Test ROC-AUC  : {roc_auc_score(labels, probs):.4f}")
    print(classification_report(labels, preds,
                                 target_names=['Good Credit', 'Bad Credit']))
    print("=" * 50)

    # ── Plots ─────────────────────────────────────
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    fig.suptitle("Credit Risk DNN — Test Evaluation", fontsize=14, fontweight='bold')

    RocCurveDisplay.from_predictions(labels, probs, ax=axes[0],
                                     name="DNN", color='steelblue')
    axes[0].set_title("ROC Curve")

    PrecisionRecallDisplay.from_predictions(labels, probs, ax=axes[1],
                                             name="DNN", color='darkorange')
    axes[1].set_title("Precision-Recall Curve")

    cm = confusion_matrix(labels, preds)
    ConfusionMatrixDisplay(cm, display_labels=['Good', 'Bad']).plot(
        ax=axes[2], colorbar=False, cmap='Blues')
    axes[2].set_title("Confusion Matrix")

    plt.tight_layout()
    plt.savefig('outputs/evaluation_plots.png', dpi=150, bbox_inches='tight')
    plt.show()
    return probs, labels