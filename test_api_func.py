import sys
import os
import base64
sys.path.append('d:/Ervizhi/backend')

from app.services.ml_service import ml_service

# test with the blue image we created earlier
with open('blue.png', 'rb') as f:
    blue_b64 = base64.b64encode(f.read()).decode('utf-8')

res = ml_service.plant_disease_inference(blue_b64, False)
print("Blue Result:", res)

# test with the green image
with open('green.png', 'rb') as f:
    green_b64 = base64.b64encode(f.read()).decode('utf-8')

res2 = ml_service.plant_disease_inference(green_b64, False)
print("Green Result:", res2)
