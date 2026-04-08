"""
Bankly AI Backend — FastAPI
Loads REAL trained models from models/ directory.
Endpoints wire directly to fraud_model.pkl and advisor_model.pkl.

Run:
  pip install fastapi uvicorn scikit-learn pandas numpy joblib
  uvicorn main:app --reload --port 8001

Docs: http://localhost:8001/docs
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
import numpy as np
import joblib
import json
import os
from datetime import datetime

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Bankly AI",
    description="Fraud detection (GradientBoosting AUC 0.9964) + Spending advisor (RandomForest 100%)",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE       = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE, "models")
DATA_DIR   = os.path.join(BASE, "data")

# ─── Load Models on Startup ───────────────────────────────────────────────────
_M = {}

def load_models():
    global _M
    required = [
        "fraud_model.pkl", "advisor_model.pkl",
        "label_encoder_category.pkl", "label_encoder_type.pkl",
        "category_stats.pkl", "feature_names.pkl",
    ]
    missing = [f for f in required if not os.path.exists(os.path.join(MODELS_DIR, f))]
    if missing:
        print(f"⚠️  Missing model files: {missing}")
        print("   Run: python scripts/train_models.py")
        return False

    _M["fraud"]    = joblib.load(os.path.join(MODELS_DIR, "fraud_model.pkl"))
    _M["advisor"]  = joblib.load(os.path.join(MODELS_DIR, "advisor_model.pkl"))
    _M["le_cat"]   = joblib.load(os.path.join(MODELS_DIR, "label_encoder_category.pkl"))
    _M["le_type"]  = joblib.load(os.path.join(MODELS_DIR, "label_encoder_type.pkl"))
    _M["cat_stats"]= joblib.load(os.path.join(MODELS_DIR, "category_stats.pkl"))
    _M["features"] = joblib.load(os.path.join(MODELS_DIR, "feature_names.pkl"))

    with open(os.path.join(DATA_DIR, "analytics.json")) as f:
        _M["analytics"] = json.load(f)

    print(f"✅ Models loaded — Fraud AUC: {_M['analytics']['model_metrics']['fraud_auc']} | Advisor: {_M['analytics']['model_metrics']['advisor_accuracy']}")
    return True

@app.on_event("startup")
def startup():
    load_models()

# ─── Helpers ──────────────────────────────────────────────────────────────────
CATEGORIES = [
    "Food & Drink", "Utilities", "Rent", "Investment", "Shopping",
    "Entertainment", "Health & Fitness", "Travel", "Salary", "Other"
]

def build_features(amount: float, category: str, tx_type: str,
                   day_of_week: int = 1, day_of_month: int = 15, month_num: int = 6) -> np.ndarray:
    """Build feature vector matching training schema."""
    cat = category if category in CATEGORIES else "Other"
    try:
        cat_enc  = _M["le_cat"].transform([cat])[0]
    except:
        cat_enc  = 0
    try:
        type_enc = _M["le_type"].transform([tx_type])[0]
    except:
        type_enc = 0

    stats     = _M["cat_stats"].get(cat, {"mean": 1307.52, "std": 982.28})
    cat_mean  = stats["mean"]
    cat_std   = stats["std"]

    # Must match training FEATURES order:
    # ['Amount','cat_enc','type_enc','DayOfWeek','DayOfMonth','MonthNum','cat_mean','cat_std']
    return np.array([[amount, cat_enc, type_enc, day_of_week, day_of_month, month_num, cat_mean, cat_std]])

def models_loaded():
    return "fraud" in _M and "advisor" in _M

# ─── Schemas ──────────────────────────────────────────────────────────────────
class Transaction(BaseModel):
    amount:           float = Field(..., gt=0, description="Transaction amount in GHS")
    category:         str   = Field("Shopping")
    transaction_type: Literal["Income", "Expense"] = "Expense"
    day_of_week:      Optional[int] = Field(1, ge=0, le=6)
    day_of_month:     Optional[int] = Field(15, ge=1, le=31)
    month_num:        Optional[int] = Field(6, ge=1, le=12)
    description:      Optional[str] = ""

class BatchRequest(BaseModel):
    transactions: List[Transaction] = Field(..., min_items=1, max_items=100)

# ─── Fraud Detection ──────────────────────────────────────────────────────────
@app.post("/fraud/detect", tags=["Fraud Detection"])
def detect_fraud(tx: Transaction):
    """
    Score a transaction using the trained GradientBoosting model.
    Returns fraud_score (0–1), risk_level, z_score, and recommendation.
    """
    if not models_loaded():
        raise HTTPException(503, "Models not loaded. Run: python scripts/train_models.py")

    features = build_features(
        tx.amount, tx.category, tx.transaction_type,
        tx.day_of_week, tx.day_of_month, tx.month_num
    )

    fraud_score = float(_M["fraud"].predict_proba(features)[0][1])
    is_fraud    = fraud_score > 0.5
    risk        = "HIGH" if fraud_score > 0.7 else "MEDIUM" if fraud_score > 0.4 else "LOW"

    stats   = _M["cat_stats"].get(tx.category, {"mean": 1307.52, "std": 982.28})
    z_score = round((tx.amount - stats["mean"]) / (stats["std"] + 1e-9), 3)

    rec = {
        "HIGH":   f"🚨 Block transaction. ₵{tx.amount:,.2f} is highly anomalous for {tx.category}. Send OTP verification.",
        "MEDIUM": f"⚠️  Flag for review. ₵{tx.amount:,.2f} is above average for {tx.category}.",
        "LOW":    f"✅ Transaction looks normal. ₵{tx.amount:,.2f} is within expected range for {tx.category}.",
    }[risk]

    return {
        "fraud_score":    round(fraud_score, 4),
        "risk_level":     risk,
        "is_suspicious":  is_fraud,
        "z_score":        z_score,
        "category_mean":  stats["mean"],
        "category_std":   stats["std"],
        "recommendation": rec,
        "model":          _M["analytics"]["model_metrics"]["fraud_model"],
        "model_auc":      _M["analytics"]["model_metrics"]["fraud_auc"],
        "analyzed_at":    datetime.now().isoformat(),
    }

@app.post("/fraud/batch", tags=["Fraud Detection"])
def detect_fraud_batch(batch: BatchRequest):
    """Score up to 100 transactions at once."""
    results, flagged = [], 0
    for tx in batch.transactions:
        try:
            r = detect_fraud(tx)
            results.append({**r, "transaction": tx.dict()})
            if r["is_suspicious"]: flagged += 1
        except Exception as e:
            results.append({"error": str(e), "transaction": tx.dict()})
    return {"total": len(results), "flagged": flagged, "clean": len(results) - flagged, "results": results}

# ─── Financial Advisor ────────────────────────────────────────────────────────
@app.post("/advisor/categorize", tags=["Advisor"])
def categorize(tx: Transaction):
    """
    Predict spending category using the trained RandomForest model.
    Returns predicted category + budget comparison + tip.
    """
    if not models_loaded():
        raise HTTPException(503, "Models not loaded.")

    features     = build_features(tx.amount, tx.category, tx.transaction_type,
                                  tx.day_of_week, tx.day_of_month, tx.month_num)
    pred_enc     = _M["advisor"].predict(features)[0]
    pred_cat     = _M["le_cat"].inverse_transform([pred_enc])[0]
    confidence   = float(max(_M["advisor"].predict_proba(features)[0]))

    BUDGET_LIMITS = {
        "Groceries": 150, "Restaurants": 150, "Shopping": 100, "Entertainment": 25,
        "Utilities": 150, "Gas & Fuel": 75, "Coffee Shops": 15, "Fast Food": 15,
        "Mortgage & Rent": 1100, "Food & Drink": 200, "Health & Fitness": 100,
    }
    limit   = BUDGET_LIMITS.get(pred_cat, BUDGET_LIMITS.get(tx.category, 1000))
    over    = tx.amount > limit
    stats   = _M["cat_stats"].get(pred_cat, _M["cat_stats"].get(tx.category, {"mean": 1000, "std": 500}))
    z       = round((tx.amount - stats["mean"]) / (stats["std"] + 1e-9), 3)

    tip = (
        f"⚠️ ₵{tx.amount:.2f} exceeds your {pred_cat} budget by ₵{tx.amount - limit:.2f}."
        if over else
        f"✅ ₵{tx.amount:.2f} is ₵{limit - tx.amount:.2f} under your {pred_cat} budget. Good job!"
    )

    return {
        "input_category":     tx.category,
        "predicted_category": pred_cat,
        "confidence":         round(confidence, 4),
        "budget_limit":       limit,
        "amount":             tx.amount,
        "status":             "OVER_BUDGET" if over else "WITHIN_BUDGET",
        "z_score":            z,
        "tip":                tip,
        "model":              _M["analytics"]["model_metrics"]["advisor_model"],
        "model_accuracy":     _M["analytics"]["model_metrics"]["advisor_accuracy"],
    }

@app.post("/advisor/analyze", tags=["Advisor"])
def analyze_batch(batch: BatchRequest):
    """Analyze multiple transactions and return a full spending report."""
    if not models_loaded():
        raise HTTPException(503, "Models not loaded.")

    category_totals = {}
    predictions     = []

    for tx in batch.transactions:
        r = categorize(tx)
        predictions.append(r)
        cat = r["predicted_category"]
        category_totals[cat] = round(category_totals.get(cat, 0) + tx.amount, 2)

    # Budget alerts
    BUDGET_LIMITS = {"Shopping": 100, "Entertainment": 25, "Utilities": 150,
                     "Food & Drink": 200, "Health & Fitness": 100, "Rent": 1100}
    alerts = []
    for cat, total in category_totals.items():
        limit = BUDGET_LIMITS.get(cat)
        if limit and total > limit:
            alerts.append({"category": cat, "spent": total, "budget": limit,
                           "over_by": round(total - limit, 2), "pct_used": round(total / limit * 100, 1)})

    return {
        "total_transactions":  len(batch.transactions),
        "category_totals":     category_totals,
        "budget_alerts":       alerts,
        "ai_tips": [
            f"💡 You're over budget in {len(alerts)} categories." if alerts else "✅ All spending within budget.",
            "📈 Redirect 10% of monthly income to Databank index funds for ₵8K+ growth.",
            "📱 Use MTN MoMo auto-debit for ECG bills — saves ~₵300/year in fees.",
        ],
        "predictions": predictions,
    }

# ─── Analytics ────────────────────────────────────────────────────────────────
@app.get("/analytics/full", tags=["Analytics"])
def analytics_full():
    if not _M.get("analytics"):
        raise HTTPException(503, "Analytics not available. Run train_models.py first.")
    return _M["analytics"]

@app.get("/analytics/summary", tags=["Analytics"])
def analytics_summary():
    if not _M.get("analytics"):
        raise HTTPException(503, "Run train_models.py first.")
    return _M["analytics"]["stats"]

@app.get("/analytics/cashflow", tags=["Analytics"])
def analytics_cashflow():
    if not _M.get("analytics"):
        raise HTTPException(503, "Run train_models.py first.")
    return {"cashflow": _M["analytics"]["cashflow"]}

@app.get("/analytics/insights", tags=["Analytics"])
def analytics_insights():
    if not _M.get("analytics"):
        raise HTTPException(503, "Run train_models.py first.")
    return {
        "ai_insights": [
            {"type":"alert",   "icon":"🚨", "title":"Overspending Alert",      "message":"Expenses exceeded income by ₵78,403 in 2024. Travel (₵40,314) is your #1 spend category."},
            {"type":"tip",     "icon":"💡", "title":"Cut Entertainment",        "message":"Entertainment is 208% over budget. Cancel unused subscriptions → save ₵600+/month."},
            {"type":"success", "icon":"✅", "title":"Best Month: September",    "message":"Sep 2024: income ₵19,948 vs expenses ₵19,383 — nearly balanced!"},
            {"type":"invest",  "icon":"📈", "title":"Investment Opportunity",   "message":"10% of monthly income in Databank index funds → ₵8,000+ over 3 years."},
            {"type":"tip",     "icon":"🏦", "title":"MoMo Optimization",        "message":"Auto-debit ECG/utilities via MTN MoMo — saves ~₵300/year in card fees."},
        ],
        "categories":     _M["analytics"]["categories"],
        "model_metrics":  _M["analytics"]["model_metrics"],
        "anomalies_2024": _M["analytics"]["stats"]["anomalies_detected"],
    }

@app.get("/analytics/transactions", tags=["Analytics"])
def analytics_transactions():
    if not _M.get("analytics"):
        raise HTTPException(503, "Run train_models.py first.")
    return {"transactions": _M["analytics"]["recent_transactions"]}

# ─── System ───────────────────────────────────────────────────────────────────
@app.get("/", tags=["System"])
def root():
    return {
        "service": "Bankly AI API v2.1",
        "models_loaded": models_loaded(),
        "fraud_auc":     _M.get("analytics", {}).get("model_metrics", {}).get("fraud_auc", "not trained"),
        "advisor_acc":   _M.get("analytics", {}).get("model_metrics", {}).get("advisor_accuracy", "not trained"),
        "docs": "/docs",
    }

@app.get("/health", tags=["System"])
def health():
    return {
        "status":        "healthy" if models_loaded() else "models_not_loaded",
        "models": {
            "fraud_model":   "fraud"   in _M,
            "advisor_model": "advisor" in _M,
            "analytics":     "analytics" in _M,
        },
        "timestamp": datetime.now().isoformat(),
    }

@app.post("/models/reload", tags=["System"])
def reload():
    ok = load_models()
    return {"success": ok, "message": "Models reloaded." if ok else "Failed — run train_models.py first."}

@app.get("/categories", tags=["System"])
def categories():
    return {"categories": CATEGORIES, "category_stats": _M.get("cat_stats", {})}
