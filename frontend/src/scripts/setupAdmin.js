// Script to create an admin user in Firebase
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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
try {
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
  
  // Get Auth and Firestore instances
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  console.log(`🔑 Creating admin user with email: ${adminEmail}`);
  
  // Create admin user
  createUserWithEmailAndPassword(auth, adminEmail, adminPassword)
    .then(async (userCredential) => {
      console.log('✅ Admin user created successfully!', userCredential.user.uid);
    
      // Add admin user to Firestore
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: adminEmail,
          role: 'admin',
          createdAt: new Date(),
          displayName: 'SolarAI Admin'
        });
        console.log('✅ Admin user added to Firestore database');
        console.log('🟢 YOU CAN NOW LOG IN WITH:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
        console.error('❌ Error adding admin to Firestore:', error);
        process.exit(1);
      }
    })
    .catch((error) => {
      // Handle errors - if user already exists, we can continue
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Admin user already exists');
        console.log('🟢 YOU CAN NOW LOG IN WITH:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        process.exit(0);
      } else {
        console.error('❌ Error creating admin user:', error.code, error.message);
    process.exit(1);
  }
    });
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}