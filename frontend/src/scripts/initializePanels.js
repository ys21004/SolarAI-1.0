const admin = require('firebase-admin');
const serviceAccount = require('../../../backend/src/configfirebase-adminsdk.json');

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
    dc_power: 450,
    ac_power: 400,
    ambient_temp: 25,
    module_temp: 35,
    irradiation: 1000,
    status: 'active',
    location: 'North Site',
    installation_date: new Date('2023-01-15'),
    lastMaintenance: new Date('2023-12-01'),
    maintenanceRequired: false,
    efficiency: 0.95,
    notes: 'Primary power generation unit'
  },
  {
    name: 'Panel-B2',
    dc_power: 480,
    ac_power: 420,
    ambient_temp: 28,
    module_temp: 38,
    irradiation: 950,
    status: 'active',
    location: 'South Site',
    installation_date: new Date('2023-02-20'),
    lastMaintenance: new Date('2023-11-15'),
    maintenanceRequired: false,
    efficiency: 0.92,
    notes: 'Secondary power generation unit'
  },
  {
    name: 'Panel-C3',
    dc_power: 460,
    ac_power: 410,
    ambient_temp: 26,
    module_temp: 36,
    irradiation: 980,
    status: 'active',
    location: 'East Site',
    installation_date: new Date('2023-03-10'),
    lastMaintenance: new Date('2023-12-15'),
    maintenanceRequired: false,
    efficiency: 0.94,
    notes: 'Backup unit'
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