import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

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

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Set auth persistence to session (user will need to login again after browser is closed)
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log('Firebase auth persistence set to browserSessionPersistence');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

export default app; 