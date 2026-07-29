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

import uuid

@router.post("/register-email")
def register_email(data: RegisterEmailRequest, db: Session = Depends(get_db)):
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
    
    email_sent = False
    if settings.SMTP_EMAIL and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_EMAIL
            msg['To'] = email
            msg['Subject'] = "Ervizhi - Verify your account / கணக்கை சரிபார்க்கவும்"

            link = f"https://ervizhi.vercel.app/verify-email?token={token}"
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

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    stored = token_store.get(token)
    if not stored or stored["type"] != "register":
        raise HTTPException(status_code=400, detail="Invalid or expired verification link.")
        
    if datetime.now() > stored["expires_at"]:
        token_store.pop(token, None)
        raise HTTPException(status_code=400, detail="Verification link has expired. Please register again.")
        
    email = stored["email"]
    username = stored["username"]
    password = stored["password"]
    
    # Remove from store
    token_store.pop(token, None)
    
    # Check again if exists
    if db.query(User).filter(User.email == email).first():
        return {"message": "Account already verified."}

    # Create local user
    user = User(
        email=email,
        username=username,
        hashed_password=get_password_hash(password),
        language_pref="en",
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Sync with Firebase
    try:
        fb_user = firebase_config.create_user(email=email, password=password, display_name=username)
        if firebase_config.db is not None:
            firebase_config.db.collection("users").document(str(user.id)).set(format_profile(user))
    except Exception as e:
        print(f"[FIREBASE AUTH] Firebase sync note: {e}")

    return {"message": "Account verified successfully", "user_id": str(user.id)}

@router.post("/forgot-password-email")
def forgot_password_email(data: ForgotPasswordEmailRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal user existence, just return success
        return {"message": "If the email is registered, a reset link will be sent."}
        
    token = uuid.uuid4().hex
    expires_at = datetime.now() + timedelta(hours=1)
    token_store[token] = {
        "type": "reset",
        "email": email,
        "expires_at": expires_at
    }
    
    email_sent = False
    if settings.SMTP_EMAIL and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_EMAIL
            msg['To'] = email
            msg['Subject'] = "Ervizhi - Reset Password / கடவுச்சொல்லை மீட்டமைக்க"

            link = f"https://ervizhi.vercel.app/reset-password?token={token}"
            html = f"""
            <html>
              <body>
                <h2>Ervizhi Password Reset</h2>
                <p>Click the link below to reset your password:</p>
                <p><a href="{link}" style="font-size:18px; color: blue;">Reset Password</a></p>
                <p>This link will expire in 1 hour.</p>
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
        return {"message": "Reset link generated", "token": token}
    return {"message": "If the email is registered, a reset link will be sent."}

@router.post("/reset-password-link")
def reset_password_link(data: ResetPasswordLinkRequest, db: Session = Depends(get_db)):
    stored = token_store.get(data.token)
    if not stored or stored["type"] != "reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")
        
    if datetime.now() > stored["expires_at"]:
        token_store.pop(data.token, None)
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")
        
    email = stored["email"]
    token_store.pop(data.token, None)
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found.")
        
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
        
    return {"message": "Password reset successfully. You can now login."}


# In-memory store for OTPs (email -> {"otp": str, "expires_at": datetime})
otp_store = {}
token_store = {}

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

class RegisterEmailRequest(BaseModel):
    email: str
    username: str
    password: str

class ForgotPasswordEmailRequest(BaseModel):
    email: str

class ResetPasswordLinkRequest(BaseModel):
    token: str
    new_password: str

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

@router.post("/verify-otp-register")
def verify_otp_register(data: VerifyOTPRegisterRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    username = data.username.strip().lower()
    
    # Verify OTP
    stored = otp_store.get(email)
    if not stored or stored["otp"] != data.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")
    
    if datetime.now() > stored["expires_at"]:
        otp_store.pop(email, None)
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new code.")
    
    # Remove OTP once verified
    otp_store.pop(email, None)

    # Check if user already exists
    user_by_email = db.query(User).filter(User.email == email).first()
    if user_by_email:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
        
    user_by_username = db.query(User).filter(User.username == username).first()
    if user_by_username:
        raise HTTPException(status_code=400, detail="Username is already taken.")

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
            firebase_config.db.collection("users").document(str(user.id)).set(format_profile(user))
    except Exception as e:
        print(f"[FIREBASE AUTH] Firebase sync note: {e}")

    # Create token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)

    return {
        "token": token,
        "profile": format_profile(user)
    }

@router.post("/login-local")
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

# ── Backwards Compatible Endpoints for old API spec ──
@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="The user with this email already exists in the system.")
    user = db.query(User).filter(User.username == user_in.username).first()
    if user:
        raise HTTPException(status_code=400, detail="The user with this username already exists in the system.")
    
    user_obj = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        district=user_in.district,
    )
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj

@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect username or password")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout() -> Any:
    return {"msg": "Successfully logged out. Please clear the token on the client side."}

