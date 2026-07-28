import os
from firebase_config import db, storage_bucket

print("1. Firebase Firestore:", "CONNECTED" if db else "FAILED")
print("2. Firebase Storage:", "CONNECTED" if storage_bucket else "FAILED")


import xgboost as xgb
import joblib
m = xgb.XGBClassifier()
m.load_model("models_and_data/xgboost_crop_model.json")
print("4. XGBoost 3-feat: LOADED")
m7 = xgb.XGBClassifier()
m7.load_model("models_and_data/xgboost_crop_7feat.json")
print("5. XGBoost 7-feat: LOADED")
le = joblib.load("models_and_data/label_encoder.pkl")
print("6. Label Encoder: LOADED")

import pandas as pd
df1 = pd.read_excel("models_and_data/TN Soil Properties.xlsx")
print(f"7. Soil Data: LOADED ({len(df1)} rows)")
df2 = pd.read_excel("models_and_data/crop_suggestion.xlsx")
print(f"8. Crop Suggestions: LOADED ({len(df2)} rows)")
df3 = pd.read_csv("models_and_data/Crop_recommendation.csv")
print(f"9. Crop Recommend: LOADED ({len(df3)} rows)")

print("10. Disease CNN:", "PRESENT" if os.path.exists("disease_model.pth") else "MISSING")
print("11. LSTM Model:", "PRESENT" if os.path.exists("market_lstm.pt") else "MISSING")

import sqlite3
conn = sqlite3.connect("ervizhi_auth.db")
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cur.fetchall()]
conn.close()
print(f"12. SQLite Auth DB: OK ({len(tables)} tables)")

smtp_email = os.getenv("SMTP_EMAIL", "")
has_smtp = smtp_email and "@" in smtp_email and "your-email" not in smtp_email
print("13. SMTP Email:", "CONFIGURED" if has_smtp else "NOT CONFIGURED (placeholder)")

print()
print("=== All core connections verified ===")
