const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();
const db = admin.firestore();

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', status: 401 });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    req.user = decodedToken;
    
    // Get user document for role info
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      req.userDoc = userDoc.data();
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized', status: 401 });
  }
};

// Role-based access control middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.userDoc || !roles.includes(req.userDoc.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions', status: 403 });
    }
    next();
  };
};

// Validate maintenance record schema
const validateMaintenanceRecord = (req, res, next) => {
  const { panelId, technicianName, type, status } = req.body;
  
  if (!panelId || !technicianName || !type || !status) {
    return res.status(400).json({ 
      error: 'Invalid maintenance record. Required fields: panelId, technicianName, type, status',
      status: 400 
    });
  }
  
  // Validate status values
  const validStatuses = ['Completed', 'Pending', 'Critical', 'In Progress'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}`,
      status: 400 
    });
  }
  
  next();
};

// Get all maintenance records with filtering
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { status, startDate, endDate, type, limit = 20 } = req.query;
    
    let query = db.collection('maintenance_records');
    
    // Apply filters if provided
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    if (startDate && endDate) {
      query = query.where('date', '>=', startDate).where('date', '<=', endDate);
    } else if (startDate) {
      query = query.where('date', '>=', startDate);
    } else if (endDate) {
      query = query.where('date', '<=', endDate);
    }
    
    // Order by date descending
    query = query.orderBy('date', 'desc');
    
    // Apply limit
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    
    const records = [];
    snapshot.forEach(doc => {
      records.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(records);
  } catch (error) {
    console.error('Error getting maintenance records:', error);
    res.status(500).json({ error: 'Failed to retrieve maintenance records', status: 500 });
  }
});

// Get maintenance record by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const recordId = req.params.id;
    const doc = await db.collection('maintenance_records').doc(recordId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Maintenance record not found', status: 404 });
    }
    
    res.status(200).json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    console.error('Error getting maintenance record:', error);
    res.status(500).json({ error: 'Failed to retrieve maintenance record', status: 500 });
  }
});

// Create new maintenance record
router.post('/', authenticateUser, validateMaintenanceRecord, async (req, res) => {
  try {
    const newRecord = {
      ...req.body,
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      date: req.body.date || new Date().toISOString().split('T')[0] // Use current date if not provided
    };
    
    const docRef = await db.collection('maintenance_records').add(newRecord);
    
    // Update the record with the ID
    await docRef.update({
      id: docRef.id
    });
    
    res.status(201).json({
      id: docRef.id,
      ...newRecord
    });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({ error: 'Failed to create maintenance record', status: 500 });
  }
});

// Update maintenance record
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const recordId = req.params.id;
    const docRef = db.collection('maintenance_records').doc(recordId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Maintenance record not found', status: 404 });
    }
    
    // Only allow technicians and admins to update records
    if (req.userDoc.role !== 'admin' && req.userDoc.role !== 'technician') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions', status: 403 });
    }
    
    // If not admin, only allow updates to own records
    if (req.userDoc.role !== 'admin' && doc.data().createdBy !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Cannot modify records created by other users', status: 403 });
    }
    
    const updateData = {
      ...req.body,
      updatedBy: req.user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await docRef.update(updateData);
    
    res.status(200).json({
      id: recordId,
      ...doc.data(),
      ...updateData
    });
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({ error: 'Failed to update maintenance record', status: 500 });
  }
});

// Delete maintenance record
router.delete('/:id', authenticateUser, checkRole(['admin']), async (req, res) => {
  try {
    const recordId = req.params.id;
    const docRef = db.collection('maintenance_records').doc(recordId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Maintenance record not found', status: 404 });
    }
    
    await docRef.delete();
    
    res.status(200).json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({ error: 'Failed to delete maintenance record', status: 500 });
  }
});

module.exports = router; 