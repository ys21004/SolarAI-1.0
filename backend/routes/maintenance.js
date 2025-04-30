const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get maintenance history
router.get('/history', async (req, res) => {
  try {
    const maintenanceSnapshot = await db.collection('maintenance').get();
    const maintenance = [];
    maintenanceSnapshot.forEach(doc => {
      maintenance.push({ id: doc.id, ...doc.data() });
    });
    res.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance history:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance history' });
  }
});

// Add maintenance record
router.post('/check', async (req, res) => {
  try {
    const { panelId, dc_power, ac_power, ambient_temp, module_temp, irradiation } = req.body;
    
    // Validate required fields
    if (!panelId || !dc_power || !ac_power || !ambient_temp || !module_temp || !irradiation) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Perform AI analysis (placeholder for actual AI logic)
    const needsMaintenance = Math.random() > 0.5; // Random decision for demo
    const confidence = Math.random() * 100; // Random confidence for demo

    // Add maintenance record
    const maintenanceRef = await db.collection('maintenance').add({
      panelId,
      dc_power: parseFloat(dc_power),
      ac_power: parseFloat(ac_power),
      ambient_temp: parseFloat(ambient_temp),
      module_temp: parseFloat(module_temp),
      irradiation: parseFloat(irradiation),
      needsMaintenance,
      confidence,
      timestamp: new Date(),
    });

    const newMaintenance = await maintenanceRef.get();
    res.status(201).json({ 
      id: newMaintenance.id, 
      ...newMaintenance.data(),
      prediction: {
        needsMaintenance,
        confidence: confidence.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error adding maintenance record:', error);
    res.status(500).json({ error: 'Failed to add maintenance record' });
  }
});

module.exports = router; 