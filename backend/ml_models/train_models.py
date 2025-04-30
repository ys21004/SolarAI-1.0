import os
import sys
import logging
import pandas as pd
import numpy as np
from typing import Dict, Any

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_models.utils.data_processor import DataProcessor
from ml_models.models.model_trainer import ModelTrainer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_models(data_dir: str = '../data') -> Dict[str, Any]:
    """
    Train all ML models using the provided CSV data.
    
    Args:
        data_dir: Directory containing the CSV files
        
    Returns:
        Dictionary containing training metrics for each model
    """
    try:
        # Initialize components
        data_processor = DataProcessor()
        model_trainer = ModelTrainer()
        
        # Load and preprocess data
        logger.info("Loading and preprocessing data...")
        
        # Load environmental data
        env_data_path = os.path.join(data_dir, 'environmental_data.csv')
        env_df = data_processor.load_data(env_data_path)
        env_df = data_processor.clean_data(env_df)
        
        # Load operational data
        op_data_path = os.path.join(data_dir, 'operational_data.csv')
        op_df = data_processor.load_data(op_data_path)
        op_df = data_processor.clean_data(op_df)
        
        # Prepare features and targets
        logger.info("Preparing features and targets...")
        
        # For energy prediction
        X_energy, y_energy = data_processor.normalize_features(
            env_df, 
            target_column='energy_output'
        )
        X_train_energy, X_val_energy, X_test_energy, y_train_energy, y_val_energy, y_test_energy = \
            data_processor.split_data(X_energy, y_energy)
            
        # For anomaly detection
        X_anomaly, y_anomaly = data_processor.normalize_features(
            op_df,
            target_column='is_anomaly'
        )
        X_train_anomaly, X_val_anomaly, X_test_anomaly, y_train_anomaly, y_val_anomaly, y_test_anomaly = \
            data_processor.split_data(X_anomaly, y_anomaly)
            
        # Train models
        logger.info("Training models...")
        
        # Train energy predictor
        logger.info("Training energy predictor...")
        energy_metrics = model_trainer.train_gradient_boosting(
            X_train_energy, y_train_energy,
            X_val_energy, y_val_energy
        )
        model_trainer.save_model(
            'energy_predictor',
            os.path.join(os.path.dirname(__file__), 'models', 'energy_predictor.pkl')
        )
        
        # Train anomaly detector
        logger.info("Training anomaly detector...")
        anomaly_metrics = model_trainer.train_random_forest(
            X_train_anomaly, y_train_anomaly,
            X_val_anomaly, y_val_anomaly
        )
        model_trainer.save_model(
            'anomaly_detector',
            os.path.join(os.path.dirname(__file__), 'models', 'anomaly_detector.pkl')
        )
        
        # Train LSTM for time series forecasting
        logger.info("Training LSTM model...")
        sequence_length = 24  # 24 hours
        X_lstm, y_lstm = data_processor.prepare_time_series_data(
            op_df,
            target_column='voltage',
            sequence_length=sequence_length
        )
        lstm_model = model_trainer.build_lstm_model(
            sequence_length=sequence_length,
            n_features=1
        )
        lstm_model.fit(
            X_lstm, y_lstm,
            epochs=50,
            batch_size=32,
            validation_split=0.2,
            verbose=1
        )
        model_trainer.models['lstm'] = lstm_model
        model_trainer.save_model(
            'lstm',
            os.path.join(os.path.dirname(__file__), 'models', 'lstm_model.h5')
        )
        
        # Return training metrics
        return {
            'energy_predictor': energy_metrics,
            'anomaly_detector': anomaly_metrics,
            'lstm': lstm_model.history.history
        }
        
    except Exception as e:
        logger.error(f"Error during model training: {str(e)}")
        raise

if __name__ == "__main__":
    # Create models directory if it doesn't exist
    os.makedirs(os.path.join(os.path.dirname(__file__), 'models'), exist_ok=True)
    
    # Train models
    metrics = train_models()
    
    # Print training results
    logger.info("\nTraining Results:")
    logger.info("=================")
    
    for model_name, model_metrics in metrics.items():
        logger.info(f"\n{model_name.upper()}:")
        if isinstance(model_metrics, dict):
            for metric_name, value in model_metrics.items():
                logger.info(f"{metric_name}: {value:.4f}")
        else:
            logger.info("Training history available in the returned metrics") 