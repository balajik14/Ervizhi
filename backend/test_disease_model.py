import os
import base64
from app.services.ml_service import ml_service

def test_disease_detection():
    # Pick a sample image from the downloaded healthy dataset
    sample_img_path = "PlantVillage-Dataset/raw/color/Healthy/"
    if not os.path.exists(sample_img_path):
        print("Dataset path not found.")
        return
        
    sample_file = next(iter(os.listdir(sample_img_path)))
    full_path = os.path.join(sample_img_path, sample_file)
    
    with open(full_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode('utf-8')
        
    print(f"Testing with image: {sample_file}")
    status, description = ml_service.plant_disease_inference(img_b64, is_tamil=False)
    print(f"\n--- Output from ML Model ---")
    print(f"Status: {status}")
    print(f"Description: {description}")
    
    # Pick a sample from diseased
    sample_img_path_d = "PlantVillage-Dataset/raw/color/Diseased/"
    sample_file_d = next(iter(os.listdir(sample_img_path_d)))
    full_path_d = os.path.join(sample_img_path_d, sample_file_d)
    
    with open(full_path_d, "rb") as f:
        img_b64_d = base64.b64encode(f.read()).decode('utf-8')
        
    print(f"\nTesting with image: {sample_file_d}")
    status_d, description_d = ml_service.plant_disease_inference(img_b64_d, is_tamil=False)
    print(f"\n--- Output from ML Model ---")
    print(f"Status: {status_d}")
    print(f"Description: {description_d}")

if __name__ == "__main__":
    test_disease_detection()
