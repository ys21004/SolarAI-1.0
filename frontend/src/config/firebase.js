import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

console.log('Initializing Firebase...');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjCZNf6Nq_rJZX6-AfcoKVqSoIyNs6bmw",
  authDomain: "solar-ai-6545a.firebaseapp.com",
  projectId: "solar-ai-6545a",
  storageBucket: "solar-ai-6545a.firebasestorage.app",
  messagingSenderId: "242197453997",
  appId: "1:242197453997:web:f4c64795db930862487a24",
  measurementId: "G-H45Q9J4Q05"
};

console.log('Firebase config:', {
  ...firebaseConfig,
  apiKey: '***' // Hide the API key in logs
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized:', app);

const db = getFirestore(app);
console.log('Firestore instance created:', db);

const auth = getAuth(app);
console.log('Auth instance created:', auth);

export { db, auth }; 