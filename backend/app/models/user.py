import uuid
from sqlalchemy import Column, String, DateTime, Boolean, Uuid
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    district = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    village = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    language_pref = Column(String, default="en")
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    machineries = relationship("Machinery", back_populates="owner")
    farms = relationship("Farm", back_populates="user")
