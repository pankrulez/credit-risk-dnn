import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import streamlit as st
import torch
import numpy as np
import requests
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

from src.model import CreditRiskDNN
from src.config import Config

# ── Config ─────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Credit Risk Assessor",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ── Resolve API URL at startup ─────────────────────────────────────────────────
API_URL, API_SOURCE = Config.get_api_url()

# Show connection status in sidebar
def render_api_status():
    if API_SOURCE == "render":
        st.sidebar.success(f"🟢 API: Render (Cloud)")
        st.sidebar.caption(API_URL)
    else:
        st.sidebar.warning(f"🟡 API: Localhost (Dev)")
        st.sidebar.caption(API_URL)
        st.sidebar.caption("Set RENDER_API_URL in .env for production")

FEATURE_NAMES = [
    "LIMIT_BAL","SEX","EDUCATION","MARRIAGE","AGE",
    "PAY_0","PAY_2","PAY_3","PAY_4","PAY_5","PAY_6",
    "BILL_AMT1","BILL_AMT2","BILL_AMT3","BILL_AMT4","BILL_AMT5","BILL_AMT6",
    "PAY_AMT1","PAY_AMT2","PAY_AMT3","PAY_AMT4","PAY_AMT5","PAY_AMT6",
]
N_FEATURES = len(FEATURE_NAMES)

# ── Load local model (fallback when no API_URL) ────────────────────────────────
@st.cache_resource(show_spinner="Loading model weights...")
def load_local_model():
    model = CreditRiskDNN(n_features=N_FEATURES, dropout=0.3)
    weights_path = os.path.join(
        os.path.dirname(__file__), '..', 'outputs', 'best_model.pth'
    )
    model.load_state_dict(torch.load(weights_path, map_location='cpu'))
    model.eval()
    return model


def predict_local(model, features: list, threshold: float = 0.4):
    X = torch.tensor([features], dtype=torch.float32)
    with torch.no_grad():
        logit, attn_weights = model(X)
        prob  = torch.sigmoid(logit).item()
        attn  = attn_weights.squeeze().numpy()
    top5_idx  = attn.argsort()[-5:][::-1]
    top_feats = {FEATURE_NAMES[i]: round(float(attn[i]), 4) for i in top5_idx}
    return prob, top_feats


def predict_api(features: list, threshold: float = 0.4):
    """Try API first; silently fall back to local model if unreachable."""
    try:
        resp = requests.post(
            f"{API_URL}/predict",
            json={"features": features, "threshold": threshold},
            timeout=8
        )
        resp.raise_for_status()
        data = resp.json()
        return (
            data['risk_probability'],
            data['top_attention_features'],
            API_SOURCE   # 'render' or 'localhost'
        )
    except requests.exceptions.ConnectionError:
        st.toast("⚠️ API unreachable — using local model", icon="⚠️")
        return *predict_local(load_local_model(), features, threshold), "local"
    except requests.exceptions.Timeout:
        st.toast("⚠️ API timeout — using local model", icon="⏱️")
        return *predict_local(load_local_model(), features, threshold), "local"


# ── Sidebar ────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.title("🏦 Credit Risk DNN")
    render_api_status()
    st.divider()
    threshold = st.slider(
        "Decision Threshold", 0.2, 0.7,
        Config.DECISION_THRESHOLD, 0.05
    )
    st.divider()
    if Config.DEBUG:
        st.caption(f"ENV: {Config.APP_ENV} | v{Config.MODEL_VERSION}")

# ── Tabs ───────────────────────────────────────────────────────────────────────
tab1, tab2, tab3 = st.tabs([
    "🔍 Risk Assessment", "📊 Model Insights", "⚖️ Fairness Audit"
])


