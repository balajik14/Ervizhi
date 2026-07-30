from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.services.ml_service import ml_service
from app.core.database import get_db
from app.core.security import get_current_user_token
from app.models.crop_scan import CropScan


router = APIRouter()

class NPKInput(BaseModel):
    N: float
    P: float
    K: float

class FullInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class FertilizerInput(BaseModel):
    crop_name: str
    land_size_acres: float
    mode: Optional[str] = "chemical"
    is_tamil: Optional[bool] = False

@router.post("/recommend-by-npk")
def recommend_by_npk(data: NPKInput):
    crop = ml_service.recommend_by_npk(data.N, data.P, data.K)
    if not crop:
        raise HTTPException(status_code=500, detail="ML model not initialized properly.")
    return {"recommended_crop": crop}

@router.post("/recommend-by-7feat")
def recommend_by_7feat(data: FullInput):
    crop = ml_service.recommend_by_7feat(
        data.N, data.P, data.K, data.temperature, data.humidity, data.ph, data.rainfall
    )
    if not crop:
        raise HTTPException(status_code=500, detail="7-feature ML model not initialized properly.")
    return {"recommended_crop": crop}

@router.get("/constituency/{name}")
def get_constituency(name: str):
    info = ml_service.get_constituency_info(name)
    if not info:
        raise HTTPException(status_code=404, detail="Constituency not found or datasets missing.")
    return info

@router.post("/fertilizer-guide")
def fertilizer_guide(data: FertilizerInput):
    res = ml_service.calculate_fertilizer(data.crop_name, data.land_size_acres)
    
    chem = res["chemical"]
    org = res["organic"]
    
    if data.mode == "organic":
        if data.is_tamil:
            rec = "**இயற்கை உரப் பரிந்துரை:**\n"
            rec += f"• ஜீவாமிர்தம்: {org.get('Jeevamrutham_liters', 0)} லிட்டர்\n"
            rec += f"• பஞ்சகவ்யா: {org.get('Panchagavya_liters', 0)} லிட்டர்\n"
            rec += f"• வேப்பம் புண்ணாக்கு: {org.get('Neem_Cake_kg', 0)} கிலோ\n"
            rec += f"• மண்புழு உரம்: {org.get('Vermicompost_kg', 0)} கிலோ"
        else:
            rec = "**Organic Fertilizer Recommendation:**\n"
            rec += f"• Jeevamrutham: {org.get('Jeevamrutham_liters', 0)} L\n"
            rec += f"• Panchagavya: {org.get('Panchagavya_liters', 0)} L\n"
            rec += f"• Neem Cake: {org.get('Neem_Cake_kg', 0)} kg\n"
            rec += f"• Vermicompost: {org.get('Vermicompost_kg', 0)} kg"
    else:
        if data.is_tamil:
            rec = "**இரசாயன உரப் பரிந்துரை:**\n"
            rec += f"• யூரியா (Urea): {chem.get('Urea_bags', 0)} மூட்டை\n"
            rec += f"• டி.ஏ.பி (DAP): {chem.get('DAP_bags', 0)} மூட்டை\n"
            rec += f"• பொட்டாஷ் (MOP): {chem.get('MOP_bags', 0)} மூட்டை"
        else:
            rec = "**Chemical Fertilizer Recommendation:**\n"
            rec += f"• Urea: {chem.get('Urea_bags', 0)} bags\n"
            rec += f"• DAP: {chem.get('DAP_bags', 0)} bags\n"
            rec += f"• MOP: {chem.get('MOP_bags', 0)} bags"
        
    return {"recommendation": rec}

class SnapSolveRequest(BaseModel):
    image_base64: str
    is_tamil: Optional[bool] = False

@router.post("/snap-solve")
def snap_solve(request: SnapSolveRequest):
    # Route the image to the local plant_disease_inference function
    result = ml_service.plant_disease_inference(request.image_base64, request.is_tamil)
    return result

@router.get("/price-predict")
def get_price_prediction(crop: str):
    forecast = ml_service.predict_prices(crop)
    return {"crop": crop, "forecast": forecast}

@router.get("/crop-switch")
def crop_switch(location: str, current_crop: str):
    alt_crop = ml_service.get_crop_switch(location, current_crop)
    return {
        "current_crop": current_crop,
        "recommended_switch": alt_crop,
        "projected_growth_margin": "+24%"
    }


# ── Crop Scan History ─────────────────────────────────────────────────

class CropScanRequest(BaseModel):
    image_base64: str
    is_tamil: Optional[bool] = False


@router.post("/crop-scans")
def create_crop_scan(
    data: CropScanRequest,
    user_id: str = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Run plant disease inference and persist the result to the user's scan history."""
    import json
    result = ml_service.plant_disease_inference(data.image_base64, data.is_tamil)

    scan = CropScan(
        user_id=user_id,
        status=result["status"],
        description=json.dumps(result),
        image_url=f"data:image/jpeg;base64,{data.image_base64[:64]}...",  # Store truncated ref only
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    result["id"] = str(scan.id)
    result["image_url"] = ""
    result["created_at"] = scan.created_at.isoformat() if scan.created_at else None

    return result


@router.get("/crop-scans")
def list_crop_scans(
    user_id: str = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Return the last 20 disease scans for the authenticated user."""
    scans = (
        db.query(CropScan)
        .filter(CropScan.user_id == user_id)
        .order_by(CropScan.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": str(s.id),
            "status": s.status,
            "description": s.description,
            "image_url": s.image_url or "",
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in scans
    ]
