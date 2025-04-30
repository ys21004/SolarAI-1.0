import os
import sys
from pathlib import Path
import flask
from flask import Flask, jsonify, request
from flask_cors import CORS

# Add the src directory to the Python path
src_path = str(Path(__file__).parent / 'src')
if src_path not in sys.path:
    sys.path.append(src_path)

# Initialize the ML model first
print("Checking ML model initialization...")
from src.ml_model.initialize_model import check_and_initialize_model
check_and_initialize_model()

# Import ML prediction function
from src.ml_model.solar_maintenance_api import predict as predict_maintenance

def create_minimal_app():
    """Create a minimal Flask app that only includes ML functionality."""
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",  # Allow all origins during development
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Add ML model prediction endpoint
    @app.route('/api/predict-maintenance', methods=['POST'])
    def maintenance_prediction():
        try:
            # Get data from request
            data = request.get_json()
            
            # Ensure all required fields are present
            required_fields = ['dc_power', 'ac_power', 'ambient_temperature', 
                             'module_temperature', 'irradiation']
            
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"Missing required field: {field}"}), 400
            
            # Add timestamp if not provided
            if 'timestamp' not in data:
                from datetime import datetime
                data['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Forward request to the ML model's predict function
            with app.test_request_context(
                '/predict', 
                method='POST',
                json=data
            ):
                # Call the prediction function from the ML module
                return predict_maintenance()
                
        except Exception as e:
            print(f"Error in maintenance prediction: {str(e)}")
            return jsonify({"error": str(e)}), 500
    
    # Add health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({
            "status": "healthy", 
            "service": "SolarAI ML Model Service"
        })
    
    return app

if __name__ == '__main__':
    app = create_minimal_app()
    port = int(os.getenv('PORT', 5001))
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True
    ) 