from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import date, datetime

class FarmBase(BaseModel):
    farm_name: str
    land_size_acres: float
    soil_nitrogen: Optional[float] = None
    soil_phosphorus: Optional[float] = None
    soil_potassium: Optional[float] = None
    soil_ph: Optional[float] = None
    soil_texture: Optional[str] = None
    current_crop: Optional[str] = None
    sowing_date: Optional[date] = None
    district: Optional[str] = None

class FarmCreate(FarmBase):
    pass

class FarmUpdate(BaseModel):
    farm_name: Optional[str] = None
    land_size_acres: Optional[float] = None
    soil_nitrogen: Optional[float] = None
    soil_phosphorus: Optional[float] = None
    soil_potassium: Optional[float] = None
    soil_ph: Optional[float] = None
    soil_texture: Optional[str] = None
    current_crop: Optional[str] = None
    sowing_date: Optional[date] = None
    district: Optional[str] = None

class FarmResponse(FarmBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True
