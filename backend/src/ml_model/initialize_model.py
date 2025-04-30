import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

def create_dummy_model():
    """
    Create a simple dummy model if the real training data is not available.
    This ensures the API can always load a model.
    """
    print("Creating a dummy model for solar panel maintenance prediction...")
    
    # Define feature columns
    feature_columns = [
        'DC_POWER', 'AC_POWER', 'AMBIENT_TEMPERATURE', 'MODULE_TEMPERATURE',
        'IRRADIATION', 'hour', 'day', 'month', 'day_of_week',
        'power_efficiency', 'weather_score'
    ]
    
    # Create dummy data
    np.random.seed(42)
    n_samples = 100
    
    # Create a DataFrame with random data
    dummy_data = pd.DataFrame({
        'DC_POWER': np.random.uniform(50, 200, n_samples),
        'AC_POWER': np.random.uniform(40, 180, n_samples),
        'AMBIENT_TEMPERATURE': np.random.uniform(15, 40, n_samples),
        'MODULE_TEMPERATURE': np.random.uniform(20, 60, n_samples),
        'IRRADIATION': np.random.uniform(200, 1000, n_samples),
        'hour': np.random.randint(6, 18, n_samples),
        'day': np.random.randint(1, 29, n_samples),
        'month': np.random.randint(1, 13, n_samples),
        'day_of_week': np.random.randint(0, 7, n_samples),
    })
    
    # Calculate derived features
    dummy_data['power_efficiency'] = dummy_data['DC_POWER'] / (dummy_data['AMBIENT_TEMPERATURE'] + 273.15)
    dummy_data['weather_score'] = dummy_data['IRRADIATION'] * 0.7 + dummy_data['MODULE_TEMPERATURE'] * 0.3
    
    # Create target variable (maintenance needed when power efficiency is low or module temp is high)
    dummy_data['maintenance_needed'] = ((dummy_data['power_efficiency'] < dummy_data['power_efficiency'].mean() * 0.8) | 
                                      (dummy_data['MODULE_TEMPERATURE'] > 45)).astype(int)
    
    # Prepare features and target
    X = dummy_data[feature_columns]
    y = dummy_data['maintenance_needed']
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train a simple Random Forest model
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X_scaled, y)
    
    # Save model, scaler, and feature columns
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    joblib.dump(model, os.path.join(current_dir, 'solar_maintenance_model.joblib'))
    joblib.dump(scaler, os.path.join(current_dir, 'feature_scaler.joblib'))
    joblib.dump(feature_columns, os.path.join(current_dir, 'feature_columns.joblib'))
    
    print("Dummy model created and saved successfully!")
    print("Files created:")
    print(f"- {os.path.join(current_dir, 'solar_maintenance_model.joblib')}")
    print(f"- {os.path.join(current_dir, 'feature_scaler.joblib')}")
    print(f"- {os.path.join(current_dir, 'feature_columns.joblib')}")
    
    return model, scaler, feature_columns

def check_and_initialize_model():
    """Check if model files exist and create them if they don't"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'solar_maintenance_model.joblib')
    scaler_path = os.path.join(current_dir, 'feature_scaler.joblib')
    features_path = os.path.join(current_dir, 'feature_columns.joblib')
    
    if os.path.exists(model_path) and os.path.exists(scaler_path) and os.path.exists(features_path):
        print("Model files already exist. No initialization needed.")
        return False
    else:
        print("Model files not found. Creating dummy model...")
        create_dummy_model()
        return True

if __name__ == "__main__":
    check_and_initialize_model() 