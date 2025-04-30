import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Conv2D, MaxPooling2D, Flatten, Dropout
import joblib
import logging
from typing import Dict, Any, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self):
        self.models = {}
        self.metrics = {}
        
    def train_random_forest(self, X_train: np.ndarray, y_train: np.ndarray, 
                          X_val: np.ndarray, y_val: np.ndarray) -> Dict[str, float]:
        """Train Random Forest Classifier."""
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # Evaluate on validation set
        y_pred = model.predict(X_val)
        metrics = {
            'accuracy': accuracy_score(y_val, y_pred),
            'precision': precision_score(y_val, y_pred, average='weighted'),
            'recall': recall_score(y_val, y_pred, average='weighted'),
            'f1': f1_score(y_val, y_pred, average='weighted')
        }
        
        self.models['random_forest'] = model
        self.metrics['random_forest'] = metrics
        return metrics
        
    def train_gradient_boosting(self, X_train: np.ndarray, y_train: np.ndarray,
                              X_val: np.ndarray, y_val: np.ndarray) -> Dict[str, float]:
        """Train Gradient Boosting Classifier."""
        model = GradientBoostingClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # Evaluate on validation set
        y_pred = model.predict(X_val)
        metrics = {
            'accuracy': accuracy_score(y_val, y_pred),
            'precision': precision_score(y_val, y_pred, average='weighted'),
            'recall': recall_score(y_val, y_pred, average='weighted'),
            'f1': f1_score(y_val, y_pred, average='weighted')
        }
        
        self.models['gradient_boosting'] = model
        self.metrics['gradient_boosting'] = metrics
        return metrics
        
    def build_feedforward_nn(self, input_dim: int) -> tf.keras.Model:
        """Build a simple feedforward neural network."""
        model = Sequential([
            Dense(64, activation='relu', input_dim=input_dim),
            Dropout(0.2),
            Dense(32, activation='relu'),
            Dropout(0.2),
            Dense(1, activation='sigmoid')
        ])
        
        model.compile(optimizer='adam',
                     loss='binary_crossentropy',
                     metrics=['accuracy'])
        
        return model
        
    def build_lstm_model(self, sequence_length: int, n_features: int) -> tf.keras.Model:
        """Build LSTM model for time series forecasting."""
        model = Sequential([
            LSTM(50, activation='relu', input_shape=(sequence_length, n_features)),
            Dropout(0.2),
            Dense(1)
        ])
        
        model.compile(optimizer='adam',
                     loss='mse',
                     metrics=['mae'])
        
        return model
        
    def build_cnn_model(self, input_shape: Tuple[int, int, int]) -> tf.keras.Model:
        """Build CNN model for thermal image processing."""
        model = Sequential([
            Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
            MaxPooling2D((2, 2)),
            Conv2D(64, (3, 3), activation='relu'),
            MaxPooling2D((2, 2)),
            Conv2D(64, (3, 3), activation='relu'),
            Flatten(),
            Dense(64, activation='relu'),
            Dropout(0.5),
            Dense(1, activation='sigmoid')
        ])
        
        model.compile(optimizer='adam',
                     loss='binary_crossentropy',
                     metrics=['accuracy'])
        
        return model
        
    def save_model(self, model_name: str, filepath: str):
        """Save trained model to disk."""
        if model_name in self.models:
            if isinstance(self.models[model_name], tf.keras.Model):
                self.models[model_name].save(filepath)
            else:
                joblib.dump(self.models[model_name], filepath)
            logger.info(f"Model {model_name} saved to {filepath}")
        else:
            logger.error(f"Model {model_name} not found")
            
    def load_model(self, model_name: str, filepath: str):
        """Load trained model from disk."""
        try:
            if filepath.endswith('.h5'):
                self.models[model_name] = tf.keras.models.load_model(filepath)
            else:
                self.models[model_name] = joblib.load(filepath)
            logger.info(f"Model {model_name} loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise 