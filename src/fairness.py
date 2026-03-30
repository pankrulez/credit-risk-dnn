import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import torch
from fairlearn.metrics import (
    MetricFrame,
    demographic_parity_difference,
    equalized_odds_difference,
    selection_rate, true_positive_rate, false_positive_rate
)
from sklearn.metrics import accuracy_score, roc_auc_score
import os

def run_fairness_audit(X_test, y_test, feature_names,
                        model, model_type='dnn', device='cpu'):
    print("\n" + "=" * 55)
    print("       FAIRNESS AUDIT — Credit Risk DNN")
    print("=" * 55)

    # ── Get predictions ────────────────────────────────────
    if model_type == 'dnn':
        model.eval()
        X_tensor = torch.tensor(X_test, dtype=torch.float32).to(device)
        with torch.no_grad():
            logits, _ = model(X_tensor)
            probs = torch.sigmoid(logits).cpu().numpy()
    else:
        probs = model.predict_proba(X_test)[:, 1]

    y_pred = (probs >= 0.4).astype(int)

    # ── Sensitive feature: Age group (index from feature_names) ──
    # German Credit has 'age' — bucket into Young / Middle / Senior
    age_idx = feature_names.index('age') if 'age' in feature_names else 12
    ages    = X_test[:, age_idx]

    # Reverse-standardize age for bucketing (approximate)
    age_groups = np.where(ages < -0.5, 'Young (<30)',
                 np.where(ages > 0.8,  'Senior (>50)', 'Middle (30-50)'))

    # ── MetricFrame ────────────────────────────────────────
    mf = MetricFrame(
        metrics={
            'accuracy':          lambda yt, yp: accuracy_score(yt, yp),
            'selection_rate':    selection_rate,
            'true_positive_rate': true_positive_rate,
            'false_positive_rate': false_positive_rate,
        },
        y_true=y_test,
        y_pred=y_pred,
        sensitive_features=age_groups
    )

    print("\n📊 Metrics by Age Group:")
    print(mf.by_group.round(3).to_string())

    # ── Fairness Scores ────────────────────────────────────
    dp_diff = demographic_parity_difference(y_test, y_pred, sensitive_features=age_groups)
    eo_diff = equalized_odds_difference(y_test,    y_pred, sensitive_features=age_groups)

    print(f"\n⚖️  Demographic Parity Difference : {dp_diff:.4f}  (ideal = 0)")
    print(f"⚖️  Equalized Odds Difference     : {eo_diff:.4f}  (ideal = 0)")

    if abs(dp_diff) > 0.1:
        print("⚠️  WARNING: Significant demographic disparity detected!")
    else:
        print("✅ Demographic parity within acceptable bounds.")

    if abs(eo_diff) > 0.1:
        print("⚠️  WARNING: Equalized odds violation — model treats age groups unequally.")
    else:
        print("✅ Equalized odds within acceptable bounds.")

    # ── Plot ───────────────────────────────────────────────
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle("Fairness Audit — Credit Risk Model", fontsize=13, fontweight='bold')

    mf.by_group[['selection_rate', 'true_positive_rate', 'false_positive_rate']]\
      .plot(kind='bar', ax=axes[0], colormap='Set2', edgecolor='black')
    axes[0].set_title("Approval & TPR/FPR by Age Group")
    axes[0].set_xticklabels(axes[0].get_xticklabels(), rotation=30, ha='right')
    axes[0].axhline(y=mf.overall['selection_rate'], color='red',
                    linestyle='--', label='Overall rate')
    axes[0].legend()

    mf.by_group[['accuracy']].plot(kind='bar', ax=axes[1],
                                    color='steelblue', edgecolor='black')
    axes[1].set_title("Accuracy by Age Group")
    axes[1].set_ylim(0, 1)
    axes[1].set_xticklabels(axes[1].get_xticklabels(), rotation=30, ha='right')
    axes[1].axhline(y=mf.overall['accuracy'], color='red',
                    linestyle='--', label='Overall accuracy')
    axes[1].legend()

    plt.tight_layout()
    os.makedirs('outputs', exist_ok=True)
    plt.savefig('outputs/fairness_audit.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("📁 Saved: outputs/fairness_audit.png")
    return mf