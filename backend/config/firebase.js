const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./configfirebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { db }; 