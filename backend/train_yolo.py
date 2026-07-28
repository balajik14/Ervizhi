from ultralytics import YOLO
import os

def train_model():
    last_weights = 'D:/Ervizhi/backend/runs/plant_disease_yolo/weights/last.pt'
    
    if os.path.exists(last_weights):
        print(f"Resuming training from {last_weights} for maximum accuracy...")
        model = YOLO(last_weights)
        results = model.train(resume=True)
    else:
        print("Loading YOLOv8n model...")
        model = YOLO('yolov8n.pt')  # load a pretrained model
        
        print("Starting training on PlantDisease416x416...")
        # Train the model using the provided dataset
        results = model.train(
            data='D:/Ervizhi/PlantDisease416x416/data.yaml',
            epochs=10,        # training for maximum accuracy requested by user
            imgsz=416,
            batch=16,
            project='D:/Ervizhi/backend/runs',
            name='plant_disease_yolo',
            exist_ok=True
        )
    print("Training finished.")
    
    # After training, copy the best weights to backend/disease_yolo.pt
    best_weights = 'D:/Ervizhi/backend/runs/plant_disease_yolo/weights/best.pt'
    if os.path.exists(best_weights):
        import shutil
        shutil.copy(best_weights, 'D:/Ervizhi/backend/disease_yolo.pt')
        print(f"Model saved to D:/Ervizhi/backend/disease_yolo.pt")

if __name__ == '__main__':
    # Add ultralytics compatibility fix for Windows multiprocessing
    import multiprocessing
    multiprocessing.freeze_support()
    train_model()
