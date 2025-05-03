from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import requests
import json
import os
from config.firebase_config import get_maintenance_collection
from ml_model.model_loader import SolarMaintenancePredictor

maintenance_bp = Blueprint('maintenance', __name__)
predictor = SolarMaintenancePredictor()

# File path for storing maintenance records
RECORDS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'maintenance_records.json')

# Ensure data directory exists
os.makedirs(os.path.dirname(RECORDS_FILE), exist_ok=True)

def load_records():
    if os.path.exists(RECORDS_FILE):
        try:
            with open(RECORDS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading records: {str(e)}")
    
    # Return default records if file doesn't exist or has an error
    return [
        {
            'id': '1',
            'date': '2024-03-15',
            'panelId': 'A1',
            'technician': 'John Doe',
            'type': 'Routine Check',
            'status': 'Completed'
        },
        {
            'id': '2',
            'date': '2024-03-14',
            'panelId': 'B3',
            'technician': 'Jane Smith',
            'type': 'Repair',
            'status': 'Pending'
        }
    ]

def save_records(records):
    try:
        os.makedirs(os.path.dirname(RECORDS_FILE), exist_ok=True)
        with open(RECORDS_FILE, 'w') as f:
            json.dump(records, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving records: {str(e)}")
        return False

# Initialize maintenance records
maintenance_records = load_records()

def validate_maintenance_data(data):
    required_fields = ['panelId', 'technicianName', 'type', 'status']
    for field in required_fields:
        if field not in data:
            return False, f'Missing required field: {field}'
    
    valid_statuses = ['Completed', 'Pending', 'Critical', 'In Progress']
    if data.get('status') not in valid_statuses:
        return False, f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
    
    return True, None

@maintenance_bp.route('/maintenance', methods=['POST'])
def handle_maintenance():
    try:
        data = request.json
        
        # Validate the data
        is_valid, error_message = validate_maintenance_data(data)
        if not is_valid:
            return jsonify({
                'status': 'error',
                'message': error_message
            }), 400
        
        maintenance_collection = get_maintenance_collection()
        
        # Add metadata
        data['timestamp'] = datetime.now().isoformat()
        data['createdAt'] = datetime.now().isoformat()
        data['updatedAt'] = datetime.now().isoformat()
        
        # Save to Firebase
        doc_ref = maintenance_collection.add(data)
        
        return jsonify({
            'status': 'success',
            'message': 'Maintenance record saved successfully',
            'record_id': doc_ref[1].id,
            'record': data
        }), 201
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@maintenance_bp.route('/maintenance/history', methods=['GET'])
def get_maintenance_history():
    try:
        maintenance_collection = get_maintenance_collection()
        # Query records ordered by timestamp in descending order
        docs = maintenance_collection.order_by('timestamp', direction='DESCENDING').get()
        
        records = []
        for doc in docs:
            record = doc.to_dict()
            record['id'] = doc.id
            records.append(record)
        
        return jsonify({
            'status': 'success',
            'records': records
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@maintenance_bp.route('/maintenance/ai-check', methods=['POST'])
def ai_maintenance_check():
    try:
        data = request.json
        required_fields = ['panelId', 'dc_power', 'ac_power', 'ambient_temp', 'module_temp', 'irradiation', 'technician']
        
        # Validate required fields
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Convert numeric fields to float
        numeric_fields = ['dc_power', 'ac_power', 'ambient_temp', 'module_temp', 'irradiation']
        for field in numeric_fields:
            try:
                data[field] = float(data[field])
            except (ValueError, TypeError):
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid value for {field}. Must be a number.'
                }), 400
        
        # Get current timestamp
        current_time = datetime.now()
        timestamp = current_time.isoformat()
        
        # Prepare input data for ML model
        input_data = {
            'DC_POWER': data['dc_power'],
            'AC_POWER': data['ac_power'],
            'AMBIENT_TEMPERATURE': data['ambient_temp'],
            'MODULE_TEMPERATURE': data['module_temp'],
            'IRRADIATION': data['irradiation']
        }
        
        # Get ML model prediction
        prediction_result = predictor.predict(input_data)
        
        # Calculate efficiency for additional context
        efficiency = (data['ac_power'] / data['dc_power']) * 100 if data['dc_power'] > 0 else 0
        
        # Define issues and their recommended actions
        issues_with_actions = []
        
        if prediction_result['prediction']:
            if efficiency < 80:
                issues_with_actions.append({
                    'issue': "Low efficiency detected",
                    'severity': 'High',
                    'recommended_actions': [
                        "Check for dirt or debris on panel surface",
                        "Inspect for physical damage or cracks",
                        "Verify proper panel alignment",
                        "Check for shading issues"
                    ]
                })
            
            if data['module_temp'] - data['ambient_temp'] > 30:
                issues_with_actions.append({
                    'issue': "High temperature difference detected",
                    'severity': 'Medium',
                    'recommended_actions': [
                        "Check for proper ventilation around panels",
                        "Inspect for hot spots using thermal imaging",
                        "Verify proper mounting and spacing",
                        "Check for potential electrical issues"
                    ]
                })
            
            if data['dc_power'] < 200:
                issues_with_actions.append({
                    'issue': "Low power output detected",
                    'severity': 'High',
                    'recommended_actions': [
                        "Check for loose or damaged connections",
                        "Inspect inverter functionality",
                        "Verify proper voltage levels",
                        "Check for potential bypass diode issues"
                    ]
                })
            
            # Add general maintenance recommendations
            general_recommendations = [
                "Schedule regular cleaning",
                "Perform visual inspection",
                "Check electrical connections",
                "Verify mounting hardware"
            ]
        
        # Create prediction object
        prediction = {
            'needs_maintenance': prediction_result['prediction'],
            'confidence': round(prediction_result['confidence'] * 100, 2),
            'efficiency': round(efficiency, 2),
            'issues': issues_with_actions,
            'general_recommendations': general_recommendations if prediction_result['prediction'] else [],
            'timestamp': timestamp
        }
        
        # Save the check to maintenance history
        maintenance_collection = get_maintenance_collection()
        check_data = {
            'panelId': data['panelId'],
            'technicianName': data['technician'],
            'type': 'AI Check',
            'status': 'Completed',
            'timestamp': timestamp,
            'createdAt': timestamp,
            'updatedAt': timestamp,
            'date': current_time.strftime('%Y-%m-%d'),
            'prediction': prediction,
            'parameters': {
                'dc_power': data['dc_power'],
                'ac_power': data['ac_power'],
                'ambient_temp': data['ambient_temp'],
                'module_temp': data['module_temp'],
                'irradiation': data['irradiation']
            }
        }
        
        doc_ref = maintenance_collection.add(check_data)
        
        return jsonify({
            'status': 'success',
            'prediction': prediction,
            'record_id': doc_ref[1].id
        }), 200
    except Exception as e:
        print(f"Error in AI maintenance check: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@maintenance_bp.route('/maintenance/panel/<panel_id>', methods=['GET'])
def get_panel_maintenance(panel_id):
    try:
        maintenance_collection = get_maintenance_collection()
        
        # Query records for specific panel
        records = []
        for doc in maintenance_collection.where('panelId', '==', panel_id).stream():
            record = doc.to_dict()
            record['id'] = doc.id
            records.append(record)
        
        return jsonify({
            'status': 'success',
            'records': records,
            'count': len(records)
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@maintenance_bp.route('/maintenance/<record_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_single_record(record_id):
    try:
        maintenance_collection = get_maintenance_collection()
        doc_ref = maintenance_collection.document(record_id)
        
        if request.method == 'GET':
            doc = doc_ref.get()
            if doc.exists:
                record = doc.to_dict()
                record['id'] = doc.id
                return jsonify({
                    'status': 'success',
                    'record': record
                }), 200
            else:
                return jsonify({
                    'status': 'error',
                    'message': 'Record not found'
                }), 404
                
        elif request.method == 'PUT':
            data = request.json
            is_valid, error_message = validate_maintenance_data(data)
            if not is_valid:
                return jsonify({
                    'status': 'error',
                    'message': error_message
                }), 400
                
            data['updatedAt'] = datetime.now().isoformat()
            doc_ref.update(data)
            
            return jsonify({
                'status': 'success',
                'message': 'Record updated successfully',
                'record': data
            }), 200
            
        elif request.method == 'DELETE':
            doc_ref.delete()
            return jsonify({
                'status': 'success',
                'message': 'Record deleted successfully'
            }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@maintenance_bp.route('/analyze/<panel_id>', methods=['GET'])
def analyze_panel(panel_id):
    """Analyze a specific panel's maintenance history and efficiency"""
    try:
        # Filter records for the specified panel
        panel_records = [r for r in maintenance_records if r.get('panelId') == panel_id]
        
        if not panel_records:
            return jsonify({
                'error': f'No records found for panel {panel_id}',
                'status': 404
            }), 404
        
        # Calculate efficiency metrics if available
        total_efficiency = 0
        efficiency_count = 0
        
        for record in panel_records:
            if 'dc_power' in record and 'ac_power' in record and float(record['dc_power']) > 0:
                efficiency = (float(record['ac_power']) / float(record['dc_power'])) * 100
                total_efficiency += efficiency
                efficiency_count += 1
        
        avg_efficiency = total_efficiency / efficiency_count if efficiency_count > 0 else 0
        
        # Count maintenance activities
        maintenance_activities = {
            'Routine Check': 0,
            'Repair': 0,
            'Cleaning': 0,
            'AI-Suggested Maintenance': 0
        }
        
        for record in panel_records:
            record_type = record.get('type', 'Unknown')
            if record_type in maintenance_activities:
                maintenance_activities[record_type] += 1
            
        # Determine panel health status
        if avg_efficiency >= 85:
            health_status = 'Excellent'
        elif avg_efficiency >= 70:
            health_status = 'Good'
        elif avg_efficiency >= 50:
            health_status = 'Fair'
        else:
            health_status = 'Poor'
            
        # Check if any maintenance predictions indicate needed maintenance
        needs_maintenance = any(
            record.get('maintenance_prediction', {}).get('needed', False) 
            for record in panel_records
        )
        
        # Get AI insights
        ai_checks = [r for r in panel_records if r.get('source') == 'AI Check']
        manual_checks = [r for r in panel_records if r.get('source') != 'AI Check']
        
        return jsonify({
            'panel_id': panel_id,
            'record_count': len(panel_records),
            'avg_efficiency': avg_efficiency,
            'health_status': health_status,
            'maintenance_activities': maintenance_activities,
            'needs_maintenance': needs_maintenance,
            'latest_record': panel_records[0] if panel_records else None,
            'ai_check_count': len(ai_checks),
            'manual_check_count': len(manual_checks),
            'records': panel_records  # Include all panel records
        })
        
    except Exception as e:
        print(f"Error analyzing panel {panel_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@maintenance_bp.route('/maintenance/analytics', methods=['GET'])
def get_maintenance_analytics():
    try:
        maintenance_collection = get_maintenance_collection()
        
        # Get all records
        records = []
        for doc in maintenance_collection.stream():
            record = doc.to_dict()
            record['id'] = doc.id
            records.append(record)
        
        # Calculate analytics
        total_records = len(records)
        status_counts = {}
        type_counts = {}
        recent_records = []
        
        for record in records:
            # Count by status
            status = record.get('status', 'Unknown')
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # Count by type
            record_type = record.get('type', 'Unknown')
            type_counts[record_type] = type_counts.get(record_type, 0) + 1
            
            # Get recent records (last 7 days)
            record_date = datetime.fromisoformat(record.get('timestamp', ''))
            if record_date and (datetime.now() - record_date).days <= 7:
                recent_records.append(record)
        
        return jsonify({
            'status': 'success',
            'analytics': {
                'total_records': total_records,
                'status_counts': status_counts,
                'type_counts': type_counts,
                'recent_records': recent_records,
                'recent_count': len(recent_records)
            }
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
