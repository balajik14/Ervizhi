from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime

class MachineryBase(BaseModel):
    machineTitle: str
    description: Optional[str] = None
    location: str
    phone: str
    image_url: Optional[str] = None
    price_per_day: Optional[float] = 0.0
    is_available: bool = True

class MachineryCreate(MachineryBase):
    pass

class MachineryUpdate(BaseModel):
    machineTitle: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    image_url: Optional[str] = None
    price_per_day: Optional[float] = None
    is_available: Optional[bool] = None

class MachineryResponse(MachineryBase):
    id: UUID4
    owner_id: UUID4
    createdAt: datetime

    class Config:
        from_attributes = True
