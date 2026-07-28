from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class CropScan(Base):
    __tablename__ = "crop_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    status = Column(String, nullable=False)          # "Healthy" | "Diseased" | "Unknown"
    description = Column(Text, nullable=False)
    image_url = Column(Text, nullable=True)          # base64 data URL or storage URL
    created_at = Column(DateTime(timezone=True), server_default=func.now())
