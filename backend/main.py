from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os

app = FastAPI(title="Bangalore Accident Prediction API")

# ── CORS (allows React frontend to call this API) ─────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Models ───────────────────────────────────────────────
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.path.join(BASE, "models")
DATA   = os.path.join(BASE, "data")

clf_model  = joblib.load(os.path.join(MODELS, "clf_model.pkl"))
reg_model  = joblib.load(os.path.join(MODELS, "reg_model.pkl"))
le_station = joblib.load(os.path.join(MODELS, "le_station.pkl"))
le_zone    = joblib.load(os.path.join(MODELS, "le_zone.pkl"))
le_risk    = joblib.load(os.path.join(MODELS, "le_risk.pkl"))

df      = pd.read_csv(os.path.join(DATA, "final_perfect_dataset.csv"))
df_long = df.melt(
    id_vars   =["Station","Zone","Latitude","Longitude"],
    value_vars =["Y2018","Y2019","Y2020","Y2021","Y2022","Y2023","Y2024","Y2025"],
    var_name  ="Year", value_name="Total"
)
df_long["Year"] = df_long["Year"].str.replace("Y","").astype(int)
df_long = df_long.sort_values(["Station","Year"])
df_long["Prev_Year"]   = df_long.groupby("Station")["Total"].shift(1).fillna(0)
df_long["Trend"]       = df_long["Total"] - df_long["Prev_Year"]
df_long["Rolling_Avg"] = df_long.groupby("Station")["Total"].rolling(2).mean().reset_index(0,drop=True).fillna(0)

# ── Request Schema ────────────────────────────────────────────
class PredictRequest(BaseModel):
    station: str
    year: int

# ── Routes ────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Bangalore Accident Prediction API is running!"}

@app.get("/stations")
def get_stations():
    return {"stations": sorted(df["Station"].unique().tolist())}

@app.post("/predict")
def predict(req: PredictRequest):
    station = req.station
    year    = req.year

    if station not in df["Station"].values:
        return {"error": f"Station '{station}' not found"}

    station_enc = le_station.transform([station])[0]
    zone_name   = df[df["Station"] == station]["Zone"].iloc[0]
    zone_enc    = le_zone.transform([zone_name])[0]

    station_data = df_long[df_long["Station"] == station].sort_values("Year")
    last_row     = station_data.iloc[-1]
    prev_year    = float(last_row["Total"])
    trend        = float(last_row["Total"] - station_data.iloc[-2]["Total"]) \
                   if len(station_data) > 1 else 0
    rolling_avg  = float(station_data["Total"].tail(2).mean())

    user_data = pd.DataFrame({
        "Year":        [year],
        "Station_Enc": [station_enc],
        "Zone_Enc":    [zone_enc],
        "Prev_Year":   [prev_year],
        "Trend":       [trend],
        "Rolling_Avg": [rolling_avg]
    })

    predicted_count = int(reg_model.predict(user_data)[0])
    proba           = clf_model.predict_proba(user_data)[0]
    class_names     = le_risk.classes_.tolist()
    pred_idx        = int(np.argmax(proba))
    pred_label      = class_names[pred_idx]
    confidence      = round(float(proba[pred_idx]) * 100, 1)

    probabilities = {
        label: round(float(prob) * 100, 1)
        for label, prob in zip(class_names, proba)
    }

    return {
        "station":           station,
        "zone":              zone_name,
        "year":              year,
        "predicted_count":   predicted_count,
        "predicted_risk":    pred_label,
        "confidence":        confidence,
        "probabilities":     probabilities
    }

@app.get("/hotspots")
def get_hotspots():
    year_cols = ["Y2018","Y2019","Y2020","Y2021","Y2022","Y2023","Y2024","Y2025"]
    df["Total_Sum"] = df[year_cols].sum(axis=1)
    top10 = df.nlargest(10, "Total_Sum")[
        ["Station","Zone","Latitude","Longitude","Total_Sum"]
    ].dropna()
    return {"hotspots": top10.to_dict(orient="records")}

@app.get("/stations-risk")
def get_stations_risk():
    year_cols = ["Y2018","Y2019","Y2020","Y2021","Y2022","Y2023","Y2024","Y2025"]
    df["Total_Avg"] = df[year_cols].mean(axis=1)

    def risk(avg):
        if avg >= 70:   return "High Risk"
        elif avg >= 30: return "Medium Risk"
        else:           return "Low Risk"

    df["Risk"] = df["Total_Avg"].apply(risk)
    result = df[["Station","Zone","Latitude","Longitude","Total_Avg","Risk"]].dropna()
    return {"stations": result.to_dict(orient="records")}

@app.get("/trends")
def get_trends():
    year_cols = ["Y2018","Y2019","Y2020","Y2021","Y2022","Y2023","Y2024","Y2025"]
    zone_trend = df.groupby("Zone")[year_cols].sum().reset_index()
    return {"trends": zone_trend.to_dict(orient="records")}

@app.get("/station/{station_name}")
def get_station_history(station_name: str):
    year_cols = ["Y2018","Y2019","Y2020","Y2021","Y2022","Y2023","Y2024","Y2025"]
    station_data = df[df["Station"] == station_name]
    if station_data.empty:
        return {"error": "Station not found"}
    row = station_data.iloc[0]
    history = [{"year": int(col.replace("Y","")), "accidents": int(row[col])} for col in year_cols]
    total = sum(int(row[col]) for col in year_cols)
    avg = round(total / len(year_cols), 1)
    risk = "High Risk" if avg >= 70 else "Medium Risk" if avg >= 30 else "Low Risk"
    return {
        "station": station_name,
        "zone": row["Zone"],
        "history": history,
        "total": total,
        "average": avg,
        "risk": risk
    }