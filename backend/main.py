from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, machinery, farm, ml, weather

# Automatically create tables for SQLite/PostgreSQL
from app.core.database import engine, Base
from app.models.user import User
from app.models.farm import Farm
from app.models.machinery import Machinery
from app.models.crop_scan import CropScan

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ervizhi API", description="Production Backend for Ervizhi Agritech App")

import os

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(machinery.router, prefix="/api/machinery", tags=["Machinery"])
app.include_router(farm.router, prefix="/api/farms", tags=["Farms"])
app.include_router(ml.router, prefix="/api/ml", tags=["Machine Learning"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to the Ervizhi API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
