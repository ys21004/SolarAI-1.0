import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

class SolarMaintenancePredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_columns = None
        self.load_model()

    def load_model(self):
        """Load the trained model and its artifacts."""
        model_dir = os.path.join(os.path.dirname(__file__))
        
        # Load model and artifacts
        self.model = joblib.load(os.path.join(model_dir, 'solar_maintenance_model.joblib'))
        self.scaler = joblib.load(os.path.join(model_dir, 'feature_scaler.joblib'))
        self.feature_columns = joblib.load(os.path.join(model_dir, 'feature_columns.joblib'))

    def preprocess_input(self, input_data):
        """Preprocess input data to match training format."""
        # Convert input to DataFrame
        df = pd.DataFrame([input_data])
        
        # Extract time features
        current_time = datetime.now()
        df['hour'] = current_time.hour
        df['day_of_week'] = current_time.weekday()
        df['month'] = current_time.month
        
        # Calculate performance ratio
        df['performance_ratio'] = np.where(
            (df['IRRADIATION'] > 0) & (df['AMBIENT_TEMPERATURE'] > 0),
            df['DC_POWER'] / (df['IRRADIATION'] * df['AMBIENT_TEMPERATURE']),
            0
        )
        
        # Ensure all required features are present
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0
        
        # Select and order features
        X = df[self.feature_columns]
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        return X_scaled

    def predict(self, input_data):
        """Make a prediction for the given input data."""
        # Preprocess input
        X = self.preprocess_input(input_data)
        
        # Make prediction
        prediction = self.model.predict(X)[0]
        probability = self.model.predict_proba(X)[0]
        
        # Return prediction and confidence
        return {
            'prediction': bool(prediction),
            'confidence': float(probability[1]),  # Probability of maintenance needed
            'timestamp': datetime.now().isoformat()
        } 