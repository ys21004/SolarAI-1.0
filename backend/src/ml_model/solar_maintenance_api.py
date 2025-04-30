from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import os

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Import model initialization function - use relative import
from .initialize_model import check_and_initialize_model

# Load the saved model and scaler
try:
    model_path = os.path.join(current_dir, 'solar_maintenance_model.joblib')
    scaler_path = os.path.join(current_dir, 'feature_scaler.joblib')
    features_path = os.path.join(current_dir, 'feature_columns.joblib')
    
    # Check if model exists and initialize if needed
    if not (os.path.exists(model_path) and os.path.exists(scaler_path) and os.path.exists(features_path)):
        print("Model files not found. Initializing...")
        check_and_initialize_model()
    
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    feature_columns = joblib.load(features_path)
    print("Model and related files loaded successfully!")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None
    scaler = None
    feature_columns = None

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint to predict maintenance needs for solar panels
    Expected input format:
    {
        "dc_power": float,
        "ac_power": float,
        "ambient_temperature": float,
        "module_temperature": float,
        "irradiation": float,
        "timestamp": "YYYY-MM-DD HH:MM:SS"
    }
    """
    if model is None or scaler is None or feature_columns is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['dc_power', 'ac_power', 'ambient_temperature', 
                         'module_temperature', 'irradiation', 'timestamp']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Parse timestamp
        timestamp = datetime.strptime(data['timestamp'], '%Y-%m-%d %H:%M:%S')
        
        # Extract time features
        hour = timestamp.hour
        day = timestamp.day
        month = timestamp.month
        day_of_week = timestamp.weekday()
        
        # Calculate derived features
        dc_power = float(data['dc_power'])
        ambient_temp = float(data['ambient_temperature'])
        
        # Prevent division by zero
        if ambient_temp + 273.15 == 0:
            power_efficiency = 0
        else:
            power_efficiency = dc_power / (ambient_temp + 273.15)
        
        weather_score = (float(data['irradiation']) * 0.7 + float(data['module_temperature']) * 0.3)
        
        # Create feature vector
        input_data = {
            'DC_POWER': dc_power,
            'AC_POWER': float(data['ac_power']),
            'AMBIENT_TEMPERATURE': ambient_temp,
            'MODULE_TEMPERATURE': float(data['module_temperature']),
            'IRRADIATION': float(data['irradiation']),
            'hour': hour,
            'day': day,
            'month': month,
            'day_of_week': day_of_week,
            'power_efficiency': power_efficiency,
            'weather_score': weather_score
        }
        
        # Ensure all feature columns are present and in the right order
        features = pd.DataFrame([input_data])[feature_columns]
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction = bool(model.predict(features_scaled)[0])
        
        # Get prediction probability
        probability = float(model.predict_proba(features_scaled)[0][1])
        
        # Determine maintenance status and reason
        maintenance_needed = prediction
        maintenance_reason = "Normal operation"
        
        if maintenance_needed:
            if dc_power < 70:  # Assuming threshold
                maintenance_reason = "Low DC power output"
            elif float(data['module_temperature']) > 45:
                maintenance_reason = "High module temperature"
            elif power_efficiency < 0.25:  # Assuming threshold
                maintenance_reason = "Low power efficiency"
            else:
                maintenance_reason = "Multiple factors require attention"
        
        # Prepare response
        response = {
            "maintenance_needed": maintenance_needed,
            "probability": probability,
            "reason": maintenance_reason,
            "metrics": {
                "power_efficiency": power_efficiency,
                "weather_score": weather_score
            },
            "recommendations": []
        }
        
        # Add recommendations if maintenance is needed
        if maintenance_needed:
            if "Low DC power" in maintenance_reason:
                response["recommendations"].append("Check for panel obstructions or dirt")
                response["recommendations"].append("Inspect panel connections")
            elif "High module temperature" in maintenance_reason:
                response["recommendations"].append("Check cooling system")
                response["recommendations"].append("Ensure proper ventilation")
            elif "Low power efficiency" in maintenance_reason:
                response["recommendations"].append("Perform full system diagnostic")
                response["recommendations"].append("Check inverter efficiency")
            else:
                response["recommendations"].append("Schedule comprehensive maintenance check")
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "model_features": feature_columns if feature_columns else None
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 