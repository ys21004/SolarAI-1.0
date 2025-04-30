// Script to validate Firebase configuration and authentication
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration - using hardcoded values for testing
const firebaseConfig = {
  apiKey: "AIzaSyAjCZNf6Nq_rJZX6-AfcoKVqSoIyNs6bmw",
  authDomain: "solar-ai-6545a.firebaseapp.com",
  projectId: "solar-ai-6545a",
  storageBucket: "solar-ai-6545a.firebasestorage.app",
  messagingSenderId: "242197453997",
  appId: "1:242197453997:web:f4c64795db930862487a24",
  measurementId: "G-H45Q9J4Q05"
};

console.log('🔍 Validating Firebase configuration...');

// Initialize Firebase
try {
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
  
  // Get Auth instance
  const auth = getAuth(app);
  console.log('✅ Firebase Auth instance created successfully');
  
  // Test authentication with admin credentials
  console.log('🔑 Testing authentication with admin credentials...');
  signInWithEmailAndPassword(auth, 'admin@solarai.com', 'admin_password%')
    .then((userCredential) => {
      console.log('✅ Authentication successful!', userCredential.user.uid);
      console.log('👤 User email:', userCredential.user.email);
      console.log('🟢 YOUR FIREBASE CONFIGURATION IS WORKING CORRECTLY');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Authentication failed:', error.code, error.message);
      console.log('🔴 Please check your admin credentials in the .env file');
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.log('🔴 Please check your Firebase configuration values');
  process.exit(1);
} 