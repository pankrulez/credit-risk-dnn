import argparse
import os
import pickle
import torch

os.makedirs('outputs', exist_ok=True)

from src.data_loader import load_and_preprocess
from src.model       import CreditRiskDNN
from src.train       import train_model
from src.evaluate    import evaluate_model
from src.explainer   import run_shap
from src.fairness    import run_fairness_audit


def parse_args():
    parser = argparse.ArgumentParser(
        description='Credit Risk Assessment — DNN / TabNet Pipeline'
    )
    parser.add_argument(
        '--model', default='dnn', choices=['dnn', 'tabnet'],
        help='Model architecture (default: dnn)'
    )
    parser.add_argument(
        '--dataset', default='default',
        choices=['german', 'default', 'gmsc'],
        help='Dataset to use (default: default = Taiwan credit card, 30K rows)'
    )
    parser.add_argument(
        '--shap', action='store_true',
        help='Run SHAP explainability after training (slow on CPU)'
    )
    parser.add_argument(
        '--fairness', action='store_true',
        help='Run fairness audit after training'
    )
    parser.add_argument(
        '--epochs', type=int, default=100,
        help='Max training epochs (default: 100)'
    )
    parser.add_argument(
        '--lr', type=float, default=1e-3,
        help='Learning rate (default: 0.001)'
    )
    return parser.parse_args()


def run_dnn(args, loaders, X_test, y_test, feature_names, X_train, device, scaler):
    model = CreditRiskDNN(
        n_features=len(feature_names),
        dropout=0.3
    )
    print(f"\n🧠 Training DNN on {args.dataset} dataset...")
    model, history = train_model(
        model, loaders,
        epochs=args.epochs,
        lr=args.lr,
        device=device
    )
    
    with open("outputs/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
        print("✅ Scaler saved to outputs/scaler.pkl")

    evaluate_model(model, loaders['test'], device=device)

    if args.shap:
        print("\n🔍 Running SHAP explainability...")
        run_shap(model, X_train, X_test, feature_names, device=device)

    return model


def run_tabnet(args, loaders, X_test, y_test, feature_names, X_train, X_val, y_val):
    from src.tabnet_model import build_and_train_tabnet, get_tabnet_feature_importance
    from sklearn.metrics  import roc_auc_score, classification_report
    import numpy as np

    print(f"\n🧠 Training TabNet on {args.dataset} dataset...")
    clf = build_and_train_tabnet(
        X_train, loaders['train'].dataset.y.numpy(),
        X_val,   loaders['val'].dataset.y.numpy(),
        n_features=len(feature_names)
    )

    # Evaluate
    test_probs = clf.predict_proba(X_test)[:, 1]
    test_preds = (test_probs >= 0.4).astype(int)

    print("\n" + "=" * 50)
    print(f"Test ROC-AUC  : {roc_auc_score(y_test, test_probs):.4f}")
    print(classification_report(
        y_test, test_preds,
        target_names=['Good Credit', 'Bad Credit']
    ))
    print("=" * 50)

    # Feature importance (built into TabNet — no SHAP needed)
    fi = get_tabnet_feature_importance(clf, feature_names)
    print("\n📊 TabNet Feature Importances (Top 10):")
    for feat, score in list(fi.items())[:10]:
        print(f"   {feat:35s}: {score:.4f}")

    return clf


def main():
    args   = parse_args()
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"⚙️  Device   : {device}")
    print(f"⚙️  Model    : {args.model}")
    print(f"⚙️  Dataset  : {args.dataset}")

    # ── Load data ─────────────────────────────────────────────────────────────
    loaders, X_test, y_test, scaler, feature_names, X_train, X_val, y_val = \
        load_and_preprocess(dataset=args.dataset)

    # ── Save scaler immediately after loading ─────────────────────────────────
    import pickle
    os.makedirs('outputs', exist_ok=True)
    with open('outputs/scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    print("✅ Scaler saved to outputs/scaler.pkl")

    # ── Train ─────────────────────────────────────────────────────────────────
    if args.model == 'dnn':
        trained_model = run_dnn(
            args, loaders, X_test, y_test, feature_names, X_train, device, scaler
        )
        model_type = 'dnn'
    else:
        trained_model = run_tabnet(
            args, loaders, X_test, y_test, feature_names, X_train, X_val, y_val
        )
        model_type = 'tabnet'

    # ── Fairness audit ────────────────────────────────────────────────────────
    if args.fairness:
        print("\n⚖️  Running Fairness Audit...")
        run_fairness_audit(
            X_test, y_test, feature_names,
            trained_model,
            model_type=model_type,
            device=device
        )

    print("\n✅ Pipeline complete. Outputs saved to outputs/")
    
# ── Upload artifacts to HuggingFace Hub ───────────────────────────────────
if os.getenv("HF_TOKEN") and os.getenv("HF_MODEL_REPO"):
    print("\n📤 Uploading artifacts to HuggingFace Hub...")
    from src.hf_hub import upload_artifacts
    upload_artifacts()
else:
    print("\n⚠️ HF_TOKEN or HF_MODEL_REPO not set — skipping HF upload.")
    print("   Set them in .env to enable auto-upload.")


if __name__ == '__main__':
    main()