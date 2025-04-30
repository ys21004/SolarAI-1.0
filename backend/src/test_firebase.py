from src.config.firebase_config import get_maintenance_collection

def test_firebase_connection():
    try:
        # Try to get the maintenance collection
        collection = get_maintenance_collection()
        
        # Try to get a document to verify the connection
        docs = collection.limit(1).stream()
        
        print("Firebase connection successful!")
        print("Available documents in maintenance_records collection:")
        for doc in docs:
            print(f"Document ID: {doc.id}")
            print(f"Data: {doc.to_dict()}")
            
    except Exception as e:
        print(f"Error connecting to Firebase: {str(e)}")
        raise

if __name__ == "__main__":
    test_firebase_connection() 