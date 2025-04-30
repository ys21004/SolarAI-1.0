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

// Get dashboard statistics
router.get('/dashboard', authenticateUser, async (req, res) => {
  try {
    // Get statistics from the cache
    const statsDoc = await db.collection('system_metrics').doc('dashboard').get();
    
    if (!statsDoc.exists) {
      // If stats don't exist, calculate them
      await updateDashboardStats();
      
      // Try again
      const newStatsDoc = await db.collection('system_metrics').doc('dashboard').get();
      
      if (!newStatsDoc.exists) {
        return res.status(404).json({ error: 'Dashboard statistics not found', status: 404 });
      }
      
      return res.status(200).json(newStatsDoc.data());
    }
    
    res.status(200).json(statsDoc.data());
  } catch (error) {
    console.error('Error getting dashboard statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics', status: 500 });
  }
});

// Get system efficiency
router.get('/efficiency', authenticateUser, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end);
    start.setDate(start.getDate() - 30);
    
    // Format dates for query
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];
    
    // Query maintenance records within date range
    let query = db.collection('maintenance_records')
                  .where('date', '>=', startDateStr)
                  .where('date', '<=', endDateStr)
                  .orderBy('date', 'asc');
    
    const snapshot = await query.get();
    
    // Calculate efficiency for each day
    const dailyEfficiency = {};
    const panelEfficiency = {};
    
    snapshot.forEach(doc => {
      const record = doc.data();
      const date = record.date;
      const panelId = record.panelId;
      
      if (record.dc_power && record.ac_power && record.dc_power > 0) {
        const efficiency = (record.ac_power / record.dc_power) * 100;
        
        // Add to daily efficiency
        if (!dailyEfficiency[date]) {
          dailyEfficiency[date] = {
            total: efficiency,
            count: 1,
            average: efficiency
          };
        } else {
          dailyEfficiency[date].total += efficiency;
          dailyEfficiency[date].count += 1;
          dailyEfficiency[date].average = dailyEfficiency[date].total / dailyEfficiency[date].count;
        }
        
        // Add to panel efficiency
        if (!panelEfficiency[panelId]) {
          panelEfficiency[panelId] = {
            total: efficiency,
            count: 1,
            average: efficiency
          };
        } else {
          panelEfficiency[panelId].total += efficiency;
          panelEfficiency[panelId].count += 1;
          panelEfficiency[panelId].average = panelEfficiency[panelId].total / panelEfficiency[panelId].count;
        }
      }
    });
    
    // Convert to arrays for easier consumption by frontend
    const dailyData = Object.keys(dailyEfficiency).map(date => ({
      date,
      efficiency: dailyEfficiency[date].average
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    const panelData = Object.keys(panelEfficiency).map(panelId => ({
      panelId,
      efficiency: panelEfficiency[panelId].average
    })).sort((a, b) => a.panelId.localeCompare(b.panelId));
    
    res.status(200).json({
      dailyEfficiency: dailyData,
      panelEfficiency: panelData,
      timeRange: {
        start: startDateStr,
        end: endDateStr
      }
    });
  } catch (error) {
    console.error('Error calculating system efficiency:', error);
    res.status(500).json({ error: 'Failed to calculate system efficiency', status: 500 });
  }
});

// Get maintenance history aggregation
router.get('/maintenance-history', authenticateUser, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    // Default to last 12 months if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end);
    start.setMonth(start.getMonth() - 11);
    
    // Format dates for query
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];
    
    // Query maintenance records within date range
    let query = db.collection('maintenance_records')
                  .where('date', '>=', startDateStr)
                  .where('date', '<=', endDateStr)
                  .orderBy('date', 'asc');
    
    const snapshot = await query.get();
    
    // Group records by the specified time period
    const groupedRecords = {};
    const recordsData = [];
    
    snapshot.forEach(doc => {
      const record = doc.data();
      let groupKey;
      
      const recordDate = new Date(record.date);
      
      if (groupBy === 'day') {
        groupKey = record.date;
      } else if (groupBy === 'week') {
        // Get the week number
        const weekNumber = getWeekNumber(recordDate);
        groupKey = `${recordDate.getFullYear()}-W${weekNumber}`;
      } else if (groupBy === 'month') {
        // Format as YYYY-MM
        groupKey = `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}`;
      } else if (groupBy === 'year') {
        groupKey = recordDate.getFullYear().toString();
      }
      
      if (!groupKey) return;
      
      recordsData.push({
        id: doc.id,
        ...record
      });
      
      if (!groupedRecords[groupKey]) {
        groupedRecords[groupKey] = {
          period: groupKey,
          count: 1,
          completedCount: record.status === 'Completed' ? 1 : 0,
          pendingCount: record.status === 'Pending' ? 1 : 0,
          criticalCount: record.status === 'Critical' ? 1 : 0,
          inProgressCount: record.status === 'In Progress' ? 1 : 0
        };
      } else {
        groupedRecords[groupKey].count += 1;
        
        if (record.status === 'Completed') {
          groupedRecords[groupKey].completedCount += 1;
        } else if (record.status === 'Pending') {
          groupedRecords[groupKey].pendingCount += 1;
        } else if (record.status === 'Critical') {
          groupedRecords[groupKey].criticalCount += 1;
        } else if (record.status === 'In Progress') {
          groupedRecords[groupKey].inProgressCount += 1;
        }
      }
    });
    
    // Convert to array and sort by period
    const aggregatedData = Object.values(groupedRecords).sort((a, b) => a.period.localeCompare(b.period));
    
    res.status(200).json({
      aggregated: aggregatedData,
      records: recordsData,
      timeRange: {
        start: startDateStr,
        end: endDateStr,
        groupBy
      }
    });
  } catch (error) {
    console.error('Error aggregating maintenance history:', error);
    res.status(500).json({ error: 'Failed to aggregate maintenance history', status: 500 });
  }
});

// Get notifications
router.get('/notifications', authenticateUser, async (req, res) => {
  try {
    const { limit = 10, includeRead = false } = req.query;
    
    let query = db.collection('notifications');
    
    if (!includeRead || includeRead === 'false') {
      query = query.where('read', '==', false);
    }
    
    query = query.orderBy('timestamp', 'desc').limit(parseInt(limit));
    
    const snapshot = await query.get();
    
    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
      });
    });
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications', status: 500 });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateUser, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notificationRef = db.collection('notifications').doc(notificationId);
    
    await notificationRef.update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp(),
      readBy: req.user.uid
    });
    
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read', status: 500 });
  }
});

// Helper function to get the week number
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Helper function to update dashboard stats
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

module.exports = router; 