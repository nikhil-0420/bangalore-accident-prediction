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

YEAR_COLS = ["Y2018","Y2019","Y2020","Y2021","Y2022","Y2023","Y2024","Y2025"]

# ── FIX: reconstruct the 82 genuinely-missing station-years as NaN ─────
# instead of trusting the source CSV's zero-fill. Without this, stations
# with jurisdictional gaps (e.g. JP Nagar, Kodigehalli, VV Puram, B.Pura,
# Chickpet, etc.) get "no data recorded" silently treated as "0 accidents
# happened", which drags their averages down and can flip their risk
# level to Low Risk incorrectly. See notebooks/accident_risk_ml_pipeline.ipynb
# for the full writeup — this mirrors load_and_engineer_features() there.
df = pd.read_csv(os.path.join(DATA, "final_perfect_dataset.csv"))
df[YEAR_COLS] = df[YEAR_COLS].replace(0, np.nan)

df_long = df.melt(
    id_vars   =["Station","Zone","Latitude","Longitude"],
    value_vars=YEAR_COLS,
    var_name  ="Year", value_name="Total"
)
df_long["Year"] = df_long["Year"].str.replace("Y","").astype(int)
df_long = df_long.sort_values(["Station","Year"])
df_long = df_long.dropna(subset=["Total"]).reset_index(drop=True)  # drop the 82 fake rows

df_long["Prev_Year"]   = df_long.groupby("Station")["Total"].shift(1)
df_long["Trend"]       = df_long["Total"] - df_long["Prev_Year"]
df_long["Rolling_Avg"] = df_long.groupby("Station")["Total"].rolling(2).mean().reset_index(0, drop=True)
# Only fills the legitimate first-observation NaNs (e.g. a station's
# earliest valid year has no Prev_Year) — Total itself has no NaNs left.
df_long = df_long.fillna(0)


def _station_avg_and_risk(df_long_local):
    """Per-station mean/sum computed on the NaN-corrected long data —
    mean()/sum() skip NaN automatically pre-dropna, but we've already
    dropped the fake rows above, so this is just the honest average
    over each station's REAL years."""
    summary = df_long_local.groupby("Station").agg(
        Zone=("Zone", "first"),
        Total_Avg=("Total", "mean"),
        Total_Sum=("Total", "sum"),
    ).reset_index()

    def risk(avg):
        if avg >= 70:   return "High Risk"
        elif avg >= 30: return "Medium Risk"
        else:           return "Low Risk"

    summary["Risk"] = summary["Total_Avg"].apply(risk)
    return summary


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
    if station_data.empty:
        return {"error": f"No valid historical data for '{station}'"}

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
    summary = _station_avg_and_risk(df_long)
    lat_lon = df[["Station", "Latitude", "Longitude"]].drop_duplicates()
    summary = summary.merge(lat_lon, on="Station", how="left")
    top10 = summary.nlargest(10, "Total_Sum")[
        ["Station", "Zone", "Latitude", "Longitude", "Total_Sum"]
    ].dropna()
    return {"hotspots": top10.to_dict(orient="records")}


@app.get("/stations-risk")
def get_stations_risk():
    summary = _station_avg_and_risk(df_long)
    lat_lon = df[["Station", "Latitude", "Longitude"]].drop_duplicates()
    summary = summary.merge(lat_lon, on="Station", how="left")
    result = summary[["Station", "Zone", "Latitude", "Longitude", "Total_Avg", "Risk"]].dropna()
    return {"stations": result.to_dict(orient="records")}


@app.get("/trends")
def get_trends():
    # Zone-wise yearly totals — sum() skips NaN automatically, so this
    # was already correct even before the fix, but now consistent with
    # everything else using the same NaN-aware df.
    zone_trend = df_long.pivot_table(
        index="Zone", columns="Year", values="Total", aggfunc="sum"
    ).reset_index()
    # FIX: pivot_table produces bare integer year columns (2018, 2019, ...),
    # but the frontend (TrendsPanel.jsx) looks up keys as "Y2018", "Y2019"
    # to match the raw CSV's naming convention. Without this rename, every
    # lookup silently falls back to 0 and the whole Trends page renders as
    # flat zero-lines instead of erroring — much harder to notice than a
    # crash. Rename here so the two sides actually agree.
    zone_trend.columns = ["Zone"] + [f"Y{c}" for c in zone_trend.columns if c != "Zone"]
    return {"trends": zone_trend.to_dict(orient="records")}


@app.get("/station/{station_name}")
def get_station_history(station_name: str):
    station_data = df_long[df_long["Station"] == station_name].sort_values("Year")
    if station_data.empty:
        return {"error": "Station not found"}

    history = [
        {"year": int(r["Year"]), "accidents": int(r["Total"])}
        for _, r in station_data.iterrows()
    ]
    total = int(station_data["Total"].sum())
    avg   = round(station_data["Total"].mean(), 1)
    risk  = "High Risk" if avg >= 70 else "Medium Risk" if avg >= 30 else "Low Risk"

    return {
        "station": station_name,
        "zone": station_data["Zone"].iloc[0],
        "history": history,          # NOTE: now only includes years with real data —
                                      # e.g. JP Nagar will return just {2025: 43} instead
                                      # of 8 years with 7 fake zeros. Frontend charts
                                      # that assume exactly 8 points per station need
                                      # to handle a variable-length series.
        "total": total,
        "average": avg,
        "risk": risk
    }
