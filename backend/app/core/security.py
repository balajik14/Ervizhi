from datetime import datetime, timedelta
import uuid
import bcrypt
from typing import Optional, Union
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')[:72]
    try:
        return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def resolve_token_to_user_id(token: str, db: Session) -> Optional[str]:
    # 1. Try local HS256 signature verification
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id:
            return user_id
    except Exception:
        pass

    # 2. Try unverified claims decode (for Firebase ID tokens)
    try:
        claims = jwt.get_unverified_claims(token)
        fb_uid = claims.get("sub") or claims.get("user_id")
        if fb_uid:
            try:
                user_uuid = uuid.UUID(fb_uid)
            except ValueError:
                # Generate deterministic UUID for external/Firebase uid strings
                user_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, fb_uid)

            email = claims.get("email") or f"{fb_uid}@firebase.com"
            name = claims.get("name") or claims.get("email", "Firebase User").split("@")[0]
            
            user = db.query(User).filter((User.id == user_uuid) | (User.email == email)).first()
            if not user:
                user = User(
                    id=user_uuid,
                    username=name.lower().replace(" ", "_"),
                    email=email,
                    hashed_password="firebase_auth_external",
                    language_pref="en"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            return str(user.id)
    except Exception as e:
        print(f"[SECURITY] Unverified decode error: {e}")
        pass

    return None

def get_current_user_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id = resolve_token_to_user_id(token, db)
    if not user_id:
        raise credentials_exception
    return user_id
