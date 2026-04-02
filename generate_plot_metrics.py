import os
import sys
import json
import numpy as np
import pandas as pd
import torch
import pickle
from sklearn.metrics import roc_curve, precision_recall_curve

# Ensure we can import your model from the src directory
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

DEFAULT_CREDIT_FEATURES = [
    "LIMIT_BAL", "SEX", "EDUCATION", "MARRIAGE", "AGE",
    "PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6",
    "BILL_AMT1", "BILL_AMT2", "BILL_AMT3", "BILL_AMT4", "BILL_AMT5", "BILL_AMT6",
    "PAY_AMT1", "PAY_AMT2", "PAY_AMT3", "PAY_AMT4", "PAY_AMT5", "PAY_AMT6"
]

def try_generate_real_metrics():
    try:
        from src.model import CreditRiskDNN
        
        try:
            from ucimlrepo import fetch_ucirepo
        except ImportError:
            raise ImportError("Please install ucimlrepo by running: pip install ucimlrepo")

        # 1. Fetch data directly from UCI API (ID 350 is "Default of Credit Card Clients")
        print("🌐 Fetching Taiwan Credit Card dataset from UCI API (ID: 350)...")
        dataset = fetch_ucirepo(id=350)
        
        if dataset.data is None or dataset.data.original is None:
            raise ValueError("Failed to fetch complete data from UCI repository.")
        
        # Grab the entire dataframe (features + targets + ids)
        df = dataset.data.original.copy()
        
        # 2. Aggressive Column Standardization
        df.columns = [str(c).upper().strip() for c in df.columns]
        
        # UCI often returns X1 through X23 for this specific dataset via the API
        if 'X1' in df.columns and 'LIMIT_BAL' not in df.columns:
            print("🔄 Remapping X1-X23 to actual feature names...")
            x_mapping = {f"X{i+1}": feat for i, feat in enumerate(DEFAULT_CREDIT_FEATURES)}
            df = df.rename(columns=x_mapping)

        # Fix known typos from UCI
        rename_map = {
            'PAY_1': 'PAY_0',
            'DEFAULT.PAYMENT.NEXT.MONTH': 'TARGET',
            'DEFAULT PAYMENT NEXT MONTH': 'TARGET',
            'Y': 'TARGET',
            'BILL_AAMT1': 'BILL_AMT1'
        }
        df = df.rename(columns=rename_map)
        
        # If TARGET is still not found, assume the last column is the target
        if 'TARGET' not in df.columns:
            target_candidate = df.columns[-1]
            df = df.rename(columns={target_candidate: 'TARGET'})

        print(f"📊 Dataset loaded and standardized. Shape: {df.shape}")

        # Ensure all required features exist
        missing_cols = [col for col in DEFAULT_CREDIT_FEATURES if col not in df.columns]
        if missing_cols:
            raise KeyError(f"Missing required columns after standardization: {missing_cols}\nAvailable: {df.columns.tolist()}")

        target_col = 'TARGET'

        # --- Data Demographics ---
        paid = int((df[target_col] == 0).sum())
        defaulted = int((df[target_col] == 1).sum())
        class_balance = [
            {"name": "Low Risk (Paid)", "value": paid, "fill": "#10b981"},
            {"name": "High Risk (Default)", "value": defaulted, "fill": "#ef4444"}
        ]

        edu_map = {1: "Grad School", 2: "University", 3: "High School"}
        edu_data = []
        if "EDUCATION" in df.columns:
            for val, name in edu_map.items():
                mask = df["EDUCATION"] == val
                edu_data.append({
                    "level": name,
                    "Paid": int((df[mask][target_col] == 0).sum()),
                    "Defaulted": int((df[mask][target_col] == 1).sum())
                })
            mask = ~df["EDUCATION"].isin([1, 2, 3])
            edu_data.append({
                "level": "Others",
                "Paid": int((df[mask][target_col] == 0).sum()),
                "Defaulted": int((df[mask][target_col] == 1).sum())
            })

        # --- Model Evaluation (ROC, PR, Attention) ---
        model_path = os.path.join("outputs", "best_model.pth")
        scaler_path = os.path.join("outputs", "scaler.pkl")

        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Model or scaler not found in {os.path.abspath('outputs')}")

        print("🧠 Loading PyTorch Model and Scaler...")
        with open(scaler_path, "rb") as f:
            scaler = pickle.load(f)

        model = CreditRiskDNN(n_features=len(DEFAULT_CREDIT_FEATURES), dropout=0.3)
        model.load_state_dict(torch.load(model_path, map_location="cpu"))
        model.eval()
        torch.set_num_threads(1)

        # Prepare strictly typed features
        # Drop rows with NaN values in the required columns just in case
        df = df.dropna(subset=DEFAULT_CREDIT_FEATURES + [target_col])
        
        X_raw = np.array(df[DEFAULT_CREDIT_FEATURES].values, dtype=float)
        y_true = np.array(df[target_col].values, dtype=float)
        
        if len(X_raw) > 10000:
            np.random.seed(42)
            idx = np.random.choice(len(X_raw), 10000, replace=False)
            X_raw = X_raw[idx]
            y_true = y_true[idx]

        # Scale and convert to Tensor
        X_scaled = scaler.transform(X_raw)
        X_tensor = torch.tensor(X_scaled, dtype=torch.float32)

        print("⚙️ Running model inference to calculate curves...")
        with torch.no_grad():
            logits, attn_weights = model(X_tensor)
            probs = np.array(torch.sigmoid(logits).squeeze().numpy(), dtype=float)
            avg_attn = np.array(attn_weights.squeeze().mean(dim=0).numpy(), dtype=float)

        # Calculate ROC using the strictly typed float arrays
        fpr, tpr, _ = roc_curve(y_true, probs)
        step_roc = max(1, len(fpr) // 80)
        roc_data = [{"fpr": round(float(f), 4), "tpr": round(float(t), 4)} for f, t in zip(fpr[::step_roc], tpr[::step_roc])]

        # Calculate Precision-Recall
        precision, recall, _ = precision_recall_curve(y_true, probs)
        step_pr = max(1, len(recall) // 80)
        pr_data = [{"recall": round(float(r), 4), "precision": round(float(p), 4)} for r, p in zip(recall[::step_pr], precision[::step_pr])]
        pr_data.reverse()

        # Map attention weights to features
        feature_importance = [
            {"feature": feat, "weight": round(float(weight), 4)}
            for feat, weight in zip(DEFAULT_CREDIT_FEATURES, avg_attn)
        ]
        feature_importance = sorted(feature_importance, key=lambda x: x["weight"], reverse=True)[:10]

        print("✅ Real metrics successfully extracted from model!")
        return {
            "roc_curve": roc_data,
            "pr_curve": pr_data,
            "feature_importance": feature_importance,
            "class_balance": class_balance,
            "education_data": edu_data
        }

    except Exception as e:
        print(f"⚠️ Script failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

def main():
    output_dir = os.path.join("credit-risk-frontend", "public", "plots")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "metrics.json")

    metrics_payload = try_generate_real_metrics()

    with open(output_file, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"🎉 JSON successfully written to: {output_file}")

if __name__ == "__main__":
    main()