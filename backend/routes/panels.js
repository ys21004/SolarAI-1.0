const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all panels
router.get('/', async (req, res) => {
  try {
    const panelsSnapshot = await db.collection('panels').get();
    const panels = [];
    panelsSnapshot.forEach(doc => {
      panels.push({ id: doc.id, ...doc.data() });
    });
    res.json(panels);
  } catch (error) {
    console.error('Error fetching panels:', error);
    res.status(500).json({ error: 'Failed to fetch panels' });
  }
});

// Add a new panel
router.post('/', async (req, res) => {
  try {
    const { name, dc_power, ac_power, ambient_temp, module_temp, irradiation } = req.body;
    
    // Validate required fields
    if (!name || !dc_power || !ac_power || !ambient_temp || !module_temp || !irradiation) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if panel with same name exists
    const existingPanel = await db.collection('panels')
      .where('name', '==', name)
      .get();

    if (!existingPanel.empty) {
      return res.status(400).json({ error: 'Panel with this name already exists' });
    }

    // Add new panel
    const panelRef = await db.collection('panels').add({
      name,
      dc_power: parseFloat(dc_power),
      ac_power: parseFloat(ac_power),
      ambient_temp: parseFloat(ambient_temp),
      module_temp: parseFloat(module_temp),
      irradiation: parseFloat(irradiation),
      created_at: new Date(),
      updated_at: new Date(),
    });

    const newPanel = await panelRef.get();
    res.status(201).json({ id: newPanel.id, ...newPanel.data() });
  } catch (error) {
    console.error('Error adding panel:', error);
    res.status(500).json({ error: 'Failed to add panel' });
  }
});

module.exports = router; 