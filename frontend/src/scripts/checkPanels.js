const admin = require('firebase-admin');
const serviceAccount = require('../../../backend/src/config/serviceAccountKey.json');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkPanels() {
  try {
    console.log('Checking panels in Firestore...');
    const snapshot = await db.collection('panels').get();
    
    if (snapshot.empty) {
      console.log('No panels found in the database');
      return;
    }
    
    console.log('Found panels:');
    snapshot.forEach(doc => {
      console.log(`Panel ID: ${doc.id}`);
      console.log('Data:', doc.data());
      console.log('-------------------');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking panels:', error);
    process.exit(1);
  }
}

checkPanels(); 