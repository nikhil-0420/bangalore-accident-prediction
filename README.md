# 🚦 Bangalore Accident Risk Predictor

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0-orange)](https://xgboost.readthedocs.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack ML web application that predicts accident risk zones across Bangalore
using historical traffic incident data. Built with FastAPI + React, powered by
XGBoost classification and regression models.

## 🌐 Live Demo
- **Frontend:** https://bangalore-accident-predictor.vercel.app
- **API Docs:** https://bangalore-accident-api.onrender.com/docs

## 🏗️ Architecture
React + Vite (Vercel) → FastAPI (Render) → XGBoost + SHAP models

## 🛠️ Tech Stack
**Backend:** Python, FastAPI, XGBoost, scikit-learn, SHAP, pandas, numpy, joblib, folium, geopy

**Frontend:** React 18, Vite, Tailwind CSS, Recharts, React Leaflet, Axios

## 📁 Project Structure
\\\
bangalore-accident-prediction/
├── data/                        # Dataset
├── models/                      # Trained .pkl files
├── notebooks/                   # Jupyter EDA + training
├── backend/main.py              # FastAPI app
├── frontend/                    # React + Vite app
├── requirements.txt
└── .gitignore
\\\

## 🚀 Local Setup

### Backend
\\\ash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
\\\

### Frontend
\\\ash
cd frontend
npm install
npm run dev
\\\

## 👨‍💻 Author
**Nikhil** — B.Tech AI & Data Science, Alliance University Bengaluru
GitHub: [@nikhil-0420](https://github.com/nikhil-0420)

## 📄 License
MIT License
