# Solar Panel Maintenance Detection Model
# This script contains the complete implementation of the solar panel maintenance detection model

# Import necessary libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score
import xgboost as xgb
import warnings
warnings.filterwarnings('ignore')

# Set random seed for reproducibility
np.random.seed(42)

def load_and_preprocess_data():
    """Load and preprocess the solar panel data"""
    # Load the data
    plant1_gen = pd.read_csv('Plant_1_Generation_Data.csv')
    plant1_weather = pd.read_csv('Plant_1_Weather_Sensor_Data.csv')
    plant2_gen = pd.read_csv('Plant_2_Generation_Data.csv')
    plant2_weather = pd.read_csv('Plant_2_Weather_Sensor_Data.csv')
    
    # Convert DATE_TIME to datetime
    plant1_gen['DATE_TIME'] = pd.to_datetime(plant1_gen['DATE_TIME'])
    plant1_weather['DATE_TIME'] = pd.to_datetime(plant1_weather['DATE_TIME'])
    plant2_gen['DATE_TIME'] = pd.to_datetime(plant2_gen['DATE_TIME'])
    plant2_weather['DATE_TIME'] = pd.to_datetime(plant2_weather['DATE_TIME'])
    
    # Merge generation and weather data
    plant1_data = pd.merge(plant1_gen, plant1_weather, on='DATE_TIME', how='inner')
    plant2_data = pd.merge(plant2_gen, plant2_weather, on='DATE_TIME', how='inner')
    
    # Combine both plants' data
    combined_data = pd.concat([plant1_data, plant2_data], ignore_index=True)
    
    # Extract time-based features
    combined_data['hour'] = combined_data['DATE_TIME'].dt.hour
    combined_data['day'] = combined_data['DATE_TIME'].dt.day
    combined_data['month'] = combined_data['DATE_TIME'].dt.month
    combined_data['day_of_week'] = combined_data['DATE_TIME'].dt.dayofweek
    
    # Calculate additional features
    combined_data['power_efficiency'] = combined_data['DC_POWER'] / (combined_data['AMBIENT_TEMPERATURE'] + 273.15)
    combined_data['weather_score'] = (combined_data['IRRADIATION'] * 0.7 + combined_data['MODULE_TEMPERATURE'] * 0.3)
    
    return combined_data

def create_maintenance_target(data):
    """Create maintenance target variable based on power efficiency and weather conditions"""
    # Define thresholds for maintenance detection
    power_threshold = data['DC_POWER'].mean() * 0.7  # 70% of mean power
    temp_threshold = 45  # Maximum safe temperature
    
    # Check conditions that might indicate maintenance need
    low_power = data['DC_POWER'] < power_threshold
    high_temp = data['MODULE_TEMPERATURE'] > temp_threshold
    low_efficiency = data['power_efficiency'] < data['power_efficiency'].mean() * 0.8
    
    # Return 1 if maintenance is needed, 0 otherwise
    return (low_power | high_temp | low_efficiency).astype(int)

def train_models(X_train_scaled, y_train, X_test_scaled, y_test):
    """Train and evaluate multiple models"""
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(random_state=42),
        'XGBoost': xgb.XGBClassifier(random_state=42)
    }
    
    best_model = None
    best_score = 0
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test_scaled)
        
        # Print model performance
        print(f"\n{name} Model Performance:")
        print(classification_report(y_test, y_pred))
        
        # Calculate and print cross-validation scores
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
        print(f"Cross-validation scores: {cv_scores}")
        print(f"Average CV score: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
        
        # Update best model if current model performs better
        if cv_scores.mean() > best_score:
            best_score = cv_scores.mean()
            best_model = model
    
    return best_model

def plot_model_evaluation(best_model, X_test_scaled, y_test, feature_columns):
    """Plot confusion matrix and feature importance"""
    # Plot confusion matrix
    plt.figure(figsize=(8, 6))
    y_pred = best_model.predict(X_test_scaled)
    sns.heatmap(confusion_matrix(y_test, y_pred), annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.show()
    
    # Plot feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': best_model.feature_importances_
    })
    feature_importance = feature_importance.sort_values('importance', ascending=False)
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x='importance', y='feature', data=feature_importance)
    plt.title('Feature Importance')
    plt.tight_layout()
    plt.show()

def save_model(model, scaler, feature_columns):
    """Save the model and related files"""
    import joblib
    
    # Save the model
    joblib.dump(model, 'solar_maintenance_model.joblib')
    # Save the scaler
    joblib.dump(scaler, 'feature_scaler.joblib')
    # Save feature columns
    joblib.dump(feature_columns, 'feature_columns.joblib')
    
    print("Model and related files saved successfully!")

def predict_maintenance(input_data, model, scaler):
    """Make predictions for new data"""
    # Convert input to DataFrame
    input_df = pd.DataFrame([input_data])
    
    # Scale the features
    input_scaled = scaler.transform(input_df)
    
    # Make prediction
    prediction = model.predict(input_scaled)
    probability = model.predict_proba(input_scaled)
    
    return {
        'maintenance_needed': bool(prediction[0]),
        'probability': float(probability[0][1])
    }

def main():
    # Load and preprocess data
    print("Loading and preprocessing data...")
    combined_data = load_and_preprocess_data()
    
    # Create maintenance target
    print("Creating maintenance target variable...")
    combined_data['maintenance_needed'] = create_maintenance_target(combined_data)
    
    # Prepare features for modeling
    feature_columns = ['DC_POWER', 'AC_POWER', 'AMBIENT_TEMPERATURE', 'MODULE_TEMPERATURE',
                      'IRRADIATION', 'hour', 'day', 'month', 'day_of_week',
                      'power_efficiency', 'weather_score']
    
    X = combined_data[feature_columns]
    y = combined_data['maintenance_needed']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("\nTraining data shape:", X_train.shape)
    print("Testing data shape:", X_test.shape)
    
    # Train models and get the best one
    print("\nTraining models...")
    best_model = train_models(X_train_scaled, y_train, X_test_scaled, y_test)
    
    # Plot model evaluation
    print("\nPlotting model evaluation...")
    plot_model_evaluation(best_model, X_test_scaled, y_test, feature_columns)
    
    # Save the model
    print("\nSaving the model...")
    save_model(best_model, scaler, feature_columns)
    
    # Example prediction
    print("\nMaking example prediction...")
    sample_input = {
        'DC_POWER': 95,
        'AC_POWER': 90,
        'AMBIENT_TEMPERATURE': 28,
        'MODULE_TEMPERATURE': 35,
        'IRRADIATION': 800,
        'hour': 12,
        'day': 15,
        'month': 6,
        'day_of_week': 2,
        'power_efficiency': 0.3,
        'weather_score': 0.5
    }
    
    result = predict_maintenance(sample_input, best_model, scaler)
    print("\nPrediction result:", result)

if __name__ == "__main__":
    main() 