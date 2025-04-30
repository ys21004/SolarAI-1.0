from flask import Blueprint, request, jsonify
from firebase_admin import auth
from firebase_config import get_firestore, update_user_profile
from middleware.auth_middleware import require_auth
from firebase_admin import firestore

auth_routes = Blueprint('auth', __name__)

@auth_routes.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not email or not password:
            return jsonify({
                'error': 'Email and password are required',
                'status': 400
            }), 400

        # Create user in Firebase Authentication
        user = auth.create_user(
            email=email,
            password=password,
            display_name=name
        )

        # Create user document in Firestore
        db = get_firestore()
        user_ref = db.collection('users').document(user.uid)
        user_ref.set({
            'email': email,
            'name': name,
            'created_at': firestore.SERVER_TIMESTAMP,
            'role': 'user',  # Default role
            'preferences': {
                'notifications': True,
                'theme': 'light'
            }
        })

        return jsonify({
            'message': 'User created successfully',
            'user': {
                'uid': user.uid,
                'email': user.email,
                'name': name
            }
        }), 201

    except auth.EmailAlreadyExistsError:
        return jsonify({
            'error': 'Email already exists',
            'status': 400
        }), 400
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 500
        }), 500

@auth_routes.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({
                'error': 'Email and password are required',
                'status': 400
            }), 400

        # Firebase handles the login through the frontend
        # This endpoint is just for verification
        return jsonify({
            'message': 'Login successful',
            'status': 200
        }), 200

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 500
        }), 500

@auth_routes.route('/logout', methods=['POST'])
@require_auth
def logout():
    try:
        # Firebase handles the logout through the frontend
        # This endpoint is just for verification
        return jsonify({
            'message': 'Logout successful',
            'status': 200
        }), 200

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 500
        }), 500

@auth_routes.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({
                'error': 'Email is required',
                'status': 400
            }), 400

        # Generate password reset link
        reset_link = auth.generate_password_reset_link(email)
        
        # In a production environment, you would send this link via email
        # For development, we'll return it in the response
        return jsonify({
            'message': 'Password reset link generated',
            'reset_link': reset_link,
            'status': 200
        }), 200

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 500
        }), 500

@auth_routes.route('/update-profile', methods=['PUT'])
@require_auth
def update_profile():
    try:
        data = request.get_json()
        user_id = request.user['uid']
        
        # Update user profile in Firestore
        success = update_user_profile(user_id, data)
        
        if success:
            return jsonify({
                'message': 'Profile updated successfully',
                'status': 200
            }), 200
        else:
            return jsonify({
                'error': 'Failed to update profile',
                'status': 500
            }), 500

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 500
        }), 500

@auth_routes.route('/change-password', methods=['POST'])
@require_auth
def change_password():
    try:
        data = request.get_json()
        user_id = request.user['uid']
        new_password = data.get('new_password')

        if not new_password:
            return jsonify({
                'error': 'New password is required',
                'status': 400
            }), 400

        # Update user's password
        auth.update_user(user_id, password=new_password)

        return jsonify({
            'message': 'Password updated successfully',
            'status': 200
        }), 200

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 500
        }), 500 