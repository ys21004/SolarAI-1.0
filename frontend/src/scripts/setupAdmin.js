// Script to create an admin user in Firebase
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjCZNf6Nq_rJZX6-AfcoKVqSoIyNs6bmw",
  authDomain: "solar-ai-6545a.firebaseapp.com",
  projectId: "solar-ai-6545a",
  storageBucket: "solar-ai-6545a.firebasestorage.app",
  messagingSenderId: "242197453997",
  appId: "1:242197453997:web:f4c64795db930862487a24",
  measurementId: "G-H45Q9J4Q05"
};

// Admin credentials
const adminEmail = 'admin@solarai.com';
const adminPassword = 'admin_password%';

console.log('🔍 Setting up admin user...');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // Try to sign in first
    try {
      const userCredential = await signInWithEmailAndPassword(auth, 'admin@solarai.com', 'admin_password%');
      console.log('Admin user already exists:', userCredential.user.email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create admin user if it doesn't exist
        console.log('Creating admin user...');
        const userCredential = await createUserWithEmailAndPassword(auth, 'admin@solarai.com', 'admin_password%');
        console.log('Admin user created:', userCredential.user.email);
        
        // Set admin role in Firestore
        const userDoc = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDoc, {
          email: 'admin@solarai.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        });
        console.log('Admin role set in Firestore');
      } else {
        throw error;
      }
    }
    
    console.log('Admin setup completed successfully');
  } catch (error) {
    console.error('Error setting up admin:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

setupAdmin();