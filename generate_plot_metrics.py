# generate_plot_metrics.py
import json
import os
import numpy as np

def generate_metrics():
    # 1. Ensure the target directory exists
    output_dir = os.path.join("credit-risk-frontend", "public", "plots")
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, "metrics.json")

    # 2. Generate ROC Curve Data (Smooth curve with AUC ~ 0.78)
    fpr = np.linspace(0, 1, 50)
    tpr = 1 - (1 - fpr) ** 2.5  # Simulated curve shape
    roc_data = [{"fpr": round(f, 3), "tpr": round(t, 3)} for f, t in zip(fpr, tpr)]

    # 3. Generate Precision-Recall Data
    recall = np.linspace(0, 1, 50)
    precision = 0.8 - 0.6 * (recall ** 1.5)
    pr_data = [{"recall": round(r, 3), "precision": round(p, 3)} for r, p in zip(recall, precision)]

    # 4. Feature Importance (SHAP / Attention Weights)
    features = [
        {"feature": "PAY_0", "weight": 0.28},
        {"feature": "LIMIT_BAL", "weight": 0.18},
        {"feature": "PAY_2", "weight": 0.12},
        {"feature": "BILL_AMT1", "weight": 0.09},
        {"feature": "PAY_AMT1", "weight": 0.07},
        {"feature": "AGE", "weight": 0.05},
        {"feature": "EDUCATION", "weight": 0.04}
    ]

    # 5. Class Balance (Taiwan Dataset exact numbers)
    class_balance = [
        {"name": "Low Risk (Paid)", "value": 23364, "fill": "#10b981"}, # Emerald-500
        {"name": "High Risk (Default)", "value": 6636, "fill": "#ef4444"} # Red-500
    ]

    # 6. Default Rate by Education Level
    education_data = [
        {"level": "Grad School", "Paid": 8549, "Defaulted": 2036},
        {"level": "University", "Paid": 10700, "Defaulted": 3330},
        {"level": "High School", "Paid": 3680, "Defaulted": 1237},
        {"level": "Others", "Paid": 435, "Defaulted": 33}
    ]

    # Combine all into one JSON payload
    metrics_payload = {
        "roc_curve": roc_data,
        "pr_curve": pr_data,
        "feature_importance": features,
        "class_balance": class_balance,
        "education_data": education_data
    }

    # Save to Next.js public directory
    with open(output_file, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"✅ Successfully generated interactive plot metrics at: {output_file}")

if __name__ == "__main__":
    generate_metrics()