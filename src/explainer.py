import shap
import matplotlib.pyplot as plt
import torch
import numpy as np

def run_shap(model, X_train, X_test, feature_names, device='cpu'):
    model.eval()

    def model_predict(X_np):
        X_tensor = torch.tensor(
            np.array(X_np, dtype=np.float32)   # ✅ ensure correct dtype
        ).to(device)
        with torch.no_grad():
            logits, _ = model(X_tensor)
            probs = torch.sigmoid(logits).cpu().numpy()
        return np.atleast_1d(probs.reshape(-1))  # ✅ always 1D, never 0-d scalar

    # Use a small background sample for speed (100 rows is enough)
    background = shap.sample(X_train, 100)
    explainer  = shap.KernelExplainer(model_predict, background)

    # Explain first 100 test samples (200 is slow on CPU — use 100 for dev)
    shap_values = explainer.shap_values(X_test[:100], nsamples=100)

    # ── Global Feature Importance ───────────────────────────
    plt.figure(figsize=(10, 7))
    shap.summary_plot(shap_values, X_test[:100],
                      feature_names=feature_names, show=False)
    plt.title("SHAP Feature Importance — Credit Risk DNN", fontweight='bold')
    plt.tight_layout()
    plt.savefig('outputs/shap_summary.png', dpi=150, bbox_inches='tight')
    plt.close()

    # ── Per-Prediction Waterfall ────────────────────────────
    explanation = shap.Explanation(
        values      = shap_values[0],           # first test sample
        base_values = float(explainer.expected_value),  # ✅ cast to float
        data        = X_test[0],
        feature_names = feature_names
    )
    shap.plots.waterfall(explanation, show=False)
    plt.title("SHAP Waterfall — Individual Prediction")
    plt.tight_layout()
    plt.savefig('outputs/shap_waterfall.png', dpi=150, bbox_inches='tight')
    plt.close()

    print("✅ SHAP plots saved to outputs/")
    return shap_values