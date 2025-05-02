import firebase_admin
from firebase_admin import credentials, firestore
import os

def get_maintenance_collection():
    """Get the maintenance records collection from Firestore"""
    # Get the absolute path to the service account key file
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    service_account_path = os.path.join(current_dir, 'configfirebase-adminsdk.json')
    
    if not os.path.exists(service_account_path):
        raise ValueError(f"Service account key file not found at: {service_account_path}")
    
    # Initialize Firebase Admin SDK if not already initialized
    if not firebase_admin._apps:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
    
    # Get Firestore client and return the maintenance collection
    db = firestore.client()
    return db.collection('maintenance_records') 