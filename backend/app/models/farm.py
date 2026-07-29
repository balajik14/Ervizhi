import uuid
from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey, Uuid
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    farm_name = Column(String, nullable=False)
    land_size_acres = Column(Float, nullable=False)
    soil_nitrogen = Column(Float, nullable=True)
    soil_phosphorus = Column(Float, nullable=True)
    soil_potassium = Column(Float, nullable=True)
    soil_ph = Column(Float, nullable=True)
    soil_texture = Column(String, nullable=True)
    current_crop = Column(String, nullable=True)
    sowing_date = Column(Date, nullable=True)
    district = Column(String, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="farms")
