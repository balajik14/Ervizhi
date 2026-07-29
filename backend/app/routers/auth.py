import random
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any, Optional
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate, Token
import firebase_config

router = APIRouter()

# In-memory store for OTPs (email -> {"otp": str, "expires_at": datetime})
otp_store = {}

class LoginLocalRequest(BaseModel):
    username: str
    password: str

class SendOTPRequest(BaseModel):
    email: str

class VerifyOTPOnlyRequest(BaseModel):
    email: str
    otp: str

class VerifyOTPRegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    phone: Optional[str] = None
    village: Optional[str] = None

class ProfileImageRequest(BaseModel):
    image_base64: str

def format_profile(user: User) -> dict:
    return {
        "uid": str(user.id),
        "email": user.email,
        "username": user.username,
        "language_pref": user.language_pref or "en",
        "phone": user.phone or "",
        "village": user.village or "",
        "profile_image_url": user.profile_image_url or "",
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }

def get_current_user(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_token)) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/send-otp")
def send_otp(data: SendOTPRequest):
    email = data.email.strip().lower()
    otp = str(random.randint(100000, 999999))
    expires_at = datetime.now() + timedelta(minutes=10)
    otp_store[email] = {"otp": otp, "expires_at": expires_at}
    print(f"[OTP SERVICE] Generated OTP {otp} for email {email} (Expires at {expires_at})")

    email_sent = False
    if settings.SMTP_EMAIL and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_EMAIL
            msg['To'] = email
            msg['Subject'] = "Ervizhi - Your Verification Code / சரிபார்ப்பு குறியீடு"

            html = f"""
            <html>
              <body>
                <h2>Welcome to Ervizhi Smart Farming Platform!</h2>
                <p>Your one-time password (OTP) is: <strong style="font-size:24px;">{otp}</strong></p>
                <p>Please enter this code in the app to complete your registration or login.</p>
                <hr>
                <h2>எர்விழிக்கு வரவேற்கிறோம்!</h2>
                <p>உங்கள் சரிபார்ப்பு குறியீடு (OTP): <strong style="font-size:24px;">{otp}</strong></p>
              </body>
            </html>
            """
            msg.attach(MIMEText(html, 'html'))
            server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=5)
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            email_sent = True
            print(f"[OTP SERVICE] Email sent successfully to {email}")
        except Exception as e:
            print(f"[OTP SERVICE] SMTP delivery failed or timed out ({e}). Providing OTP in fallback response payload.")

    return {
        "message": "OTP sent successfully" if email_sent else "OTP generated",
        "otp": otp
    }

