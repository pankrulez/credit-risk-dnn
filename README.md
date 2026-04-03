# 🏦 Credit Risk Analysis & Explainability Dashboard

<!-- CI/CD & Deployment Badges -->
[![CI/CD Build](https://img.shields.io/github/actions/workflow/status/pankrulez/credit-risk-dnn/main.yml?style=for-the-badge&logo=github-actions&label=Build+%26+Test)](https://github.com/pankrulez/credit-risk-dnn/actions)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Backend Deployment](https://img.shields.io/badge/Render-Live-46E3B7?style=for-the-badge&logo=render)](https://render.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A stunning, mobile-first web application powered by a custom Deep Neural Network (DNN) to predict credit card default risk. Built using the famous **Taiwan Credit Card Default Dataset (UCI ID: 350)**, this project bridges the gap between complex Machine Learning models and intuitive, premium user interfaces.

![Dashboard Preview](https://via.placeholder.com/1200x600/1c1b19/38b2ac?text=Dashboard+Preview+Screenshot)

## ✨ Key Features

- 🧠 **Deep Neural Network Inference**: Predicts the probability of default based on 23 distinct financial and demographic features.
- 🔍 **Explainable AI (XAI)**: Features a custom PyTorch Attention Mechanism that highlights *why* a specific prediction was made (e.g., heavily weighting recent late payments), utilizing SHAP-inspired global interpretations.
- 📱 **Mobile-First Responsive Design**: Fluid grid layouts, glassmorphic hover effects, and staggered entry animations built with pure Tailwind CSS.
- 📊 **Interactive Analytics**: Beautiful, responsive charts built with Recharts to visualize ROC curves, Precision-Recall curves, and global feature importance.
- 📁 **Batch Scoring**: Upload a CSV file via drag-and-drop to run inference on thousands of clients simultaneously, complete with dynamic result visualizations.

## 🏗️ Architecture & ML Workflow

The application follows a modern decoupled MLOps architecture and pipeline:

1. **Data Ingestion**: Raw data is dynamically fetched from the UCI ML Repository API.
2. **Preprocessing**: Data is standardized using `scikit-learn`'s StandardScaler to prevent exploding gradients during inference.
3. **Training & Regularization**: The custom PyTorch DNN is trained using Dropout and early stopping to prevent overfitting.
4. **Model Server (Backend)**: A Python FastAPI application loads the serialized `.pth` model and `scaler.pkl` to expose high-speed inference endpoints.
5. **Client UI (Frontend)**: A Next.js application handles user input, batch CSV processing, and renders dynamic XAI insights using beautiful CSS animations.

## 🗄️ The Dataset

This project utilizes the **Default of Credit Card Clients Dataset** from the UCI Machine Learning Repository [1]. The dataset represents the 2005 Taiwanese cash and credit card debt crisis [2]. 
- **Total Records:** 30,000
- **Features:** 23 (Demographics, Payment History across 6 months, and Bill Amounts)
- **Target Variable:** Default Payment Next Month (Yes/No)

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- Python 3.9+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/pankrulez/credit-risk-dnn.git
cd credit-risk-dnn
```

### 2. Setup the Python Backend (FastAPI + PyTorch)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*The API will start running on `http://localhost:10000`*

### 3. Setup the Next.js Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The web app will be available at `http://localhost:3000`*

## 🔮 Exploring the UI

- **Project Overview**: A high-level summary of the dataset and model architecture.
- **ML Pipeline**: An interactive CSS-animated timeline of how data flows through the system.
- **Data Overview**: Donut and bar charts exploring the demographics of the 30k clients.
- **Make Prediction**: A 23-input form that provides real-time default probability and local feature explainability.
- **Batch Scoring**: Drag-and-drop functionality to process hundreds of records and view aggregate risk demographics.
- **Model Insights**: Global evaluation metrics including ROC, PR Curves, and SHAP-inspired feature importance.

## 👨‍💻 Author

**Pankaj Kapri**  
*Data Scientist & AI Enthusiast*  
Focusing on end-to-end Machine Learning solutions, Explainable AI (XAI), and modern UI integrations.

- [LinkedIn](https://www.linkedin.com/in/pankajkapri/)
- [GitHub](https://github.com/pankrulez)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
## 📚 References

1. Yeh, I. C., & Lien, C. H. (2009). *The comparisons of data mining techniques for the predictive accuracy of probability of default of credit card clients*. Expert Systems with Applications, 36(2), 2473-2480.
2. Chou, R. (2006). *The Credit Card Debt Crisis in Taiwan*. Financial Regulation and Analysis.
3. Bussmann, N., Giudici, P., Marinelli, D., & Papenbrock, J. (2020). *Explainable AI in Fintech Risk Management*. Frontiers in Artificial Intelligence, 3. 