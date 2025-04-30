const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Firestore
const db = admin.firestore();

// Import route modules
const maintenanceRoutes = require('./routes/maintenance');
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

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

// Mount routes
app.use('/maintenance', maintenanceRoutes);
app.use('/auth', authRoutes);
app.use('/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SolarAI Cloud Functions'
  });
});

// Export the API as a Firebase Function
exports.api = functions.https.onRequest(app);

// Real-time triggers for updates
exports.onMaintenanceRecordCreated = functions.firestore
  .document('maintenance_records/{recordId}')
  .onCreate(async (snapshot, context) => {
    try {
      const record = snapshot.data();
      
      // Update dashboard statistics
      await updateDashboardStats();
      
      // Check if this is a critical alert
      if (record.status === 'Critical') {
        await sendCriticalAlert(record);
      }
      
      console.log(`Successfully processed new maintenance record: ${context.params.recordId}`);
    } catch (error) {
      console.error('Error in onMaintenanceRecordCreated trigger:', error);
    }
  });

// Helper functions
async function updateDashboardStats() {
  try {
    // Get all maintenance records
    const snapshot = await db.collection('maintenance_records').get();
    const records = snapshot.docs.map(doc => doc.data());
    
    // Calculate statistics
    const totalRecords = records.length;
    const completedRecords = records.filter(record => record.status === 'Completed').length;
    const pendingRecords = records.filter(record => record.status === 'Pending').length;
    const criticalRecords = records.filter(record => record.status === 'Critical').length;
    
    // Calculate average system performance
    let totalEfficiency = 0;
    let efficiencyCount = 0;
    
    records.forEach(record => {
      if (record.dc_power && record.ac_power && record.dc_power > 0) {
        const efficiency = (record.ac_power / record.dc_power) * 100;
        totalEfficiency += efficiency;
        efficiencyCount++;
      }
    });
    
    const avgEfficiency = efficiencyCount > 0 ? totalEfficiency / efficiencyCount : 0;
    
    // Update dashboard stats document
    await db.collection('system_metrics').doc('dashboard').set({
      total_records: totalRecords,
      completed_records: completedRecords,
      pending_records: pendingRecords,
      critical_records: criticalRecords,
      average_efficiency: avgEfficiency,
      last_updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Dashboard statistics updated successfully');
  } catch (error) {
    console.error('Error updating dashboard statistics:', error);
  }
}

async function sendCriticalAlert(record) {
  try {
    // Create a notification in the database
    await db.collection('notifications').add({
      title: 'Critical Maintenance Alert',
      message: `Critical issue detected with panel ${record.panelId}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      recordId: record.id
    });
    
    console.log('Critical alert notification created successfully');
  } catch (error) {
    console.error('Error sending critical alert:', error);
  }
}

// Initialize dashboard stats on first deploy
updateDashboardStats().catch(console.error); 