# ── Tab 1: Risk Assessment ─────────────────────────────────────────────────────
with tab1:
    st.header("Applicant Credit Risk Assessment")
    st.markdown("Fill in the applicant's profile to get an instant risk prediction.")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.subheader("👤 Demographics")
        limit_bal = st.number_input("Credit Limit (NT$)", 10000, 800000, 200000, 10000)
        age       = st.slider("Age", 18, 75, 35)
        sex       = st.selectbox("Gender", options=[1, 2],
                                  format_func=lambda x: "Male" if x == 1 else "Female")
        education = st.selectbox("Education",
                                  options=[1, 2, 3, 4],
                                  format_func=lambda x: {
                                      1: "Graduate School", 2: "University",
                                      3: "High School", 4: "Other"
                                  }[x])
        marriage  = st.selectbox("Marital Status",
                                  options=[1, 2, 3],
                                  format_func=lambda x: {
                                      1: "Married", 2: "Single", 3: "Other"
                                  }[x])

    with col2:
        st.subheader("📅 Repayment Status (months)")
        st.caption("-2=No consumption, -1=Paid duly, 1–9=Delay by N months")
        pay_0 = st.slider("Sep (most recent)", -2, 9, -1)
        pay_2 = st.slider("Aug", -2, 9, -1)
        pay_3 = st.slider("Jul", -2, 9, -1)
        pay_4 = st.slider("Jun", -2, 9, -1)
        pay_5 = st.slider("May", -2, 9, -1)
        pay_6 = st.slider("Apr", -2, 9, -1)

    with col3:
        st.subheader("💳 Financials")
        bill1 = st.number_input("Bill Sep (NT$)", 0, 1000000, 50000, 5000)
        bill2 = st.number_input("Bill Aug (NT$)", 0, 1000000, 48000, 5000)
        bill3 = st.number_input("Bill Jul (NT$)", 0, 1000000, 45000, 5000)
        bill4 = st.number_input("Bill Jun (NT$)", 0, 1000000, 43000, 5000)
        bill5 = st.number_input("Bill May (NT$)", 0, 1000000, 41000, 5000)
        bill6 = st.number_input("Bill Apr (NT$)", 0, 1000000, 40000, 5000)
        pay_a1 = st.number_input("Paid Sep (NT$)", 0, 500000, 5000, 1000)
        pay_a2 = st.number_input("Paid Aug (NT$)", 0, 500000, 5000, 1000)
        pay_a3 = st.number_input("Paid Jul (NT$)", 0, 500000, 5000, 1000)
        pay_a4 = st.number_input("Paid Jun (NT$)", 0, 500000, 5000, 1000)
        pay_a5 = st.number_input("Paid May (NT$)", 0, 500000, 5000, 1000)
        pay_a6 = st.number_input("Paid Apr (NT$)", 0, 500000, 5000, 1000)

    # ── Raw feature vector (unscaled — user-friendly values) ──────────────────
    raw_features = [
        limit_bal, sex, education, marriage, age,
        pay_0, pay_2, pay_3, pay_4, pay_5, pay_6,
        bill1, bill2, bill3, bill4, bill5, bill6,
        pay_a1, pay_a2, pay_a3, pay_a4, pay_a5, pay_a6
    ]

    # ── Predict button ─────────────────────────────────────────────────────────
    st.divider()
    if st.button("🔍 Assess Credit Risk", use_container_width=True, type="primary"):
        with st.spinner("Analyzing applicant profile..."):
            try:
                # Normalize raw features manually (demo-level scaling)
                feat_arr = np.array(raw_features, dtype=np.float32)
                # Use simple z-score per-feature ranges (approximate)
                # In production, serialize and load the fitted StandardScaler
                means = np.array([
                    167484, 1.6, 1.85, 1.55, 35.5,
                    -0.02, -0.13, -0.17, -0.22, -0.27, -0.29,
                    49179, 47013, 43263, 40311, 38871, 36949,
                    5663, 5921, 5226, 4826, 4799, 5215
                ])
                stds = np.array([
                    129747, 0.49, 0.79, 0.52, 9.2,
                    1.12, 1.20, 1.20, 1.17, 1.14, 1.15,
                    73635, 71173, 67731, 64332, 60797, 59554,
                    16563, 23040, 17606, 15666, 15277, 17777
                ])
                scaled = ((feat_arr - means) / (stds + 1e-8)).tolist()

                if API_URL:
                    prob, top_feats, _ = predict_api(scaled, threshold)
                else:
                    model = load_local_model()
                    prob, top_feats = predict_local(model, scaled, threshold)

                # ── Result display ─────────────────────────────────────────
                res_col1, res_col2 = st.columns([1, 2])

                with res_col1:
                    risk_score = int(round(prob * 100))
                    color = "🔴" if prob >= threshold else "🟢"
                    label = "HIGH RISK" if prob >= threshold else "LOW RISK"
                    st.metric("Risk Probability", f"{prob:.1%}")
                    st.metric("Risk Score", f"{risk_score}/100")
                    st.markdown(f"### {color} {label}")
                    st.caption(f"Threshold: {threshold}")

                with res_col2:
                    st.subheader("🧠 Top Influential Features (Attention Weights)")
                    for feat, score in top_feats.items():
                        st.progress(
                            min(float(score) * 5, 1.0),
                            text=f"{feat}: {score:.4f}"
                        )

            except FileNotFoundError:
                st.error(
                    "⚠️ Model weights not found. "
                    "Run `python main.py --model dnn --dataset default` first."
                )
            except requests.exceptions.ConnectionError:
                st.error(f"⚠️ Cannot reach API at {API_URL}. Check your API_URL.")
            except Exception as e:
                st.error(f"Prediction error: {e}")


