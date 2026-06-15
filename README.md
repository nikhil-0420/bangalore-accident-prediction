<div align="center">

# 🚦 Bangalore Accident Risk Predictor

### Predicting Road Accident Hotspots Across Bangalore Using Machine Learning &amp; Explainable AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://bangalore-accident-prediction-ozzfafkp3.vercel.app/)
[![API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://bangalore-accident-prediction-api.onrender.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[**Live App**](https://bangalore-accident-prediction-ozzfafkp3.vercel.app/) · [**API Docs**](https://bangalore-accident-prediction-api.onrender.com/docs) · [**Report Bug**](https://github.com/nikhil-0420/bangalore-accident-prediction/issues)

</div>

---

## 📌 Overview

Road traffic accidents are a major public safety challenge in Bangalore, with crash data spanning **52 police station jurisdictions** from **2018 to 2025**. This project builds a complete, end-to-end machine learning system that:

- Predicts the **expected number of accidents** at any station for a given year (regression)
- Classifies each station-year as **Low / Medium / High Risk** (classification)
- Explains *why* the model makes each prediction using **SHAP**
- Visualizes results on an **interactive dark-themed dashboard** with geospatial mapping

The project goes beyond a static notebook — it's deployed as a **live full-stack web application** with a Python/FastAPI backend and a React frontend.

> ⚠️ **Note:** The backend runs on Render's free tier, which sleeps after inactivity. The first request may take 20–30 seconds to wake up.

---

## ✨ Features

| | |
|---|---|
| 🔍 **Risk Prediction Engine** | Select any station + year → get predicted accident count, risk level, confidence %, and class probabilities |
| 📊 **Model Analytics** | Side-by-side comparison of Random Forest, XGBoost, and Decision Tree across 7 metrics with radar charts |
| 📈 **Trend Analysis** | 8-year zone-wise trends, COVID-19 impact analysis, zone-vs-zone comparison, year-over-year change tracking |
| 🗺️ **Interactive Hotspot Map** | Dark-themed Leaflet map with risk-colored markers, click-to-expand station history, risk distribution donut chart |
| 🧠 **Explainable AI** | SHAP feature importance validated against Pearson correlation |
| ⚖️ **Class Balancing** | SMOTE applied to correct a 1.61 class imbalance ratio |
| 🎛️ **Hyperparameter Tuning** | RandomizedSearchCV with 5-fold cross-validation |

---

## 🏗️ Tech Stack

**Machine Learning**
- Python · pandas · NumPy · scikit-learn · XGBoost
- SHAP (explainability) · imbalanced-learn (SMOTE)
- geopy (geocoding) · Folium (initial geospatial exploration)

**Backend**
- FastAPI · Uvicorn · Joblib (model serialization)
- Deployed on Render

**Frontend**
- React 18 + Vite
- Tailwind CSS · Recharts · React Leaflet · Axios
- Deployed on Vercel

---

## 📐 Architecture

```
Open City India Dataset (2018–2025, 52 stations)
            │
            ▼
  Data Cleaning & Feature Engineering
  (Prev_Year, Trend, 2-Year Rolling Avg)
            │
            ▼
  ┌─────────────────────┬──────────────────────┐
  │   Regression Task    │  Classification Task  │
  │  (Accident Count)    │    (Risk Level)        │
  └─────────────────────┴──────────────────────┘
            │
            ▼
  Random Forest · XGBoost · Decision Tree
  + SMOTE + RandomizedSearchCV
            │
            ▼
  SHAP Explainability + Correlation Validation
            │
            ▼
  ┌─────────────────────┐      ┌──────────────────────┐
  │  FastAPI Backend     │ ───▶ │  React Frontend       │
  │  (Render)            │      │  (Vercel)             │
  └─────────────────────┘      └──────────────────────┘
```

---

## 📊 Model Performance

### Classification (Risk Level — Low / Medium / High)

| Model | Accuracy | Precision | Recall | F1 Score |
|---|:---:|:---:|:---:|:---:|
| **Random Forest** *(final, tuned)* | 0.7976 | 0.78 | 0.77 | **0.799** |
| XGBoost | 0.7857 | 0.7953 | 0.7857 | 0.7883 |
| Decision Tree | 0.7738 | 0.7812 | 0.7738 | 0.7758 |

### Regression (Annual Accident Count)

| Model | R² | RMSE | MAE |
|---|:---:|:---:|:---:|
| **Random Forest** *(final, tuned)* | **0.859** | 23.56 | 13.06 |
| XGBoost | 0.8259 | 24.66 | 10.22 |
| Decision Tree | 0.7554 | 29.23 | 13.30 |

### Top Predictive Features (SHAP × Pearson Correlation)

| Feature | SHAP Importance | Pearson Correlation |
|---|:---:|:---:|
| 2-Year Rolling Average | Highest | +0.750 |
| Previous Year Accidents | 2nd Highest | +0.634 |
| Year-on-Year Trend | 3rd | +0.169 |

> Both explainability methods independently agree: **a station's own recent accident history** is by far the strongest predictor of future risk — far more than its location, zone, or the calendar year.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone the repository

```bash
git clone https://github.com/nikhil-0420/bangalore-accident-prediction.git
cd bangalore-accident-prediction
```

### 2. Backend setup

```bash
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

cd backend
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000` · Docs at `http://localhost:8000/docs`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Environment variables

Create `frontend/.env.local`:

```
VITE_API_URL=http://localhost:8000
```

---

## 📂 Project Structure

```
bangalore-accident-prediction/
├── backend/
│   └── main.py              # FastAPI app — prediction, stats, trends, hotspot endpoints
├── data/
│   └── final_perfect_dataset.csv
├── models/
│   ├── clf_model.pkl        # Tuned Random Forest classifier
│   ├── reg_model.pkl        # Tuned Random Forest regressor
│   ├── le_station.pkl
│   ├── le_zone.pkl
│   └── le_risk.pkl
├── notebooks/
│   └── FDSProject_Clean.ipynb   # Full ML pipeline: EDA → modeling → SHAP → SMOTE → tuning
├── frontend/
│   └── src/
│       ├── components/      # Hero, Predict, Stats, Trends, Hotspots panels
│       └── hooks/
└── requirements.txt
```

---

## 🔬 Methodology Highlights

1. **Data** — Station-wise crash records (2018–2025) from [Open City India](https://data.opencity.in/dataset/bengaluru-road-crashes-data), geocoded via Nominatim
2. **Feature Engineering** — Year, Station, Zone, Previous Year Accidents, Year-on-Year Trend, 2-Year Rolling Average
3. **Class Balancing** — SMOTE applied to training data only (imbalance ratio 1.61 → balanced)
4. **Model Comparison** — Random Forest, XGBoost, and Decision Tree evaluated on identical train/test splits
5. **Hyperparameter Tuning** — RandomizedSearchCV (30 iterations, 5-fold CV) on the best baseline model
6. **Explainability** — SHAP TreeExplainer for both regression and classification, cross-validated with Pearson correlation
7. **Geospatial Analysis** — Risk-level mapping, hotspot ranking, and COVID-19 impact analysis (2020–2021 dip, 2023–2024 recovery)

---

## 🎯 Key Findings

- A station's **own recent accident history** (2-year rolling average) is the single strongest predictor of future risk — stronger than its geographic zone or station identity
- A clear **COVID-19 dip** is visible across all zones in 2020–2021, with most zones exceeding pre-pandemic levels by 2023–2024
- After SMOTE correction, classification accuracy is a more honest **79.8%** (vs. an inflated 85.7% on imbalanced data)

---

## 🔮 Future Work

- Incorporate weather, traffic volume, and road infrastructure data
- Monthly/quarterly temporal resolution to capture seasonal patterns
- LSTM/Temporal Convolutional Networks for sequence modeling
- Accident severity prediction (not just frequency)
- Extend the pipeline to other Indian metropolitan cities

---

## 👤 Author

**Guddanti Nikhil Srinivas**
B.Tech AI &amp; Data Science · Alliance University, Bengaluru

[GitHub](https://github.com/nikhil-0420) · [LinkedIn](https://linkedin.com/in/nikhil-srinivas-55a130337)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ If you found this project interesting, consider giving it a star!**

</div>
