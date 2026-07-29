from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.farm import Farm
from app.models.user import User
from app.schemas.farm import FarmCreate, FarmUpdate, FarmResponse
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[FarmResponse])
def read_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Farm).filter(Farm.user_id == current_user.id).all()

@router.post("", response_model=FarmResponse)
def create_farm(
    farm_in: FarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = Farm(**farm_in.dict(), user_id=current_user.id)
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm

@router.get("/{id}", response_model=FarmResponse)
def read_farm(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this farm")
    return farm

@router.put("/{id}", response_model=FarmResponse)
def update_farm(
    id: uuid.UUID,
    farm_in: FarmUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this farm")
        
    update_data = farm_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(farm, key, value)
        
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm

@router.delete("/{id}")
def delete_farm(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this farm")
        
    db.delete(farm)
    db.commit()
    return {"msg": "Farm deleted successfully"}
