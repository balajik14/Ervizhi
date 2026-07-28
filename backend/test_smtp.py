import smtplib
import os
from dotenv import load_dotenv

load_dotenv()

email = os.getenv("SMTP_EMAIL")
password = os.getenv("SMTP_PASSWORD")

print(f"Testing SMTP with: {email}")

# Test 1: Port 465 SSL
print("\n--- Testing Port 465 (SMTP_SSL) ---")
try:
    server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=5)
    server.login(email, password)
    print("SUCCESS: Port 465 SSL login works!")
    server.quit()
except Exception as e:
    print(f"Port 465 failed: {type(e).__name__}: {e}")

# Test 2: Port 587 TLS
print("\n--- Testing Port 587 (SMTP TLS) ---")
try:
    server = smtplib.SMTP("smtp.gmail.com", 587, timeout=5)
    server.starttls()
    server.login(email, password)
    print("SUCCESS: Port 587 TLS login works!")
    server.quit()
except Exception as e:
    print(f"Port 587 failed: {type(e).__name__}: {e}")
