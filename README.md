<div align="center">

# 🚦 Bangalore Accident Risk Predictor

### Predicting Road Accident Hotspots Across Bangalore Using Machine Learning &amp; Explainable AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://bangalore-accident-prediction.vercel.app/)
[![API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://bangalore-accident-prediction-api.onrender.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[**Live App**](https://bangalore-accident-prediction.vercel.app/) · [**API Docs**](https://bangalore-accident-prediction-api.onrender.com/docs) · [**Report Bug**](https://github.com/nikhil-0420/bangalore-accident-prediction/issues)

</div>

📌 Overview
Road traffic accidents remain a major public safety challenge in Bangalore, with station-wise crash data covering 52 police station jurisdictions from 2018 to 2025.

This project builds a complete end-to-end machine learning system that:

Predicts the expected number of accidents at a station for a given year

Classifies each station-year as Low / Medium / High Risk

Explains predictions using SHAP

Visualizes hotspots, trends, and model performance in a live full-stack dashboard

Unlike a static notebook project, this system is deployed as a working application with a FastAPI backend on Render and a React frontend on Vercel.

⚠️ Note: The backend runs on Render's free tier and may take 20–30 seconds to wake up on the first request.

🖥️ Dashboard Preview
Landing View
Hotspot Analytics View
The dashboard includes:

Predict — estimate accident count, risk level, confidence, and class probabilities

Model Stats — compare Random Forest, XGBoost, and Decision Tree across key metrics

Trends — analyze year-wise zone trends with COVID-19 impact interpretation

Hotspots — explore an interactive Leaflet map with risk-colored station markers and station-level detail panels

✨ Features
Feature	Description
🔍 Risk Prediction Engine	Select any station and year to get predicted accident count, risk level, confidence, and class probabilities
📊 Model Analytics	Side-by-side comparison of Random Forest, XGBoost, and Decision Tree using multiple evaluation metrics
📈 Trend Analysis	8-year zone-wise trends, COVID-19 impact analysis, zone-vs-zone comparison, and year-over-year change tracking
🗺️ Interactive Hotspot Map	Dark-themed Leaflet map with risk-colored markers, station history view, and distribution breakdown
🧠 Explainable AI	SHAP-based feature importance validated against Pearson correlation
⚖️ Class Balancing	SMOTE applied to correct the original 1.61 class imbalance ratio
🎛️ Hyperparameter Tuning	RandomizedSearchCV with 5-fold cross-validation
🏗️ Tech Stack
Machine Learning

Python · pandas · NumPy · scikit-learn · XGBoost

SHAP · imbalanced-learn (SMOTE)

geopy · Folium

Backend

FastAPI · Uvicorn · Joblib

Deployed on Render

Frontend

React 18 + Vite

Tailwind CSS · Recharts · React Leaflet · Axios

Deployed on Vercel

📐 Architecture



📊 Model Performance
Classification (Risk Level — Low / Medium / High)
Model	Accuracy	Precision	Recall	F1 Score
Random Forest (final, tuned)	0.7976	0.78	0.77	0.799
XGBoost	0.7857	0.7953	0.7857	0.7883
Decision Tree	0.7738	0.7812	0.7738	0.7758
Regression (Annual Accident Count)
Model	R²	RMSE	MAE
Random Forest (final, tuned)	0.859	23.56	13.06
XGBoost	0.8259	24.66	10.22
Decision Tree	0.7554	29.23	13.30
Top Predictive Features (SHAP × Pearson Correlation)
Feature	SHAP Importance	Pearson Correlation
2-Year Rolling Average	Highest	+0.750
Previous Year Accidents	2nd Highest	+0.634
Year-on-Year Trend	3rd	+0.169
Both explainability methods independently indicate that a station’s recent accident history is the strongest predictor of future risk.

🚀 Getting Started
Prerequisites
Python 3.10+

Node.js 18+

1. Clone the repository
bash
git clone https://github.com/nikhil-0420/bangalore-accident-prediction.git
cd bangalore-accident-prediction
2. Backend setup
bash
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cd backend
uvicorn main:app --reload
Backend runs at http://localhost:8000
Docs at http://localhost:8000/docs

3. Frontend setup
bash
cd frontend
npm install
npm run dev
Frontend runs at http://localhost:5173

4. Environment variables
Create frontend/.env.local:

text
VITE_API_URL=http://localhost:8000
📂 Project Structure
text
bangalore-accident-prediction/
├── assets/
│   ├── hero-preview.png
│   └── hotspots-preview.png
├── backend/
│   └── main.py
├── data/
│   └── final_perfect_dataset.csv
├── models/
│   ├── clf_model.pkl
│   ├── reg_model.pkl
│   ├── le_station.pkl
│   ├── le_zone.pkl
│   └── le_risk.pkl
├── notebooks/
│   └── accident_risk_ml_pipeline.ipynb
├── frontend/
│   └── src/
│       ├── components/
│       └── hooks/
├── requirements.txt
└── README.md
🔬 Methodology Highlights
Data Collection — Station-wise crash records (2018–2025) from Open City India, geocoded using Nominatim

Feature Engineering — Year, Station, Zone, Previous Year Accidents, Year-on-Year Trend, and 2-Year Rolling Average

Class Balancing — SMOTE applied only to the training split to correct imbalance

Model Comparison — Random Forest, XGBoost, and Decision Tree evaluated on identical splits

Hyperparameter Tuning — RandomizedSearchCV with 30 iterations and 5-fold cross-validation

Explainability — SHAP TreeExplainer combined with Pearson correlation analysis

Geospatial Analysis — Risk mapping, hotspot ranking, and COVID-19 impact interpretation

🎯 Key Findings
A station’s recent accident history is a much stronger predictor of future risk than its zone or station label

A clear COVID-19 dip appears across zones in 2020–2021, followed by recovery in 2023–2024

After SMOTE correction, classification performance becomes a more honest 79.8%, instead of an inflated result on imbalanced data

🔮 Future Work
Add weather, traffic volume, and road infrastructure features

Move from annual to monthly or quarterly resolution

Explore sequence models such as LSTM or Temporal CNNs

Extend the system to accident severity prediction

Generalize the pipeline to other Indian metro cities

👤 Author
Guddanti Nikhil Srinivas
B.Tech AI & Data Science · Alliance University, Bengaluru
📧 nikhil.guddanti@gmail.com

GitHub · LinkedIn

📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

⭐ If you found this project interesting, consider giving it a star.