import os
import sys
from pathlib import Path

# Add the src directory to the Python path
src_path = str(Path(__file__).parent)
if src_path not in sys.path:
    sys.path.append(src_path)

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from firebase_admin import firestore

# Import routes and Firebase config
from routes.maintenance_routes import maintenance_bp
from routes.auth_routes import auth_routes
from config.firebase_config import get_maintenance_collection
from middleware.auth_middleware import require_auth

# Import ML model prediction function with correct path
from ml_model.solar_maintenance_api import predict as predict_maintenance

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",  # Allow all origins during development
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Initialize Firebase
    try:
        db = get_maintenance_collection()
        print("Firebase initialized successfully")
    except Exception as e:
        print(f"Failed to initialize Firebase: {str(e)}")
        raise

    # Register blueprints
    app.register_blueprint(maintenance_bp, url_prefix='/api')
    app.register_blueprint(auth_routes, url_prefix='/api/auth')

    # ML model prediction endpoint
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
            # We're creating a new request context for the prediction function
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

    # Endpoint to connect AI Maintenance Check with maintenance history
    @app.route('/api/ai-maintenance-check', methods=['POST'])
    def ai_maintenance_check():
        try:
            # Proxy the request to the maintenance/ai-check endpoint
            with app.test_request_context(
                '/api/maintenance/ai-check',
                method='POST',
                json=request.get_json()
            ):
                # This will internally call the maintenance/ai-check endpoint
                return app.dispatch_request()
        except Exception as e:
            print(f"Error in AI maintenance check: {str(e)}")
            return jsonify({"error": str(e)}), 500

    # Test route to verify Firebase connection
    @app.route('/api/test/firebase', methods=['GET'])
    def test_firebase():
        try:
            db = get_maintenance_collection()
            # Try to create a test document
            test_ref = db.collection('test').document('connection_test')
            test_ref.set({
                'timestamp': firestore.SERVER_TIMESTAMP,
                'status': 'success'
            })
            return jsonify({
                'status': 'success',
                'message': 'Firebase connection successful!'
            })
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Firebase connection failed: {str(e)}'
            }), 500

    # Test route to verify Firebase Authentication
    @app.route('/api/test/auth', methods=['GET'])
    @require_auth
    def test_auth():
        return jsonify({
            'status': 'success',
            'message': 'Authentication successful!',
            'user': {
                'uid': request.user['uid'],
                'email': request.user.get('email', 'No email found')
            }
        })

    # Example authenticated route
    @app.route('/api/user/profile', methods=['GET'])
    @require_auth
    def get_user_profile():
        user_id = request.user['uid']
        db = get_maintenance_collection()
        
        # Get user document from Firestore
        user_doc = db.collection('users').document(user_id).get()
        
        if not user_doc.exists:
            return jsonify({
                'error': 'User profile not found',
                'status': 404
            }), 404
        
        return jsonify(user_doc.to_dict())

    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "error": "Resource not found",
            "status": 404
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Internal server error",
            "status": 500
        }), 500

    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "SolarAI Backend"
        })

    return app

def main():
    app = create_app()
    
    # Use port 5001
    port = 5001
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.getenv('FLASK_ENV') == 'development'
    )

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5001, debug=True)
