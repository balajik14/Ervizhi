import sys
import os
sys.path.append('d:/Ervizhi')

from backend.app.services.ml_service import ml_service

if ml_service.disease_model is not None:
    print("YOLO Classes:", ml_service.disease_model.names)
else:
    print("Model not loaded.")
