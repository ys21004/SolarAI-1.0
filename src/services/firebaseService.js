import { auth, db, storage } from '../config/firebase';
import { signInWithEmailAndPassword as firebaseSignIn, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, getDocs, doc, onSnapshot, query, orderBy, getDoc, updateDoc, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Authentication functions
export const signInWithEmailAndPassword = async (email, password) => {
  try {
    console.log('firebaseService: Attempting to sign in with email and password');
    const userCredential = await firebaseSignIn(auth, email, password);
    console.log('firebaseService: Sign in successful');
    return userCredential.user;
  } catch (error) {
    console.error('firebaseService: Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    console.log('firebaseService: Attempting to sign out');
    await firebaseSignOut(auth);
    console.log('firebaseService: Sign out successful');
    
    // Clear any Firebase-related data from localStorage and sessionStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('firebase:')) {
        localStorage.removeItem(key);
      }
    });

    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('firebase:')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('firebaseService: Cleared Firebase data from storage');
  } catch (error) {
    console.error('firebaseService: Error signing out:', error);
    throw error;
  }
};

// Panel data functions
export const firebaseService = {
  // Create sample panel data
  createSamplePanels: async () => {
    try {
      console.log('Creating sample panels...');
      const panelsRef = collection(db, 'panels');
      
      const samplePanels = [
        {
          name: 'Panel A-1',
          location: 'North Site',
          status: 'Operational',
          lastMaintenance: new Date().toISOString(),
          power_output: [250, 245, 248],
          temperature_readings: [35, 38, 36]
        },
        {
          name: 'Panel B-2',
          location: 'South Site',
          status: 'Maintenance Required',
          lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          power_output: [230, 225, 228],
          temperature_readings: [40, 42, 39]
        },
        {
          name: 'Panel C-3',
          location: 'East Site',
          status: 'Operational',
          lastMaintenance: new Date().toISOString(),
          power_output: [255, 252, 253],
          temperature_readings: [34, 36, 35]
        }
      ];

      for (const panel of samplePanels) {
        await addDoc(panelsRef, panel);
        console.log('Created sample panel:', panel.name);
      }
      
      console.log('Sample panels created successfully');
    } catch (error) {
      console.error('Error creating sample panels:', error);
      throw error;
    }
  },

  // Get all panels
  getPanels: async () => {
    try {
      console.log('Fetching panels from Firestore...');
      const panelsRef = collection(db, 'panels');
      console.log('Panels collection reference created');
      
      const snapshot = await getDocs(panelsRef);
      console.log('Snapshot received, empty?', snapshot.empty);
      console.log('Number of documents:', snapshot.size);
      
      const panels = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Panel document data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      });
      
      console.log('Fetched panels:', panels);
      return panels;
    } catch (error) {
      console.error('Error fetching panels:', error);
      throw error;
    }
  },

  // Subscribe to real-time panel updates
  subscribeToPanelUpdates: (callback) => {
    console.log('Setting up panel updates subscription...');
    const panelsRef = collection(db, 'panels');
    console.log('Panels collection reference created for subscription');
    
    const q = query(panelsRef, orderBy('name'));
    console.log('Query created with orderBy name');
    
    return onSnapshot(q, (snapshot) => {
      console.log('Snapshot received in subscription, empty?', snapshot.empty);
      console.log('Number of documents in subscription:', snapshot.size);
      
      const panels = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Panel document data in subscription:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      });
      
      console.log('Received panel updates:', panels);
      callback(panels);
    }, (error) => {
      console.error('Error in panel updates subscription:', error);
    });
  },

  // Get a single panel by ID
  getPanelById: async (panelId) => {
    try {
      console.log('Fetching panel by ID:', panelId);
      const panelRef = doc(db, 'panels', panelId);
      const docSnap = await getDoc(panelRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Panel document data:', { id: docSnap.id, ...data });
        return {
          id: docSnap.id,
          ...data
        };
      }
      console.log('No panel found with ID:', panelId);
      return null;
    } catch (error) {
      console.error('Error fetching panel:', error);
      throw error;
    }
  },

  // Update panel data
  updatePanel: async (panelId, data) => {
    try {
      console.log('Updating panel:', panelId, 'with data:', data);
      const panelRef = doc(db, 'panels', panelId);
      await updateDoc(panelRef, data);
      console.log('Panel updated successfully');
    } catch (error) {
      console.error('Error updating panel:', error);
      throw error;
    }
  }
};

// Firestore functions
export const addMaintenanceRecord = async (record) => {
  try {
    console.log('Adding maintenance record:', record);
    const maintenanceRef = collection(db, 'maintenance');
    const docRef = await addDoc(maintenanceRef, {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Maintenance record added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding maintenance record:', error);
    throw error;
  }
};

export const getMaintenanceRecords = async () => {
  try {
    console.log('Fetching maintenance records...');
    const maintenanceRef = collection(db, 'maintenance');
    const q = query(maintenanceRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Fetched maintenance records:', records.length);
    return records;
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    throw error;
  }
};

// Storage functions
export const uploadImage = async (file, path) => {
  try {
    console.log('Uploading image to path:', path);
    const storageReference = ref(storage, path);
    await uploadBytes(storageReference, file);
    const downloadURL = await getDownloadURL(storageReference);
    console.log('Image uploaded successfully, download URL:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}; 