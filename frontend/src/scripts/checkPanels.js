const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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
const db = getFirestore(app);

async function checkPanels() {
  try {
    console.log('Checking panels collection...');
    const panelsRef = collection(db, 'panels');
    const snapshot = await getDocs(panelsRef);
    
    console.log('Panels collection exists:', !!panelsRef);
    console.log('Snapshot empty:', snapshot.empty);
    console.log('Number of panels:', snapshot.size);
    
    if (!snapshot.empty) {
      console.log('Panel documents:');
      snapshot.forEach(doc => {
        console.log('Panel ID:', doc.id);
        console.log('Panel data:', doc.data());
      });
    } else {
      console.log('No panels found in the collection');
    }
  } catch (error) {
    console.error('Error checking panels:', error);
    console.error('Error details:', error.message, error.code, error.stack);
  }
}

checkPanels(); 