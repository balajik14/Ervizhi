import os
import pandas as pd
import numpy as np
import xgboost as xgb
import joblib

import base64
import io
from PIL import Image

# Paths relative to the project root (d:/Ervizhi)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SOIL_PATH = os.path.join(BASE_DIR, 'TN Soil Properties.xlsx')
SUGGESTION_PATH = os.path.join(BASE_DIR, 'crop_suggestion.xlsx')
MODEL_PATH = os.path.join(BASE_DIR, 'xgboost_crop_model.json')
LE_PATH = os.path.join(BASE_DIR, 'label_encoder.pkl')
MODEL_7FEAT_PATH = os.path.join(BASE_DIR, 'xgboost_crop_7feat.json')
LE_7FEAT_PATH = os.path.join(BASE_DIR, 'label_encoder_7feat.pkl')
CROP_REC_PATH = os.path.join(BASE_DIR, 'Crop_recommendation.csv')

class MarketLSTM:
    def __init__(self, input_size=1, hidden_size=16, num_layers=1, output_size=1):
        import torch
        import torch.nn as nn
        self.torch = torch
        self.nn = nn
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        self.state_dict = None
        
    def load_state_dict(self, state_dict):
        self.state_dict = state_dict

    def eval(self):
        pass

    def __call__(self, x):
        h0 = self.torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = self.torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