@router.post("/verify-otp-only")
def verify_otp_only(data: VerifyOTPOnlyRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    
    stored = otp_store.get(email)
    if not stored:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP. Please request a new code.")
    
    if datetime.now() > stored["expires_at"]:
        otp_store.pop(email, None)
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new code.")

    if stored["otp"] != data.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP code.")
    
    return {"message": "OTP verified successfully"}

import uuid

token_store = {}

class RegisterEmailRequest(BaseModel):
    email: str
    username: str
    password: str

@router.post("/send-verification-link")
def send_verification_link(data: RegisterEmailRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    username = data.username.strip().lower()
    
    # Check if exists
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Account with this email already exists.")
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already taken.")
        
    token = uuid.uuid4().hex
    expires_at = datetime.now() + timedelta(hours=24)
    token_store[token] = {
        "type": "register",
        "email": email,
        "username": username,
        "password": data.password,
        "expires_at": expires_at
    }
    
    # Create local user as unverified
    user = User(
        email=email,
        username=username,
        hashed_password=get_password_hash(data.password),
        language_pref="en",
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Sync with Firebase as unverified
    try:
        fb_user = firebase_config.create_user(email=email, password=data.password, display_name=username)
        if firebase_config.db is not None:
            from firebase_admin import firestore
            user_ref = firebase_config.db.collection('users').document(email)
            user_ref.set({
                'email': email,
                'username': username,
                'is_verified': False,
                'created_at': firestore.SERVER_TIMESTAMP
            })
    except Exception as e:
        print(f"[FIREBASE AUTH] Firebase sync note: {e}")
    
    email_sent = False
    if settings.SMTP_EMAIL and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_EMAIL
            msg['To'] = email
            msg['Subject'] = "Ervizhi - Verify your account / கணக்கை சரிபார்க்கவும்"

            link = f"https://ervizhi.vercel.app/verify-email?token={token}&email={email}"
            html = f"""
            <html>
              <body>
                <h2>Welcome to Ervizhi Smart Farming Platform!</h2>
                <p>Click the link below to verify your account:</p>
                <p><a href="{link}" style="font-size:18px; color: blue;">Verify My Account</a></p>
                <hr>
                <h2>எர்விழிக்கு வரவேற்கிறோம்!</h2>
                <p>உங்கள் கணக்கை சரிபார்க்க கீழே உள்ள இணைப்பை கிளிக் செய்யவும்:</p>
                <p><a href="{link}" style="font-size:18px; color: blue;">எனது கணக்கை சரிபார்க்கவும்</a></p>
              </body>
            </html>
            """
            msg.attach(MIMEText(html, 'html'))
            server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=5)
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            email_sent = True
        except Exception as e:
            print(f"[AUTH SERVICE] SMTP delivery failed ({e})")
            
    if not email_sent:
        # Fallback for local testing if SMTP fails
        return {"message": "Verification link generated", "token": token}
    return {"message": "Verification email sent"}

@router.get("/verify-link")
def verify_link(token: str, email: str, db: Session = Depends(get_db)):
    stored = token_store.get(token)
    if not stored or stored["type"] != "register":
        raise HTTPException(status_code=400, detail="Invalid or expired verification link.")
        
    if datetime.now() > stored["expires_at"]:
        token_store.pop(token, None)
        raise HTTPException(status_code=400, detail="Verification link has expired. Please register again.")
        
    email_stored = stored["email"]
    if email_stored.lower() != email.strip().lower():
        raise HTTPException(status_code=400, detail="Email mismatch.")
    username = stored["username"]
    password = stored["password"]
    
    # Remove from store
    token_store.pop(token, None)
    
    # Check if exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    if getattr(user, 'is_verified', False):
        return {"message": "Account already verified."}

    # Update local user
    if hasattr(user, 'is_verified'):
        user.is_verified = True
        db.commit()

    # Sync with Firebase
    try:
        if firebase_config.db is not None:
            user_ref = firebase_config.db.collection('users').document(email)
            user_ref.update({
                'is_verified': True
            })
    except Exception as e:
        print(f"[FIREBASE AUTH] Firebase sync note: {e}")

    return {"status": "success", "message": "Email verified successfully!"}

@router.post("/login")
def login_local(data: LoginLocalRequest, db: Session = Depends(get_db)):
    username = data.username.strip().lower()
    
    user = db.query(User).filter((User.username == username) | (User.email == username)).first()
    
    if not user:
        # Fallback check in Firebase Auth
        try:
            from firebase_admin import auth as fb_auth
            firebase_config._init_firebase()
            fb_user = None
            if "@" in username:
                fb_user = fb_auth.get_user_by_email(username)
            if fb_user:
                new_user = User(
                    email=fb_user.email,
                    username=fb_user.display_name.lower().replace(" ", "_") if fb_user.display_name else fb_user.email.split("@")[0],
                    hashed_password=get_password_hash(data.password),
                    language_pref="en"
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                user = new_user
        except Exception as fb_err:
            print(f"[LOGIN FALLBACK] Firebase user lookup note: {fb_err}")

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not getattr(user, 'is_verified', True):
        raise HTTPException(status_code=403, detail="Account not verified. Please check your email for the verification link.")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)

    return {
        "token": token,
        "profile": format_profile(user)
    }

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    
    stored = otp_store.get(email)
    if not stored or stored["otp"] != data.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")
        
    if datetime.now() > stored["expires_at"]:
        otp_store.pop(email, None)
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new code.")
        
    otp_store.pop(email, None)
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email address.")
        
    user.hashed_password = get_password_hash(data.new_password)
    db.add(user)
    db.commit()
    
    try:
        from firebase_admin import auth as fb_auth
        firebase_config._init_firebase()
        fb_user = fb_auth.get_user_by_email(email)
        if fb_user:
            fb_auth.update_user(fb_user.uid, password=data.new_password)
    except Exception as e:
        print(f"[RESET PASSWORD] Firebase password update note: {e}")
        
    return {"message": "Password reset successfully. You can now login with your new password."}

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return format_profile(current_user)

@router.put("/profile")
def update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.username is not None:
        username = data.username.strip().lower()
        if username != current_user.username:
            existing = db.query(User).filter(User.username == username).first()
            if existing:
                raise HTTPException(status_code=400, detail="Username already taken")
            current_user.username = username
            
    if data.phone is not None:
        current_user.phone = data.phone.strip()
        
    if data.village is not None:
        current_user.village = data.village.strip()

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return format_profile(current_user)

@router.post("/profile-image")
def update_profile_image(
    data: ProfileImageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.profile_image_url = f"data:image/jpeg;base64,{data.image_base64}"
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"msg": "Profile image updated successfully"}

