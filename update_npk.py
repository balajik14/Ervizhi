import json
import os

files = [
    r'd:\Ervizhi\mobile\assets\crop_npk_reqs.json',
    r'd:\Ervizhi\web\assets\crop_npk_reqs.json'
]

# Realistic NPK requirements per hectare (kg/ha) for common crops in Tamil Nadu
updates = {
    'paddy': {'N': 120.0, 'P': 60.0, 'K': 60.0},
    'tomato': {'N': 150.0, 'P': 100.0, 'K': 100.0},
    'sugarcane': {'N': 250.0, 'P': 100.0, 'K': 120.0},
    'banana': {'N': 200.0, 'P': 100.0, 'K': 300.0},
    'cotton': {'N': 120.0, 'P': 60.0, 'K': 60.0},
    'onion': {'N': 100.0, 'P': 50.0, 'K': 50.0},
    'turmeric': {'N': 150.0, 'P': 60.0, 'K': 108.0},
    'coconut': {'N': 150.0, 'P': 100.0, 'K': 200.0}, # approximated
    'groundnut': {'N': 25.0, 'P': 50.0, 'K': 75.0}, # legume, needs less N
    'chickpea': {'N': 20.0, 'P': 40.0, 'K': 20.0},
    'blackgram': {'N': 20.0, 'P': 40.0, 'K': 20.0},
    'maize': {'N': 135.0, 'P': 62.5, 'K': 50.0},
    'mango': {'N': 100.0, 'P': 100.0, 'K': 100.0},
}

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for crop, req in updates.items():
            if crop in data:
                data[crop] = req
            else:
                data[crop] = req
                
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Updated {file_path}")
    else:
        print(f"File not found: {file_path}")
