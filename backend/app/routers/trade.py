from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import firebase_config
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()

class TradeListingCreate(BaseModel):
    crop: str
    seasonality: str
    demand: str
    country: str
    driver: str
    classification: Optional[str] = "General"
    tamil_name: Optional[str] = None

@router.get("")
def read_trade_listings():
    firestore_db = firebase_config.get_firestore_client()
    if not firestore_db:
        raise HTTPException(status_code=500, detail="Firestore not configured.")
    try:
        docs = firestore_db.collection("trade_listings").stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            # Convert timestamp field if present
            created_at = data.get("createdAt")
            if created_at and not isinstance(created_at, str):
                try:
                    created_at = created_at.isoformat()
                except:
                    pass
            results.append({
                "id": doc.id,
                "crop": data.get("crop"),
                "seasonality": data.get("seasonality"),
                "demand": data.get("demand"),
                "country": data.get("country"),
                "driver": data.get("driver"),
                "classification": data.get("classification"),
                "tamil_name": data.get("tamil_name"),
                "owner_id": data.get("owner_id"),
                "owner_username": data.get("owner_username"),
                "createdAt": created_at
            })
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trade listings: {e}")

@router.post("")
def create_trade_listing(
    data: TradeListingCreate,
    current_user: User = Depends(get_current_user)
):
    firestore_db = firebase_config.get_firestore_client()
    if not firestore_db:
        raise HTTPException(status_code=500, detail="Firestore not configured.")
    try:
        from firebase_admin import firestore
        import uuid
        listing_id = str(uuid.uuid4())
        doc_ref = firestore_db.collection("trade_listings").document(listing_id)
        payload = data.dict()
        payload.update({
            "owner_id": str(current_user.id),
            "owner_username": current_user.username,
            "createdAt": firestore.SERVER_TIMESTAMP
        })
        doc_ref.set(payload)
        return {"id": listing_id, **payload}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create trade listing: {e}")

@router.delete("/{id}")
def delete_trade_listing(
    id: str,
    current_user: User = Depends(get_current_user)
):
    firestore_db = firebase_config.get_firestore_client()
    if not firestore_db:
        raise HTTPException(status_code=500, detail="Firestore not configured.")
    try:
        doc_ref = firestore_db.collection("trade_listings").document(id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Listing not found")
        data = doc.to_dict()
        if data.get("owner_id") != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
        doc_ref.delete()
        return {"msg": "Listing deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete listing: {e}")
