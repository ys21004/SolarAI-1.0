from flask import Blueprint, request, jsonify
import numpy as np
import pandas as pd
from typing import Dict, Any
import logging
import os
import sys

# Add the ml_models directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ml_models'))

from ml_models.utils.data_processor import DataProcessor
from ml_models.models.model_trainer import ModelTrainer
from ml_models.utils.optimizer import PanelOptimizer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Blueprint
ml_bp = Blueprint('ml', __name__)

# Initialize components
data_processor = DataProcessor()
model_trainer = ModelTrainer()

@ml_bp.route('/predict-energy', methods=['POST'])
def predict_energy():
    """Predict solar panel energy output based on environmental conditions."""
    try:
        data = request.get_json()
        
        # Extract features from request
        features = np.array([
            data['temperature'],
            data['solar_irradiance'],
            data['wind_speed'],
            data['humidity']
        ]).reshape(1, -1)
        
        # Load and use the trained model
        model_path = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'models', 'energy_predictor.pkl')
        if not os.path.exists(model_path):
            return jsonify({'error': 'Model not found. Please train the model first.'}), 404
            
        model = model_trainer.load_model('energy_predictor', model_path)
        prediction = model.predict(features)[0]
        
        return jsonify({
            'predicted_energy': float(prediction),
            'confidence': float(model.predict_proba(features)[0][1])
        })
        
    except Exception as e:
        logger.error(f"Error in predict_energy: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/detect-anomalies', methods=['POST'])
def detect_anomalies():
    """Detect anomalies in solar panel performance."""
    try:
        data = request.get_json()
        
        # Extract features from request
        features = np.array([
            data['voltage'],
            data['current'],
            data['temperature'],
            data['solar_irradiance']
        ]).reshape(1, -1)
        
        # Load and use the trained model
        model_path = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'models', 'anomaly_detector.pkl')
        if not os.path.exists(model_path):
            return jsonify({'error': 'Model not found. Please train the model first.'}), 404
            
        model = model_trainer.load_model('anomaly_detector', model_path)
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]
        
        return jsonify({
            'is_anomaly': bool(prediction),
            'anomaly_probability': float(probability),
            'severity': 'high' if probability > 0.8 else 'medium' if probability > 0.5 else 'low'
        })
        
    except Exception as e:
        logger.error(f"Error in detect_anomalies: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/optimize-panel', methods=['POST'])
def optimize_panel():
    """Optimize panel settings for maximum energy output."""
    try:
        data = request.get_json()
        
        # Define objective function based on current conditions
        def objective_function(x):
            # x[0] = tilt angle, x[1] = azimuth angle
            # This is a simplified example - replace with actual model prediction
            return -((x[0] - 30)**2 + (x[1] - 180)**2)  # Example objective
        
        # Initialize optimizer
        optimizer = PanelOptimizer(objective_function)
        
        # Define bounds for optimization
        bounds = [
            (0, 90),    # Tilt angle bounds
            (0, 360)    # Azimuth angle bounds
        ]
        
        # Run optimization
        best_solution, best_fitness = optimizer.particle_swarm_optimization(
            bounds=bounds,
            n_particles=30,
            max_iterations=100
        )
        
        return jsonify({
            'optimal_tilt': float(best_solution[0]),
            'optimal_azimuth': float(best_solution[1]),
            'expected_improvement': float(best_fitness)
        })
        
    except Exception as e:
        logger.error(f"Error in optimize_panel: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/train-model', methods=['POST'])
def train_model():
    """Train or retrain ML models with new data."""
    try:
        data = request.get_json()
        model_type = data.get('model_type')
        csv_path = data.get('csv_path')
        
        if not model_type or not csv_path:
            return jsonify({'error': 'Missing required parameters'}), 400
            
        # Load and preprocess data
        df = data_processor.load_data(csv_path)
        df = data_processor.clean_data(df)
        
        # Prepare features and target
        X, y = data_processor.normalize_features(df, target_column='energy_output')
        X_train, X_val, X_test, y_train, y_val, y_test = data_processor.split_data(X, y)
        
        # Train appropriate model
        if model_type == 'energy_predictor':
            metrics = model_trainer.train_gradient_boosting(X_train, y_train, X_val, y_val)
            model_path = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'models', 'energy_predictor.pkl')
        elif model_type == 'anomaly_detector':
            metrics = model_trainer.train_random_forest(X_train, y_train, X_val, y_val)
            model_path = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'models', 'anomaly_detector.pkl')
        else:
            return jsonify({'error': 'Invalid model type'}), 400
            
        # Save trained model
        model_trainer.save_model(model_type, model_path)
        
        return jsonify({
            'message': f'{model_type} trained successfully',
            'metrics': metrics
        })
        
    except Exception as e:
        logger.error(f"Error in train_model: {str(e)}")
        return jsonify({'error': str(e)}), 500 