from functools import wraps
from flask import request, jsonify
from firebase_config import verify_token

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get the Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'error': 'No token provided',
                'status': 401
            }), 401
        
        # Extract the token
        token = auth_header.split('Bearer ')[1]
        
        # Verify the token
        decoded_token = verify_token(token)
        
        if not decoded_token:
            return jsonify({
                'error': 'Invalid token',
                'status': 401
            }), 401
        
        # Add the user info to the request context
        request.user = decoded_token
        
        return f(*args, **kwargs)
    
    return decorated_function 