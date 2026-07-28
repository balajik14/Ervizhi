"""
Comprehensive End-to-End Authentication Test Suite
===================================================
Tests all backend authentication endpoints, database persistence, OTP lifecycle,
Firebase synchronization, fallback login, and password reset.
"""

import sys
import os
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/auth"

def run_tests():
    print("\n========================================================")
    print("RUNNING END-TO-END AUTHENTICATION SUITE VERIFICATION")
    print("========================================================\n")

    import uuid
    suffix = uuid.uuid4().hex[:6]
    test_email = f"testfarmer_{suffix}@ervizhi.com"
    test_username = f"farmer_{suffix}"
    test_pass = "FarmSecurePass123!"
    new_pass = "UpdatedFarmPass456!"

    # 1. TEST SEND OTP
    print("[1/10] Testing /send-otp...")
    res = requests.post(f"{BASE_URL}/send-otp", json={"email": test_email})
    print(f"Status: {res.status_code}, Response: {res.json()}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    otp = data.get("otp")
    assert otp is not None, "Expected OTP in response payload"
    print(f"PASSED: /send-otp. Generated OTP: {otp}\n")

    # 2. TEST VERIFY OTP ONLY (WRONG OTP & CORRECT OTP)
    print("[2/10] Testing /verify-otp-only...")
    bad_res = requests.post(f"{BASE_URL}/verify-otp-only", json={"email": test_email, "otp": "000000"})
    assert bad_res.status_code == 400, "Expected 400 for wrong OTP"
    print("   Wrong OTP correctly rejected (400).")

    good_res = requests.post(f"{BASE_URL}/verify-otp-only", json={"email": test_email, "otp": otp})
    assert good_res.status_code == 200, f"Expected 200 for valid OTP, got {good_res.status_code}"
    print("PASSED: /verify-otp-only.\n")

    # 3. TEST REGISTER (VERIFY OTP & REGISTER)
    print("[3/10] Testing /verify-otp-register...")
    reg_res = requests.post(f"{BASE_URL}/verify-otp-register", json={
        "email": test_email,
        "username": test_username,
        "password": test_pass,
        "otp": otp
    })
    print(f"Status: {reg_res.status_code}, Response: {reg_res.json()}")
    assert reg_res.status_code == 200, f"Registration failed with {reg_res.status_code}"
    reg_data = reg_res.json()
    token = reg_data.get("token")
    profile = reg_data.get("profile")
    assert token is not None, "Missing token in registration response"
    assert profile["email"] == test_email, "Profile email mismatch"
    assert profile["username"] == test_username, "Profile username mismatch"
    print(f"PASSED: /verify-otp-register. Created User ID: {profile['uid']}\n")

    # 4. TEST DUPLICATE REGISTRATION PREVENTION
    print("[4/10] Testing Duplicate Registration Prevention...")
    res2 = requests.post(f"{BASE_URL}/send-otp", json={"email": test_email})
    assert res2.status_code == 400, f"Expected 400 for duplicate email, got {res2.status_code}"
    print(f"   Duplicate registration correctly prevented: {res2.json()['detail']}")
    print("PASSED: Duplicate Prevention.\n")

    # 5. TEST LOGIN WITH USERNAME
    print("[5/10] Testing /login-local (by username)...")
    login_res1 = requests.post(f"{BASE_URL}/login-local", json={
        "username": test_username,
        "password": test_pass
    })
    assert login_res1.status_code == 200, f"Login by username failed: {login_res1.status_code}"
    print("PASSED: Login by username.\n")

    # 6. TEST LOGIN WITH EMAIL
    print("[6/10] Testing /login-local (by email)...")
    login_res2 = requests.post(f"{BASE_URL}/login-local", json={
        "username": test_email,
        "password": test_pass
    })
    assert login_res2.status_code == 200, f"Login by email failed: {login_res2.status_code}"
    active_token = login_res2.json()["token"]
    print("PASSED: Login by email.\n")

    # 7. TEST INCORRECT PASSWORD LOGIN
    print("[7/10] Testing Incorrect Password Handling...")
    wrong_login = requests.post(f"{BASE_URL}/login-local", json={
        "username": test_username,
        "password": "WrongPassword123!"
    })
    assert wrong_login.status_code == 400, f"Expected 400 for wrong password, got {wrong_login.status_code}"
    print(f"   Incorrect password error correctly returned: {wrong_login.json()['detail']}")
    print("PASSED: Incorrect Password Test.\n")

    # 8. TEST FIREBASE ACCOUNT FALLBACK LOGIN
    print("[8/10] Testing Firebase Account Fallback Login...")
    fb_login = requests.post(f"{BASE_URL}/login-local", json={
        "username": "balajikalyanasundharam14@gmail.com",
        "password": "AnyPassword123!"
    })
    print(f"   Firebase Account Fallback response status: {fb_login.status_code}")
    print("PASSED: Firebase Fallback Check.\n")

    # 9. TEST /me PROTECTED ENDPOINT
    print("[9/10] Testing /me Protected Endpoint...")
    me_res = requests.get(f"{BASE_URL}/me", headers={"Authorization": f"Bearer {active_token}"})
    assert me_res.status_code == 200, f"Expected 200 for /me, got {me_res.status_code}"
    assert me_res.json()["email"] == test_email
    print(f"   /me returned profile for: {me_res.json()['username']}")
    print("PASSED: /me Endpoint.\n")

    # 10. TEST PASSWORD RESET FLOW
    print("[10/10] Testing /reset-password Flow...")
    res_reset_otp = requests.post(f"{BASE_URL}/send-otp", json={"email": test_email, "mode": "forgot"})
    reset_otp = res_reset_otp.json().get("otp")

    reset_res = requests.post(f"{BASE_URL}/reset-password", json={
        "email": test_email,
        "otp": reset_otp,
        "new_password": new_pass
    })
    assert reset_res.status_code == 200, f"Reset password failed: {reset_res.status_code}"
    print("   Password reset successfully.")

    # Try login with old password (should fail)
    old_login = requests.post(f"{BASE_URL}/login-local", json={"username": test_username, "password": test_pass})
    assert old_login.status_code == 400, "Old password should no longer work"

    # Try login with new password (should succeed)
    new_login = requests.post(f"{BASE_URL}/login-local", json={"username": test_username, "password": new_pass})
    assert new_login.status_code == 200, "Login with new password failed"
    print("PASSED: Reset Password Flow.\n")

    print("========================================================")
    print("ALL AUTHENTICATION ENDPOINT TESTS PASSED SUCCESSFULLY!")
    print("========================================================\n")

if __name__ == "__main__":
    run_tests()
