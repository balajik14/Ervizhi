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

class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str

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
def send_otp(data: SendOTPRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    
    # Check if user exists
    user_by_email = db.query(User).filter(User.email == email).first()
    if user_by_email:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")
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

@router.post("/verify-otp")
def verify_otp(data: VerifyOTPOnlyRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    
    stored = otp_store.get(email)
    if not stored:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP. Please request a new code.")
    
    if datetime.now() > stored["expires_at"]:
        otp_store.pop(email, None)
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new code.")

    if stored["otp"] != data.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP code.")
    
    # Mark email as verified (using same otp_store but with different state)
    otp_store[email] = {"verified": True, "expires_at": datetime.now() + timedelta(minutes=30)}
    return {"status": "success", "message": "Email verified"}

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    username = data.username.strip().lower()
    
    # Check if OTP was verified
    stored = otp_store.get(email)
    if not stored or not stored.get("verified"):
        raise HTTPException(status_code=400, detail="Email not verified. Please verify your OTP first.")
    
    if datetime.now() > stored["expires_at"]:
        otp_store.pop(email, None)
        raise HTTPException(status_code=400, detail="Verification expired. Please request a new OTP.")
    
    # Remove from store once registered
    otp_store.pop(email, None)

    # Check if username already exists
    user_by_username = db.query(User).filter(User.username == username).first()
    if user_by_username:
        raise HTTPException(status_code=400, detail="Username already exists. Please choose a different username.")

    # Create new user in local SQLite DB
    user = User(
        email=email,
        username=username,
        hashed_password=get_password_hash(data.password),
        language_pref="en",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Sync user with Firebase Auth & Firestore
    try:
        fb_user = firebase_config.create_user(email=email, password=data.password, display_name=username)
        print(f"[FIREBASE AUTH] User created in Firebase: {fb_user.uid}")
        
        # Write to Firestore
        if firebase_config.db is not None:
            from firebase_admin import firestore
            user_ref = firebase_config.db.collection('users').document(email)
            user_ref.set({
                'email': email,
                'username': username,
                'is_verified': True,
                'created_at': firestore.SERVER_TIMESTAMP
            })
    except Exception as e:
        print(f"[FIREBASE AUTH] Firebase sync note: {e}")

    # Create token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)

    return {
        "token": token,
        "profile": format_profile(user)
    }

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

