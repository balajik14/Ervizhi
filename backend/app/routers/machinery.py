from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.models.machinery import Machinery
from app.models.user import User
from app.schemas.machinery import MachineryCreate, MachineryUpdate, MachineryResponse
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[MachineryResponse])
def read_machineries(
    db: Session = Depends(get_db),
    location: Optional[str] = Query(None),
    machineTitle: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100
):
    query = db.query(Machinery).filter(Machinery.is_available == True)
    if location:
        query = query.filter(Machinery.location.ilike(f"%{location}%"))
    if machineTitle:
        query = query.filter(Machinery.machineTitle.ilike(f"%{machineTitle}%"))
    if keyword:
        query = query.filter(
            (Machinery.machineTitle.ilike(f"%{keyword}%")) | 
            (Machinery.description.ilike(f"%{keyword}%")) |
            (Machinery.location.ilike(f"%{keyword}%"))
        )
    machineries = query.order_by(Machinery.createdAt.desc()).offset(skip).limit(limit).all()
    return machineries

@router.get("/my-listings", response_model=List[MachineryResponse])
def read_my_machineries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Machinery).filter(Machinery.owner_id == current_user.id).all()

@router.get("/{id}", response_model=MachineryResponse)
def read_machinery(id: uuid.UUID, db: Session = Depends(get_db)):
    machinery = db.query(Machinery).filter(Machinery.id == id).first()
    if not machinery:
        raise HTTPException(status_code=404, detail="Machinery not found")
    return machinery

@router.post("/", response_model=MachineryResponse)
def create_machinery(
    machinery_in: MachineryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    machinery = Machinery(**machinery_in.dict(), owner_id=current_user.id)
    db.add(machinery)
    db.commit()
    db.refresh(machinery)
    return machinery

@router.put("/{id}", response_model=MachineryResponse)
def update_machinery(
    id: uuid.UUID,
    machinery_in: MachineryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    machinery = db.query(Machinery).filter(Machinery.id == id).first()
    if not machinery:
        raise HTTPException(status_code=404, detail="Machinery not found")
    if machinery.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this listing")
    
    update_data = machinery_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(machinery, key, value)
        
    db.add(machinery)
    db.commit()
    db.refresh(machinery)
    return machinery

@router.delete("/{id}")
def delete_machinery(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    machinery = db.query(Machinery).filter(Machinery.id == id).first()
    if not machinery:
        raise HTTPException(status_code=404, detail="Machinery not found")
    if machinery.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
        
    db.delete(machinery)
    db.commit()
    return {"msg": "Machinery deleted successfully"}