# ── Tab 2: Model Insights ──────────────────────────────────────────────────────
with tab2:
    st.header("Model Performance & Explainability")

    eval_path  = "outputs/evaluation_plots.png"
    shap_path  = "outputs/shap_summary.png"
    water_path = "outputs/shap_waterfall.png"

    if os.path.exists(eval_path):
        st.subheader("📈 Evaluation Metrics")
        st.image(eval_path, use_container_width=True)
    else:
        st.info("Run `python main.py --model dnn --dataset default` to generate evaluation plots.")

    col_s1, col_s2 = st.columns(2)
    with col_s1:
        if os.path.exists(shap_path):
            st.subheader("🔍 SHAP Global Feature Importance")
            st.image(shap_path, use_container_width=True)
        else:
            st.info("Run with `--shap` flag to generate SHAP plots.")
    with col_s2:
        if os.path.exists(water_path):
            st.subheader("💧 SHAP Waterfall (Single Prediction)")
            st.image(water_path, use_container_width=True)

    st.subheader("🏗️ Model Architecture")
    st.code("""
CreditRiskDNN(
  (attention): FeatureAttention(
    (attn): Sequential(Linear(23→23), Tanh, Linear(23→23), Sigmoid)
  )
  (encoder): Sequential(
    Linear(23→128), BatchNorm1d(128), ReLU, Dropout(0.3),
    Linear(128→64),  BatchNorm1d(64),  ReLU, Dropout(0.3),
    Linear(64→32),   BatchNorm1d(32),  ReLU
  )
  (classifier): Linear(32→1)
)
Total Parameters: ~23,000
    """, language="text")


# ── Tab 3: Fairness Audit ──────────────────────────────────────────────────────
with tab3:
    st.header("⚖️ Model Fairness Audit")
    st.markdown(
        "Fairness analysis across **age groups** — ensuring the model "
        "does not systematically discriminate against any demographic."
    )

    fairness_path = "outputs/fairness_audit.png"
    if os.path.exists(fairness_path):
        st.image(fairness_path, use_container_width=True)

        st.subheader("📋 Fairness Metrics Explained")
        col_f1, col_f2 = st.columns(2)
        with col_f1:
            st.info(
                "**Demographic Parity Difference**\n\n"
                "Measures whether the model approves loans at similar rates "
                "across age groups. Ideal value = 0."
            )
        with col_f2:
            st.warning(
                "**Equalized Odds Difference**\n\n"
                "Checks if True Positive Rate and False Positive Rate are "
                "similar across groups. Values > 0.1 indicate bias."
            )
    else:
        st.info(
            "Run `python main.py --fairness` to generate the fairness audit report."
        )
        st.markdown("""
        **What gets audited:**
        - Approval rates by age group (Young / Middle / Senior)
        - True positive rate (correctly flagged defaults) per group
        - False positive rate (wrongly flagged good credits) per group
        - Demographic parity difference
        - Equalized odds difference
        """)