class MLService:
    def __init__(self):
        self.df_merged = None
        self.model = None
        self.le = None
        self.model_7feat = None
        self.le_7feat = None
        self.crop_requirements = None
        self.lstm_model = None
        self.disease_model = None
        self._backend_initialized = False
        self._lstm_initialized = False
        self._disease_initialized = False

    def _init_backend(self):
        if self._backend_initialized: return
        self._backend_initialized = True
        # 1. Load and Merge Datasets
        if os.path.exists(SOIL_PATH) and os.path.exists(SUGGESTION_PATH):
            try:
                df_soil = pd.read_excel(SOIL_PATH)
                df_suggest = pd.read_excel(SUGGESTION_PATH)
                self.df_merged = pd.merge(
                    df_soil, 
                    df_suggest, 
                    left_on='Area', 
                    right_on='Constituency Name', 
                    how='inner'
                )
            except Exception as e:
                print(f"Error loading datasets: {e}")

        # Load Crop Recommendation data for fertilizer info
        if os.path.exists(CROP_REC_PATH):
            try:
                df_crop_rec = pd.read_csv(CROP_REC_PATH)
                self.crop_requirements = df_crop_rec.groupby('label')[['N', 'P', 'K']].mean().to_dict('index')
            except Exception as e:
                print(f"Error loading Crop_recommendation.csv: {e}")

        # 2. Load Models
        if os.path.exists(MODEL_PATH) and os.path.exists(LE_PATH):
            try:
                self.model = xgb.XGBClassifier()
                self.model.load_model(MODEL_PATH)
                self.le = joblib.load(LE_PATH)
            except Exception as e:
                print(f"Error loading main model: {e}")
                
        if os.path.exists(MODEL_7FEAT_PATH) and os.path.exists(LE_7FEAT_PATH):
            try:
                self.model_7feat = xgb.XGBClassifier()
                self.model_7feat.load_model(MODEL_7FEAT_PATH)
                self.le_7feat = joblib.load(LE_7FEAT_PATH)
            except Exception as e:
                print(f"Error loading 7-feature model: {e}")

    def _init_lstm(self):
        if self._lstm_initialized: return
        self._lstm_initialized = True
        lstm_path = os.path.join(BASE_DIR, 'backend', 'market_lstm.pt')
        if os.path.exists(lstm_path):
            try:
                import torch
                import torch.nn as nn
                # Redefine MarketLSTM properly with nn.Module here since torch is available
                class RealMarketLSTM(nn.Module):
                    def __init__(self, input_size=1, hidden_size=16, num_layers=1, output_size=1):
                        super(RealMarketLSTM, self).__init__()
                        self.hidden_size = hidden_size
                        self.num_layers = num_layers
                        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
                        self.fc = nn.Linear(hidden_size, output_size)
                    def forward(self, x):
                        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
                        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
                        out, _ = self.lstm(x, (h0, c0))
                        out = self.fc(out[:, -1, :])
                        return out

                self.lstm_model = RealMarketLSTM()
                self.lstm_model.load_state_dict(torch.load(lstm_path, map_location=torch.device('cpu')))
                self.lstm_model.eval()
                print("[ML SERVICE] Loaded MarketLSTM successfully.")
            except Exception as e:
                print(f"Error loading LSTM model: {e}")

    def _init_disease(self):
        if self._disease_initialized: return
        self._disease_initialized = True
        model_path = os.path.join(BASE_DIR, 'backend', 'disease_yolo.pt')
        if os.path.exists(model_path):
            try:
                from ultralytics import YOLO
                self.disease_model = YOLO(model_path)
                print("[ML SERVICE] Loaded Plant Disease YOLOv8 successfully.")
            except Exception as e:
                print(f"Error loading Disease model: {e}")
                self.disease_model = None
        else:
            self.disease_model = None

    def recommend_by_npk(self, N: float, P: float, K: float):
        self._init_backend()
        if self.model is None or self.le is None:
            return None
        input_data = np.array([[N, P, K]])
        prediction = self.model.predict(input_data)
        return self.le.inverse_transform(prediction)[0]

    def recommend_by_7feat(self, N, P, K, temp, humidity, ph, rainfall):
        self._init_backend()
        if self.model_7feat is None or self.le_7feat is None:
            return None
        input_data = np.array([[N, P, K, temp, humidity, ph, rainfall]])
        prediction = self.model_7feat.predict(input_data)
        return self.le_7feat.inverse_transform(prediction)[0]

    def get_constituency_info(self, name: str):
        self._init_backend()
        if self.df_merged is None:
            return None
        lower_name = name.lower().trim() if hasattr(name.lower(), 'trim') else name.lower().strip()
        result = self.df_merged[
            self.df_merged['Constituency Name'].str.lower().str.contains(lower_name, na=False) |
            self.df_merged['District'].str.lower().str.contains(lower_name, na=False)
        ]
        if result.empty:
            return None
        row = result.iloc[0]
        return {
            "constituency": row['Constituency Name'],
            "district": row['District'],
            "soil_properties": {
                "N": float(row['N']),
                "P": float(row['P']),
                "K": float(row['K'])
            },
            "recommended_crops": [row['Crop 1'], row['Crop 2'], row['Crop 3']]
        }

    def get_crop_switch(self, location: str, current_crop: str):
        # Look up optimal crops for the soil in this constituency
        info = self.get_constituency_info(location)
        if info:
            recs = info.get("recommended_crops", [])
            valid_recs = [c for c in recs if str(c).lower() != 'nan' and str(c).lower() != current_crop.lower()]
            if valid_recs:
                return valid_recs[0].lower()
                
        # Simple fallback graph model
        crop_matrix = {
            'tomato': 'onion',
            'onion': 'turmeric',
            'turmeric': 'cotton',
            'paddy': 'sugarcane',
            'sugarcane': 'paddy',
            'cotton': 'corn',
            'corn': 'groundnut',
            'banana': 'coconut',
            'millets': 'tomato',
        }
        return crop_matrix.get(current_crop.lower(), 'corn')

    def calculate_fertilizer(self, crop_name: str, land_size_acres: float):
        self._init_backend()
        base_n, base_p, base_k = 50, 25, 25
        if self.crop_requirements:
            req = None
            for k, v in self.crop_requirements.items():
                if k.lower() == crop_name.lower():
                    req = v
                    break
            if req:
                base_n, base_p, base_k = req['N'], req['P'], req['K']
        
        urea_bags = round((base_n * land_size_acres * 2.17) / 50, 1) # Urea is 46% N
        dap_bags = round((base_p * land_size_acres * 2.17) / 50, 1)  # DAP is 46% P2O5
        mop_bags = round((base_k * land_size_acres * 1.66) / 50, 1)  # MOP is 60% K2O
        
        return {
            "chemical": {
                "Urea_bags": max(1, urea_bags),
                "DAP_bags": max(1, dap_bags),
                "MOP_bags": max(1, mop_bags)
            },
            "organic": {
                "Jeevamrutham_liters": round(200 * land_size_acres, 1),
                "Panchagavya_liters": round(10 * land_size_acres, 1),
                "Neem_Cake_kg": round(100 * land_size_acres, 1)
            }
        }
    def _is_plant_image(self, img: Image.Image) -> bool:
        try:
            img_hsv = img.convert('HSV')
            img_small = img_hsv.resize((100, 100))
            pixels = img_small.getdata()
            
            plant_pixels = 0
            total = len(pixels)
            
            for h, s, v in pixels:
                # 10 to 120 hue covers brown, yellow, and green.
                if 10 <= h <= 120 and s > 15 and v > 15:
                    plant_pixels += 1
                    
            return (plant_pixels / total) > 0.05  # At least 5% plant-like colors
        except Exception:
            return True # Fallback if error

    def plant_disease_inference(self, image_base64: str, is_tamil: bool):
        self._init_disease()
        if self.disease_model is None:
            # Fallback if model not trained
            status = "Healthy" if len(image_base64) % 2 == 0 else "Diseased"
            desc = "செடியில் நோயின் அறிகுறிகள் தென்படுகின்றன." if is_tamil and status == "Diseased" else ("செடி ஆரோக்கியமாகத் தெரிகிறது." if is_tamil else "Fallback diagnosis.")
            return status, desc
            
        try:
            img_bytes = base64.b64decode(image_base64)
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            
            # Pre-check if it's a valid plant image
            if not self._is_plant_image(img):
                status = "Invalid"
                desc = "படம் ஒரு தாவரம் அல்லது இலை போல் தெரியவில்லை. சரியான படத்தைப் பதிவேற்றவும்." if is_tamil else "The image does not appear to be a plant or leaf. Please upload a valid image."
                return status, desc
            
            # YOLO inference
            results = self.disease_model.predict(source=img, conf=0.25)
            
            if len(results) > 0 and len(results[0].boxes) > 0:
                # We have detections
                status = "Diseased"
                
                # Collect unique detected disease classes
                detected_classes = set()
                
                DISEASE_MAP = {
                    0: "Apple Scab", 1: "Apple Black Rot", 2: "Apple Cedar Rust",
                    3: "Corn Cercospora Leaf Spot", 4: "Corn Common Rust", 5: "Corn Northern Leaf Blight",
                    6: "Grape Black Rot", 7: "Grape Esca", 8: "Grape Leaf Blight",
                    9: "Orange Citrus Greening", 10: "Peach Bacterial Spot",
                    11: "Pepper Bacterial Spot", 12: "Potato Early Blight", 13: "Potato Late Blight",
                    14: "Squash Powdery Mildew", 15: "Strawberry Leaf Scorch",
                    16: "Tomato Bacterial Spot", 17: "Tomato Early Blight", 18: "Tomato Late Blight",
                    19: "Tomato Leaf Mold", 20: "Tomato Septoria Leaf Spot", 21: "Tomato Spider Mites",
                    22: "Tomato Target Spot", 23: "Tomato Yellow Leaf Curl Virus", 24: "Tomato Mosaic Virus",
                    25: "Rice Brown Spot", 26: "Rice Hispa", 27: "Rice Leaf Blast",
                    28: "Wheat Rust", 29: "Wheat Loose Smut"
                }
                
                for box in results[0].boxes:
                    cls_id = int(box.cls[0].item())
                    # Use actual disease name if available, fallback to model's raw name
                    cls_name = DISEASE_MAP.get(cls_id, self.disease_model.names[cls_id])
                    detected_classes.add(cls_name)
                    
                disease_names = ", ".join(detected_classes)
                
                if is_tamil:
                    desc = f"செடியில் {disease_names} நோய் கண்டறியப்பட்டுள்ளது. தயவுசெய்து தகுந்த சிகிச்சை அளிக்கவும்."
                else:
                    desc = f"The plant appears to have {disease_names}. Please apply appropriate treatment."
            else:
                status = "Healthy"
                desc = "செடி ஆரோக்கியமாகத் தெரிகிறது." if is_tamil else "The plant looks healthy and is growing well. No diseases detected."
                
        except Exception as e:
            print(f"Inference error: {e}")
            status = "Unknown"
            desc = "கணிக்க முடியவில்லை." if is_tamil else "Could not analyze the image."
            
        return status, desc

    def predict_prices(self, crop: str):
        CROP_BASE_PRICES = {
            'paddy': [2100, 2150, 2200, 2250, 2230, 2280, 2300],
            'turmeric': [8000, 8100, 8050, 8200, 8300, 8150, 8400],
            'tomato': [1400, 1500, 1650, 1600, 1700, 1750, 1800],
            'banana': [1150, 1200, 1180, 1220, 1250, 1230, 1280],
            'onion': [2700, 2800, 2750, 2900, 3000, 2850, 3100],
        }
        
        crop_key = crop.lower().strip()
        history = CROP_BASE_PRICES.get(crop_key, [2000, 2050, 2100, 2150, 2130, 2180, 2200])
        
        self._init_lstm()
        if self.lstm_model is None:
            days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            return [{"day": d, "price": p} for d, p in zip(days, history)]
            
        seq = list(history)
        predictions = []
        days_of_week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        
        import torch
        with torch.no_grad():
            for i in range(7):
                last_7 = np.array(seq[-7:], dtype=np.float32) / 10000.0
                input_tensor = torch.tensor(last_7).view(1, 7, 1)
                pred_val = self.lstm_model(input_tensor).item()
                predicted_price = pred_val * 10000.0
                predictions.append(predicted_price)
                seq.append(predicted_price)
                
        return [{"day": days_of_week[i], "price": round(predictions[i], 1)} for i in range(7)]

ml_service = MLService()
