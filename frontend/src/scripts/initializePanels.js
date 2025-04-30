const admin = require('firebase-admin');
const serviceAccount = require('../../../backend/src/config/serviceAccountKey.json');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const testPanels = [
  {
    name: 'Panel-A1',
    dcPower: 450,
    acPower: 400,
    ambientTemp: 25,
    moduleTemp: 35,
    irradiation: 1000,
    status: 'active',
    location: 'North Site',
    lastMaintenance: new Date('2023-12-01'),
    maintenanceRequired: false,
    notes: 'Primary power generation unit'
  },
  {
    name: 'Panel-B2',
    dcPower: 480,
    acPower: 420,
    ambientTemp: 28,
    moduleTemp: 38,
    irradiation: 950,
    status: 'active',
    location: 'South Site',
    lastMaintenance: new Date('2023-11-15'),
    maintenanceRequired: false,
    notes: 'Secondary power generation unit'
  },
  {
    name: 'Panel-C3',
    dcPower: 460,
    acPower: 410,
    ambientTemp: 26,
    moduleTemp: 36,
    irradiation: 980,
    status: 'maintenance_required',
    location: 'East Site',
    lastMaintenance: new Date('2023-12-15'),
    maintenanceRequired: true,
    notes: 'Backup unit - requires maintenance'
  }
];

const initializePanels = async () => {
  try {
    console.log('Initializing test panels...');
    
    // Add each test panel to the database
    const batch = db.batch();
    
    testPanels.forEach((panel) => {
      const docRef = db.collection('panels').doc();
      batch.set(docRef, {
        ...panel,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    await batch.commit();
    console.log('Successfully initialized test panels');
  } catch (error) {
    console.error('Error initializing test panels:', error);
    throw error;
  }
};

module.exports = { initializePanels }; 