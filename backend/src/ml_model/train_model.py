import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import joblib
from datetime import datetime

def parse_datetime(date_str):
    try:
        # Try ISO format first (2020-05-15 00:00:00)
        return pd.to_datetime(date_str)
    except:
        try:
            # Try dd-mm-yyyy format (15-05-2020 00:00)
            return pd.to_datetime(date_str, format='%d-%m-%Y %H:%M')
        except:
            return pd.NaT

def load_and_preprocess_data():
    # Define file paths
    base_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '..', 'SolarAI_ModelTest', 'Solar Power Generation Data')
    plant1_gen = os.path.join(base_path, 'Plant_1_Generation_Data.csv')
    plant1_weather = os.path.join(base_path, 'Plant_1_Weather_Sensor_Data.csv')
    plant2_gen = os.path.join(base_path, 'Plant_2_Generation_Data.csv')
    plant2_weather = os.path.join(base_path, 'Plant_2_Weather_Sensor_Data.csv')

    # Load data
    print("Loading data...")
    df1_gen = pd.read_csv(plant1_gen)
    df1_weather = pd.read_csv(plant1_weather)
    df2_gen = pd.read_csv(plant2_gen)
    df2_weather = pd.read_csv(plant2_weather)

    # Convert DATE_TIME to datetime with flexible format handling
    print("Converting dates...")
    for df in [df1_gen, df1_weather, df2_gen, df2_weather]:
        df['DATE_TIME'] = df['DATE_TIME'].apply(parse_datetime)

    # Merge generation and weather data for each plant
    print("Merging datasets...")
    df1 = pd.merge(df1_gen, df1_weather, on='DATE_TIME', how='inner')
    df2 = pd.merge(df2_gen, df2_weather, on='DATE_TIME', how='inner')

    # Combine both plants' data
    df = pd.concat([df1, df2], ignore_index=True)

    # Feature engineering
    print("Engineering features...")
    df['hour'] = df['DATE_TIME'].dt.hour
    df['day_of_week'] = df['DATE_TIME'].dt.dayofweek
    df['month'] = df['DATE_TIME'].dt.month

    # Handle missing and infinite values
    df = df.replace([np.inf, -np.inf], np.nan)
    
    # Calculate performance ratio with handling for division by zero
    df['performance_ratio'] = np.where(
        (df['IRRADIATION'] > 0) & (df['AMBIENT_TEMPERATURE'] > 0),
        df['DC_POWER'] / (df['IRRADIATION'] * df['AMBIENT_TEMPERATURE']),
        0  # Default value when conditions are not met
    )

    # Fill missing values with appropriate strategies
    numeric_columns = ['DC_POWER', 'AC_POWER', 'AMBIENT_TEMPERATURE', 'MODULE_TEMPERATURE', 'IRRADIATION']
    for col in numeric_columns:
        df[col] = df[col].fillna(df[col].median())
    
    df['performance_ratio'] = df['performance_ratio'].fillna(0)

    # Define features
    feature_columns = [
        'DC_POWER', 'AC_POWER', 'AMBIENT_TEMPERATURE', 'MODULE_TEMPERATURE',
        'IRRADIATION', 'hour', 'day_of_week', 'month', 'performance_ratio'
    ]

    # Create maintenance target
    print("Creating maintenance target...")
    # Define thresholds for maintenance
    temp_threshold = 75  # High module temperature
    performance_threshold = 0.7  # Low performance ratio
    power_threshold = 0.5  # Low power output relative to max

    # Calculate max power for normalization
    max_power = df['DC_POWER'].max()

    # Create maintenance target
    df['needs_maintenance'] = (
        (df['MODULE_TEMPERATURE'] > temp_threshold) |
        (df['performance_ratio'] < performance_threshold) |
        (df['DC_POWER'] / max_power < power_threshold)
    ).astype(int)

    # Print class distribution
    print("\nClass distribution:")
    print(df['needs_maintenance'].value_counts(normalize=True))

    # Prepare features and target
    X = df[feature_columns]
    y = df['needs_maintenance']

    # Split data
    print("\nSplitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Scale features
    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, feature_columns

def train_model(X_train, y_train):
    print("Training model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train, y_train)
    return model

def save_model_and_artifacts(model, scaler, feature_columns):
    print("Saving model and artifacts...")
    # Create directory if it doesn't exist
    model_dir = os.path.join(os.path.dirname(__file__))
    os.makedirs(model_dir, exist_ok=True)

    # Save model and artifacts
    joblib.dump(model, os.path.join(model_dir, 'solar_maintenance_model.joblib'))
    joblib.dump(scaler, os.path.join(model_dir, 'feature_scaler.joblib'))
    joblib.dump(feature_columns, os.path.join(model_dir, 'feature_columns.joblib'))
    print("Model and artifacts saved successfully!")

def main():
    print("Starting model training...")
    X_train, X_test, y_train, y_test, scaler, feature_columns = load_and_preprocess_data()
    model = train_model(X_train, y_train)
    save_model_and_artifacts(model, scaler, feature_columns)
    print("Model training completed successfully!")

if __name__ == "__main__":
    main() 