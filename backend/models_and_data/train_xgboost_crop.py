import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def train_crop_model(csv_path):
    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Check for missing values
    if df.isnull().sum().any():
        print("Handling missing values...")
        df = df.dropna()
        
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']
    
    # Encode labels
    print("Encoding labels...")
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Save the label encoder classes to map back later
    joblib.dump(le, 'label_encoder_7feat.pkl')
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
    
    print("Training XGBoost Classifier...")
    model = xgb.XGBClassifier(
        objective='multi:softprob',
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    # Save model
    model_path = 'xgboost_crop_7feat.json'
    model.save_model(model_path)
    print(f"Model saved successfully to {model_path}")
    print("Label encoder saved to label_encoder_7feat.pkl")

if __name__ == "__main__":
    data_file = 'Crop_recommendation.csv'
    if os.path.exists(data_file):
        train_crop_model(data_file)
    else:
        print(f"Dataset {data_file} not found in the current directory.")
