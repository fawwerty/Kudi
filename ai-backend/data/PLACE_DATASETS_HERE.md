# Kudi AI — Data Directory

## ⚠️ Drop your datasets here before training

Place the following files in this folder:

| File | Description | Required |
|------|-------------|----------|
| `Personal_Finance_Dataset.csv` | 1,500 personal finance transactions (2020–2024) | ✅ Yes |
| `Budget.csv` | 19 category budget limits | ✅ Yes |
| `creditcard_2023.csv` | 324MB credit card fraud dataset from Kaggle | 🔵 Optional (enhances fraud model) |

## analytics.json

`analytics.json` is **auto-generated** by `scripts/train_models.py` — do not edit manually.

## After placing datasets, run:

```bash
cd bankly/ai-backend
python scripts/train_models.py
```

This produces:
- `models/fraud_model.pkl`
- `models/advisor_model.pkl`
- `models/label_encoder_*.pkl`
- `models/category_stats.pkl`
- `data/analytics.json`
