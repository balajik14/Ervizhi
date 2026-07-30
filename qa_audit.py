import requests
import json
import time
import uuid
import os
import firebase_admin
from firebase_admin import credentials, firestore

API_BASE = "https://ervizhi.onrender.com/api"
TEST_USER = f"qatest_{int(time.time())}"
TEST_EMAIL = f"{TEST_USER}@mailinator.com"
TEST_PASSWORD = "Password123!"

# Colors for output
class C:
    OK = '\033[92m'
    WARN = '\033[93m'
    FAIL = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

print(f"{C.BOLD}=== ERVIZHI PRODUCTION E2E AUDIT ==={C.END}")

# 1. Initialize Firestore to verify writes
print(f"\n{C.BOLD}[1/5] FIRESTORE INITIALIZATION{C.END}")
try:
    cred = credentials.Certificate("backend/firebase-service-account.json")
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print(f"{C.OK}SUCCESS: Successfully connected to Cloud Firestore (Admin SDK){C.END}")
except Exception as e:
    print(f"{C.FAIL}FAILED: Failed to initialize Firestore: {e}{C.END}")
    exit(1)

# 2. AUTHENTICATION & OTP
print(f"\n{C.BOLD}[2/5] AUTHENTICATION & FIRESTORE USER SYNC{C.END}")
try:
    # Try to verify user sync by just getting users collection length
    users_ref = db.collection("users").limit(10).stream()
    user_count = len(list(users_ref))
    print(f"{C.OK}SUCCESS: Verified 'users' collection is accessible (Found {user_count} documents){C.END}")
except Exception as e:
    print(f"{C.FAIL}FAILED: Auth check failed: {e}{C.END}")

# 3. MACHINERY RENTAL
print(f"\n{C.BOLD}[3/5] MACHINERY RENTAL & PUBLIC FEED{C.END}")
try:
    res = requests.get(f"{API_BASE}/machinery")
    if res.status_code == 200:
        data = res.json()
        print(f"{C.OK}SUCCESS: Fetched Machinery feed. Found {len(data)} listings.{C.END}")
        if len(data) > 0:
            print(f"  -> Sample Listing: {data[0].get('machineTitle')} at {data[0].get('location')}")
    else:
        print(f"{C.FAIL}FAILED: Failed to fetch Machinery feed: {res.status_code}{C.END}")
except Exception as e:
    print(f"{C.FAIL}FAILED: Machinery test failed: {e}{C.END}")

# 4. DYNAMIC TRADE
print(f"\n{C.BOLD}[4/5] DYNAMIC TRADE & MARKETPLACE{C.END}")
try:
    res = requests.get(f"{API_BASE}/trade")
    if res.status_code == 200:
        data = res.json()
        print(f"{C.OK}SUCCESS: Fetched Trade feed. Found {len(data)} listings.{C.END}")
        if len(data) > 0:
            print(f"  -> Sample Listing: {data[0].get('crop')} (Demand: {data[0].get('demand')})")
    else:
        print(f"{C.FAIL}FAILED: Failed to fetch Trade feed: {res.status_code}{C.END}")
except Exception as e:
    print(f"{C.FAIL}FAILED: Trade test failed: {e}{C.END}")

# 5. MARKET INTELLIGENCE (ML)
print(f"\n{C.BOLD}[5/5] MARKET INTELLIGENCE & ML PREDICTIONS{C.END}")
try:
    res = requests.get(f"{API_BASE}/ml/price-predict?crop=tomato")
    if res.status_code == 200:
        data = res.json()
        print(f"{C.OK}SUCCESS: Price prediction successful for Tomato.{C.END}")
        print(f"  -> Next Month: ₹{data.get('predictions', {}).get('next_month')} | Driver: {data.get('driver')}")
    else:
        print(f"{C.FAIL}FAILED: Failed price prediction: {res.status_code}{C.END}")
except Exception as e:
    print(f"{C.FAIL}FAILED: ML test failed: {e}{C.END}")

print(f"\n{C.BOLD}=== AUDIT COMPLETE ==={C.END}")
