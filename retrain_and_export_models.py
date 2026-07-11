"""
Retrains the production RF classifier/regressor on the corrected (N=334)
dataset and exports them to models/*.pkl for the FastAPI backend to load.

Run this from the repo root:
    python retrain_and_export_models.py

Regenerate these whenever data/final_perfect_dataset.csv changes, or
whenever the feature-engineering / tuning logic in the notebook changes.
This mirrors load_and_engineer_features() in
notebooks/accident_risk_ml_pipeline.ipynb — if you change one, change both.
"""

import os
import joblib
import numpy as np
import pandas as pd
from collections import Counter

from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import accuracy_score, f1_score, r2_score
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data", "final_perfect_dataset.csv")
MODELS_DIR = os.path.join(BASE, "models")

YEAR_COLS = ["Y2018","Y2019","Y2020","Y2021","Y2022","Y2023","Y2024","Y2025"]
FEATURES = ["Year", "Station_Enc", "Zone_Enc", "Prev_Year", "Trend", "Rolling_Avg"]


def load_and_engineer_features(path=DATA):
    df = pd.read_csv(path)
    df[YEAR_COLS] = df[YEAR_COLS].replace(0, np.nan)

    df_long = df.melt(
        id_vars=["Station", "Zone", "Latitude", "Longitude"],
        value_vars=YEAR_COLS,
        var_name="Year",
        value_name="Total"
    )
    df_long["Year"] = df_long["Year"].str.replace("Y", "", regex=False).astype(int)
    df_long = df_long.sort_values(["Station", "Year"])
    df_long = df_long.dropna(subset=["Total"]).reset_index(drop=True)

    n_valid = len(df_long)
    assert n_valid == 334, (
        f"Expected 334 valid station-years, got {n_valid}. "
        f"Check data/final_perfect_dataset.csv hasn't changed structure."
    )

    df_long["Prev_Year"]   = df_long.groupby("Station")["Total"].shift(1)
    df_long["Trend"]       = df_long["Total"] - df_long["Prev_Year"]
    df_long["Rolling_Avg"] = (df_long.groupby("Station")["Total"]
                              .rolling(2).mean().reset_index(0, drop=True))
    df_long = df_long.fillna(0)

    conditions = [
        (df_long["Total"] < 30),
        (df_long["Total"] < 70),
        (df_long["Total"] >= 70)
    ]
    labels = ["Low Risk", "Medium Risk", "High Risk"]
    df_long["Risk_Level"] = np.select(conditions, labels, default="")

    le_station = LabelEncoder()
    le_zone    = LabelEncoder()
    le_risk    = LabelEncoder()
    df_long["Station_Enc"] = le_station.fit_transform(df_long["Station"])
    df_long["Zone_Enc"]    = le_zone.fit_transform(df_long["Zone"])
    df_long["Risk_Enc"]    = le_risk.fit_transform(df_long["Risk_Level"])

    return df_long, {"station": le_station, "zone": le_zone, "risk": le_risk}


def main():
    print("Loading and engineering features...")
    df_long, encoders = load_and_engineer_features()

    X = df_long[FEATURES]
    y_reg = df_long["Total"]
    y_clf = df_long["Risk_Enc"]

    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
        X, y_reg, test_size=0.2, random_state=42
    )
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(
        X, y_clf, test_size=0.2, random_state=42, stratify=y_clf
    )

    param_grid = {
        "n_estimators":      [100, 200, 300, 500],
        "max_depth":         [None, 5, 10, 20, 30],
        "min_samples_split": [2, 5, 10],
        "min_samples_leaf":  [1, 2, 4],
        "max_features":      ["sqrt", "log2", None]
    }

    # Classifier: SMOTE inside the CV pipeline (per-fold resampling —
    # avoids the leakage you get from resampling once before CV splits).
    counter = Counter(y_train_c)
    k = min(3, min(counter.values()) - 1)
    print(f"Class distribution before SMOTE: {dict(counter)}  (k_neighbors={k})")

    clf_pipe = ImbPipeline([
        ("smote", SMOTE(random_state=42, k_neighbors=k)),
        ("clf", RandomForestClassifier(random_state=42))
    ])
    param_grid_clf = {f"clf__{p}": v for p, v in param_grid.items()}

    print("Tuning classifier...")
    search_clf = RandomizedSearchCV(
        clf_pipe, param_distributions=param_grid_clf,
        n_iter=30, scoring="f1_weighted", cv=5,
        random_state=42, n_jobs=-1
    )
    search_clf.fit(X_train_c, y_train_c)
    clf_model = search_clf.best_estimator_.named_steps["clf"]

    y_pred_c = clf_model.predict(X_test_c)
    print(f"  Test Accuracy: {accuracy_score(y_test_c, y_pred_c):.4f}")
    print(f"  Test F1:       {f1_score(y_test_c, y_pred_c, average='weighted'):.4f}")

    print("Tuning regressor...")
    search_reg = RandomizedSearchCV(
        RandomForestRegressor(random_state=42), param_distributions=param_grid,
        n_iter=30, scoring="r2", cv=5,
        random_state=42, n_jobs=-1
    )
    search_reg.fit(X_train_r, y_train_r)
    reg_model = search_reg.best_estimator_

    y_pred_r = reg_model.predict(X_test_r)
    print(f"  Test R\u00b2: {r2_score(y_test_r, y_pred_r):.4f}")

    # Refit both final models on ALL available data (train+test) for
    # production use — the held-out test set above is only for reporting
    # honest metrics, not for handicapping the deployed model.
    print("Refitting final models on full dataset for deployment...")
    clf_model_final = clf_model.__class__(**clf_model.get_params())
    clf_model_final.fit(X, y_clf)
    reg_model_final = reg_model.__class__(**reg_model.get_params())
    reg_model_final.fit(X, y_reg)

    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(clf_model_final, os.path.join(MODELS_DIR, "clf_model.pkl"))
    joblib.dump(reg_model_final, os.path.join(MODELS_DIR, "reg_model.pkl"))
    joblib.dump(encoders["station"], os.path.join(MODELS_DIR, "le_station.pkl"))
    joblib.dump(encoders["zone"], os.path.join(MODELS_DIR, "le_zone.pkl"))
    joblib.dump(encoders["risk"], os.path.join(MODELS_DIR, "le_risk.pkl"))

    print(f"\nExported to {MODELS_DIR}:")
    print("  clf_model.pkl, reg_model.pkl, le_station.pkl, le_zone.pkl, le_risk.pkl")
    print("\nHeld-out test metrics reported above are what you should quote in the")
    print("paper/README — the .pkl files themselves are refit on all 334 rows.")


if __name__ == "__main__":
    main()
