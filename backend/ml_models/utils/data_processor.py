import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split
from typing import Tuple, Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataProcessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_scaler = MinMaxScaler()
        
    def load_data(self, file_path: str) -> pd.DataFrame:
        """Load data from CSV file."""
        try:
            df = pd.read_csv(file_path)
            logger.info(f"Successfully loaded data from {file_path}")
            return df
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise
            
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean the dataset by handling missing values and outliers."""
        # Remove rows with missing values
        df = df.dropna()
        
        # Handle outliers using IQR method
        for column in df.select_dtypes(include=[np.number]).columns:
            Q1 = df[column].quantile(0.25)
            Q3 = df[column].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            df = df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]
            
        return df
        
    def normalize_features(self, df: pd.DataFrame, target_column: str = None) -> Tuple[np.ndarray, np.ndarray]:
        """Normalize features and target variables."""
        if target_column:
            X = df.drop(columns=[target_column])
            y = df[target_column]
            
            X_scaled = self.feature_scaler.fit_transform(X)
            y_scaled = self.scaler.fit_transform(y.values.reshape(-1, 1)).ravel()
            
            return X_scaled, y_scaled
        else:
            return self.feature_scaler.fit_transform(df), None
            
    def split_data(self, X: np.ndarray, y: np.ndarray, test_size: float = 0.2, 
                  val_size: float = 0.1) -> Tuple[np.ndarray, np.ndarray, np.ndarray, 
                                                 np.ndarray, np.ndarray, np.ndarray]:
        """Split data into training, validation, and testing sets."""
        # First split: separate test set
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # Second split: separate validation set from training set
        val_ratio = val_size / (1 - test_size)
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, test_size=val_ratio, random_state=42
        )
        
        return X_train, X_val, X_test, y_train, y_val, y_test
        
    def prepare_time_series_data(self, df: pd.DataFrame, target_column: str, 
                               sequence_length: int = 24) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare data for time series models (LSTM)."""
        data = df[target_column].values
        X, y = [], []
        
        for i in range(len(data) - sequence_length):
            X.append(data[i:(i + sequence_length)])
            y.append(data[i + sequence_length])
            
        return np.array(X), np.array(y) 