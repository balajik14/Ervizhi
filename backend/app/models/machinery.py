import uuid
from sqlalchemy import Column, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Machinery(Base):
    __tablename__ = "machinery"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    machineTitle = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, index=True, nullable=False)
    phone = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    price_per_day = Column(Float, nullable=True, default=0.0)
    is_available = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="machineries")
