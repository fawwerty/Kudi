"""
Bankly AI — Model Training Pipeline
Trains:
  1. XGBoost  → fraud_model.pkl      (anomaly detection)
  2. RandomForest → advisor_model.pkl (spending categorization)
  3. Generates analytics.json        (dashboard cache)

Usage:
  python scripts/train_models.py
  python scripts/train_models.py --no-lightgbm   (skip lightgbm)
"""

import pandas as pd
import numpy as np
import json
import joblib
import os
import sys
import argparse
from datetime import datetime

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE       = os.path.dirname(os.path.dirname(__file__))
DATA_DIR   = os.path.join(BASE, "data")
MODELS_DIR = os.path.join(BASE, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

FINANCE_CSV = os.path.join(DATA_DIR, "Personal_Finance_Dataset.csv")
BUDGET_CSV  = os.path.join(DATA_DIR, "Budget.csv")

def log(msg): print(f"  {msg}")

# ─── 1. Load & Engineer Features ─────────────────────────────────────────────
print("\n📊 STEP 1: Loading datasets...")
df     = pd.read_csv(FINANCE_CSV)
budget = pd.read_csv(BUDGET_CSV)

df["Date"]       = pd.to_datetime(df["Date"])
df["Month"]      = df["Date"].dt.to_period("M").astype(str)
df["Year"]       = df["Date"].dt.year
df["DayOfWeek"]  = df["Date"].dt.dayofweek
df["DayOfMonth"] = df["Date"].dt.day
df["MonthNum"]   = df["Date"].dt.month

log(f"✓ {len(df):,} transactions | {df['Category'].nunique()} categories | {df['Year'].min()}–{df['Year'].max()}")

print("\n🔧 STEP 2: Feature engineering...")

from sklearn.preprocessing import LabelEncoder

le_cat  = LabelEncoder()
le_type = LabelEncoder()
df["cat_encoded"]  = le_cat.fit_transform(df["Category"])
df["type_encoded"] = le_type.fit_transform(df["Type"])

# Rolling statistics per category
df_sorted = df.sort_values("Date").copy()
for win in [5, 15]:
    df_sorted[f"roll_mean_{win}"] = (
        df_sorted.groupby("Category")["Amount"]
        .transform(lambda x: x.rolling(win, min_periods=1).mean())
    )
    df_sorted[f"roll_std_{win}"] = (
        df_sorted.groupby("Category")["Amount"]
        .transform(lambda x: x.rolling(win, min_periods=1).std().fillna(0))
    )

# Anomaly label: z-score > 2.5 within rolling window
df_sorted["z_score"] = (
    (df_sorted["Amount"] - df_sorted["roll_mean_15"])
    / (df_sorted["roll_std_15"] + 1e-9)
)
df_sorted["is_anomaly"] = (df_sorted["z_score"] > 2.5).astype(int)
log(f"✓ {df_sorted['is_anomaly'].sum()} anomalies labeled ({df_sorted['is_anomaly'].mean()*100:.1f}%)")

FEATURES = [
    "Amount", "cat_encoded", "type_encoded",
    "DayOfWeek", "DayOfMonth", "MonthNum",
    "roll_mean_5", "roll_std_5", "roll_mean_15", "roll_std_15"
]

X          = df_sorted[FEATURES]
y_anomaly  = df_sorted["is_anomaly"]
y_category = df_sorted["cat_encoded"]

# ─── 2. Train/Test Split ──────────────────────────────────────────────────────
from sklearn.model_selection import train_test_split

X_tr, X_te, ya_tr, ya_te = train_test_split(X, y_anomaly,  test_size=0.2, random_state=42)
_,    _,    yc_tr, yc_te = train_test_split(X, y_category, test_size=0.2, random_state=42)

# ─── 3. Fraud Detection Model ─────────────────────────────────────────────────
print("\n🤖 STEP 3: Training Fraud Detection Model...")

try:
    from xgboost import XGBClassifier
    fraud_model = XGBClassifier(
        n_estimators=200, max_depth=5, learning_rate=0.05,
        subsample=0.8, colsample_bytree=0.8,
        scale_pos_weight=(ya_tr==0).sum()/max((ya_tr==1).sum(),1),
        use_label_encoder=False, eval_metric="logloss",
        random_state=42, n_jobs=-1
    )
    log("Using XGBoost")
except ImportError:
    try:
        from lightgbm import LGBMClassifier
        fraud_model = LGBMClassifier(
            n_estimators=200, max_depth=5, learning_rate=0.05,
            class_weight="balanced", random_state=42, n_jobs=-1, verbose=-1
        )
        log("XGBoost not found — using LightGBM")
    except ImportError:
        from sklearn.ensemble import GradientBoostingClassifier
        fraud_model = GradientBoostingClassifier(n_estimators=150, max_depth=4, random_state=42)
        log("Fallback: GradientBoosting")

fraud_model.fit(X_tr, ya_tr)

from sklearn.metrics import classification_report, roc_auc_score
ya_pred = fraud_model.predict(X_te)
try:
    auc = roc_auc_score(ya_te, fraud_model.predict_proba(X_te)[:,1])
    log(f"✓ Fraud model AUC: {auc:.4f}")
except Exception:
    auc = 0.0
    log("AUC calculation skipped")

# ─── 4. Spending Advisor Model ────────────────────────────────────────────────
print("\n🧠 STEP 4: Training Spending Advisor Model...")

try:
    from lightgbm import LGBMClassifier
    advisor_model = LGBMClassifier(
        n_estimators=300, max_depth=8, learning_rate=0.05,
        class_weight="balanced", random_state=42, n_jobs=-1, verbose=-1
    )
    advisor_name = "LightGBM"
except ImportError:
    from sklearn.ensemble import RandomForestClassifier
    advisor_model = RandomForestClassifier(
        n_estimators=300, max_depth=12, class_weight="balanced",
        random_state=42, n_jobs=-1
    )
    advisor_name = "RandomForest"

log(f"Using {advisor_name}")
advisor_model.fit(X_tr, yc_tr)
advisor_acc = advisor_model.score(X_te, yc_te)
log(f"✓ Advisor accuracy: {advisor_acc:.4f}")

# ─── 5. Save Models ───────────────────────────────────────────────────────────
print("\n💾 STEP 5: Saving models...")
joblib.dump(fraud_model,   os.path.join(MODELS_DIR, "fraud_model.pkl"))
joblib.dump(advisor_model, os.path.join(MODELS_DIR, "advisor_model.pkl"))
joblib.dump(le_cat,        os.path.join(MODELS_DIR, "label_encoder_category.pkl"))
joblib.dump(le_type,       os.path.join(MODELS_DIR, "label_encoder_type.pkl"))
log("✓ All models saved to models/")

# ─── 6. Generate Analytics JSON ───────────────────────────────────────────────
print("\n📈 STEP 6: Generating analytics cache...")

df24 = df[df["Year"]==2024]
monthly = df24.groupby(["Month","Type"])["Amount"].sum().unstack(fill_value=0).reset_index()
monthly.columns.name = None

cat_exp = df24[df24["Type"]=="Expense"].groupby("Category")["Amount"].sum().round(2)
total_in  = round(df24[df24["Type"]=="Income"]["Amount"].sum(), 2)
total_ex  = round(df24[df24["Type"]=="Expense"]["Amount"].sum(), 2)

MONTH_LABELS = {"01":"Jan","02":"Feb","03":"Mar","04":"Apr","05":"May","06":"Jun",
                "07":"Jul","08":"Aug","09":"Sep","10":"Oct","11":"Nov","12":"Dec"}
cashflow = []
for _, r in monthly.iterrows():
    mo = r["Month"][-2:]
    cashflow.append({
        "month":   MONTH_LABELS.get(mo, mo),
        "income":  round(r.get("Income", 0), 0),
        "expense": round(r.get("Expense", 0), 0)
    })

cats = [{"name":k,"value":int(v)} for k,v in cat_exp.sort_values(ascending=False).items()]
recent = df.sort_values("Date", ascending=False).head(10).copy()
recent["Date"] = recent["Date"].dt.strftime("%b %d, %Y")
txs = [{"date":r.Date,"desc":r["Transaction Description"][:40],"category":r.Category,"amount":round(r.Amount,2),"type":r.Type.lower()} for _,r in recent.iterrows()]

analytics = {
    "stats": {
        "total_income":       total_in,
        "total_expense":      total_ex,
        "net_savings":        round(total_in - total_ex, 2),
        "savings_rate_pct":   round((total_in - total_ex)/max(total_in,1)*100, 1),
        "total_transactions": len(df24),
        "anomalies_detected": int(df_sorted[df_sorted["Year"]==2024]["is_anomaly"].sum()),
    },
    "cashflow":             cashflow,
    "categories":           cats,
    "recent_transactions":  txs,
    "budget": [{"category":r.Category,"budget":r.Budget} for _,r in budget.iterrows()],
    "model_metrics": {
        "fraud_auc":        round(auc, 4),
        "advisor_accuracy": round(advisor_acc, 4),
        "fraud_model":      fraud_model.__class__.__name__,
        "advisor_model":    advisor_model.__class__.__name__,
    },
    "generated_at": datetime.now().isoformat(),
}

out = os.path.join(DATA_DIR, "analytics.json")
with open(out, "w") as f:
    json.dump(analytics, f, indent=2)
log(f"✓ Analytics saved → {out}")

print("\n" + "═"*50)
print("🎉 TRAINING COMPLETE!")
print("═"*50)
print(f"   Fraud Model AUC  : {auc:.4f}")
print(f"   Advisor Accuracy : {advisor_acc:.4f}")
print(f"   Anomalies found  : {analytics['stats']['anomalies_detected']}")
print(f"   Models saved to  : {MODELS_DIR}/")
print("\nNext step:")
print("  uvicorn main:app --reload --port 8001\n")
