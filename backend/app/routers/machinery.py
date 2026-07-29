from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.models.machinery import Machinery
from app.models.user import User
from app.schemas.machinery import MachineryCreate, MachineryUpdate, MachineryResponse
from app.routers.auth import get_current_user
import firebase_config

router = APIRouter()

@router.get("", response_model=List[MachineryResponse])
def read_machineries(
    db: Session = Depends(get_db),
    location: Optional[str] = Query(None),
    machineTitle: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100
):
    # Try fetching from Firestore first for live public catalog
    firestore_db = firebase_config.get_firestore_client()
    if firestore_db:
        try:
            docs = firestore_db.collection("machinery").stream()
            results = []
            for doc in docs:
                data = doc.to_dict()
                results.append({
                    "id": doc.id,
                    "owner_id": data.get("owner_id"),
                    "machineTitle": data.get("machineTitle"),
                    "description": data.get("description"),
                    "location": data.get("location"),
                    "phone": data.get("phone"),
                    "image_url": data.get("image_url"),
                    "price_per_day": data.get("price_per_day", 0.0),
                    "is_available": data.get("is_available", True),
                    "createdAt": data.get("createdAt") or datetime.utcnow()
                })
            # Apply basic filters
            if location:
                results = [r for r in results if location.lower() in r["location"].lower()]
            if machineTitle:
                results = [r for r in results if machineTitle.lower() in r["machineTitle"].lower()]
            
            return results[skip : skip + limit]
        except Exception as e:
            print(f"[FIRESTORE READ ERROR] Falling back to SQLite: {e}")

    # SQLite fallback
    query = db.query(Machinery).filter(Machinery.is_available == True)
    if location:
        query = query.filter(Machinery.location.ilike(f"%{location}%"))
    if machineTitle:
        query = query.filter(Machinery.machineTitle.ilike(f"%{machineTitle}%"))
    return query.offset(skip).limit(limit).all()

@router.post("/upload-image")
def upload_machinery_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    bucket = firebase_config.get_storage_bucket()
    if not bucket:
        raise HTTPException(status_code=500, detail="Firebase Storage bucket is not configured.")
    try:
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        blob_path = f"machinery/{uuid.uuid4()}.{ext}"
        blob = bucket.blob(blob_path)
        
        # Rewind and upload
        file.file.seek(0)
        blob.upload_from_file(file.file, content_type=file.content_type)
        blob.make_public()
        return {"image_url": blob.public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

@router.get("/{id}", response_model=MachineryResponse)
def read_machinery(id: uuid.UUID, db: Session = Depends(get_db)):
    # Try Firestore
    firestore_db = firebase_config.get_firestore_client()
    if firestore_db:
        try:
            doc = firestore_db.collection("machinery").document(str(id)).get()
            if doc.exists:
                data = doc.to_dict()
                return {
                    "id": doc.id,
                    "owner_id": data.get("owner_id"),
                    "machineTitle": data.get("machineTitle"),
                    "description": data.get("description"),
                    "location": data.get("location"),
                    "phone": data.get("phone"),
                    "image_url": data.get("image_url"),
                    "price_per_day": data.get("price_per_day", 0.0),
                    "is_available": data.get("is_available", True),
                    "createdAt": data.get("createdAt") or datetime.utcnow()
                }
        except Exception as e:
            print(f"[FIRESTORE READ ERROR] Falling back to SQLite for single ID: {e}")

    machinery = db.query(Machinery).filter(Machinery.id == id).first()
    if not machinery:
        raise HTTPException(status_code=404, detail="Machinery not found")
    return machinery

@router.post("", response_model=MachineryResponse)
def create_machinery(
    machinery_in: MachineryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # SQLite
    machinery = Machinery(**machinery_in.dict(), owner_id=current_user.id)
    db.add(machinery)
    db.commit()
    db.refresh(machinery)
    
    # Firestore Sync
    firestore_db = firebase_config.get_firestore_client()
    if firestore_db:
        try:
            from firebase_admin import firestore
            doc_ref = firestore_db.collection("machinery").document(str(machinery.id))
            doc_ref.set({
                "owner_id": str(current_user.id),
                "machineTitle": machinery.machineTitle,
                "description": machinery.description,
                "location": machinery.location,
                "phone": machinery.phone,
                "image_url": machinery.image_url,
                "price_per_day": machinery.price_per_day,
                "is_available": machinery.is_available,
                "createdAt": firestore.SERVER_TIMESTAMP
            })
            print(f"[FIRESTORE SUCCESS] Machinery synced: {machinery.id}")
        except Exception as e:
            print(f"[FIRESTORE WRITE ERROR] Machinery sync failed: {e}")

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
    
    # Firestore Sync Update
    firestore_db = firebase_config.get_firestore_client()
    if firestore_db:
        try:
            doc_ref = firestore_db.collection("machinery").document(str(machinery.id))
            doc_ref.update({
                key: value for key, value in update_data.items()
            })
            print(f"[FIRESTORE SUCCESS] Updated machinery: {machinery.id}")
        except Exception as e:
            print(f"[FIRESTORE UPDATE ERROR]: {e}")

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
    
    # Firestore Sync Delete
    firestore_db = firebase_config.get_firestore_client()
    if firestore_db:
        try:
            doc_ref = firestore_db.collection("machinery").document(str(id))
            doc_ref.delete()
            print(f"[FIRESTORE SUCCESS] Deleted machinery: {id}")
        except Exception as e:
            print(f"[FIRESTORE DELETE ERROR]: {e}")
            
    return {"msg": "Machinery deleted successfully"}
