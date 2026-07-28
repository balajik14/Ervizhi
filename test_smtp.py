import smtplib
try:
    print("Trying 587...")
    server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
    server.starttls()
    server.quit()
    print("587 SUCCESS")
except Exception as e:
    print("587 FAILED:", e)

try:
    print("Trying 465...")
    server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10)
    server.quit()
    print("465 SUCCESS")
except Exception as e:
    print("465 FAILED:", e)
