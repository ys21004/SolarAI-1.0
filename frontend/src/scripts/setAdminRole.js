const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFunctions, httpsCallable } = require('firebase/functions');

const firebaseConfig = {
  apiKey: "AIzaSyAjCZNf6Nq_rJZX6-AfcoKVqSoIyNs6bmw",
  authDomain: "solar-ai-6545a.firebaseapp.com",
  projectId: "solar-ai-6545a",
  storageBucket: "solar-ai-6545a.firebasestorage.app",
  messagingSenderId: "242197453997",
  appId: "1:242197453997:web:f4c64795db930862487a24",
  measurementId: "G-H45Q9J4Q05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

async function setAdminRole() {
  try {
    console.log('Signing in as admin...');
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@solarai.com', 'admin_password%');
    console.log('Successfully signed in as:', userCredential.user.email);

    // Call the setAdminRole Cloud Function
    const setAdminRoleFunction = httpsCallable(functions, 'setAdminRole');
    const result = await setAdminRoleFunction();
    console.log('Admin role set successfully:', result.data);
  } catch (error) {
    console.error('Error setting admin role:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

setAdminRole(); 