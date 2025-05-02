import React from 'react';
import { addPanel, getPanels } from '../services/panelService';
import { db, auth } from '../config/firebase';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const PanelsContext = React.createContext({
  panels: [],
  loading: true,
  error: null,
  fetchPanels: () => {},
  addPanel: () => {}
});

export function PanelsProvider({ children }) {
  const [panels, setPanels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const normalizePanelData = (panel) => {
    return {
      id: panel.id,
      name: panel.name,
      dc_power: panel.dcPower || panel.dc_power,
      ac_power: panel.acPower || panel.ac_power,
      ambient_temp: panel.ambientTemp || panel.ambient_temp,
      module_temp: panel.moduleTemp || panel.module_temp,
      irradiation: panel.irradiation,
      status: panel.status,
      location: panel.location,
      lastMaintenance: panel.lastMaintenance,
      maintenanceRequired: panel.maintenanceRequired,
      notes: panel.notes,
      createdAt: panel.createdAt,
      updatedAt: panel.updatedAt
    };
  };

  const authenticate = async () => {
    try {
      if (!auth.currentUser) {
        console.log('No user logged in, attempting to sign in...');
        const userCredential = await signInWithEmailAndPassword(auth, 'admin@solarai.com', 'admin_password%');
        console.log('Successfully signed in as admin:', userCredential.user.email);
        
        // Wait for the auth state to be updated
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setIsAuthenticated(false);
      setError('Authentication failed. Please try again later.');
      return false;
    }
  };

  const fetchPanels = React.useCallback(async () => {
    try {
      console.log('Starting to fetch panels...');
      setLoading(true);
      setError(null);
      
      // Ensure we're authenticated before proceeding
      if (!auth.currentUser) {
        console.log('Not authenticated, attempting to authenticate...');
        const authSuccess = await authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }
      
      // First try to get panels directly
      const panelsRef = collection(db, 'panels');
      const q = query(panelsRef, orderBy('createdAt', 'desc'));
      console.log('Created Firestore query:', q);
      
      const snapshot = await getDocs(q);
      console.log('Firestore query snapshot:', snapshot);
      console.log('Snapshot empty:', snapshot.empty);
      console.log('Snapshot size:', snapshot.size);
      
      if (!snapshot.empty) {
        const panelsData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Panel data:', data);
          return normalizePanelData({
            id: doc.id,
            ...data
          });
        });
        console.log('Fetched panels directly:', panelsData);
        setPanels(panelsData);
      } else {
        console.log('No panels found in direct fetch');
        // Try using the panelService as fallback
        const data = await getPanels();
        console.log('Fetched panels through service:', data);
        setPanels(data.map(normalizePanelData));
      }
    } catch (error) {
      console.error('Error fetching panels:', error);
      console.error('Error details:', error.message, error.code, error.stack);
      setError('Failed to load panels. Please try again later.');
      // If authentication failed, try to re-authenticate
      if (error.code === 'permission-denied' || error.message.includes('Authentication failed')) {
        setIsAuthenticated(false);
        await authenticate();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    console.log('PanelsContext mounted, setting up auth state listener...');
    
    // Set up auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      if (user) {
        setIsAuthenticated(true);
        console.log('User is authenticated:', user.email);
        // Fetch panels when user is authenticated
        fetchPanels();
      } else {
        setIsAuthenticated(false);
        console.log('No user is authenticated');
        // Try to authenticate when no user is present
        authenticate();
      }
    });

    // Initial authentication
    authenticate().then(() => {
      console.log('Initial authentication successful');
    }).catch(error => {
      console.error('Initial authentication failed:', error);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribeAuth();
    };
  }, [fetchPanels]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated, skipping panel listener setup');
      return;
    }

    console.log('Setting up real-time listener for panels...');
    
    const setupListener = async () => {
      try {
    // Set up real-time listener for panels collection
        const panelsRef = collection(db, 'panels');
        const q = query(panelsRef, orderBy('createdAt', 'desc'));
    console.log('Firestore query created:', q);
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('Panels snapshot received:', snapshot);
        console.log('Snapshot size:', snapshot.size);
        console.log('Snapshot empty:', snapshot.empty);
        
            if (!snapshot.empty) {
              const updatedPanels = snapshot.docs.map(doc => normalizePanelData({
            id: doc.id,
                ...doc.data()
              }));
        
        console.log('Updated panels array:', updatedPanels);
        console.log('Number of panels:', updatedPanels.length);
        
        setPanels(updatedPanels);
            } else {
              console.log('No panels found in real-time update');
              // Try to fetch panels directly if real-time update is empty
              fetchPanels();
            }
        setLoading(false);
      },
      (error) => {
        console.error('Error in panels listener:', error);
        console.error('Error details:', error.message, error.code);
        setError('Failed to sync panels. Please try again later.');
        setLoading(false);
      }
    );

        // Initial fetch
        fetchPanels();

    // Clean up listener on unmount
    return () => {
      console.log('Cleaning up panels listener');
      unsubscribe();
    };
      } catch (error) {
        console.error('Error setting up panels listener:', error);
        setError('Failed to initialize panels. Please try again later.');
        setLoading(false);
      }
    };

    setupListener();
  }, [isAuthenticated, fetchPanels]);

  const addNewPanel = async (panelData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isAuthenticated) {
        console.log('Not authenticated, attempting to authenticate...');
        await authenticate();
      }
      
      const newPanel = await addPanel(panelData);
      return normalizePanelData(newPanel);
    } catch (error) {
      console.error('Error adding panel:', error);
      setError('Failed to add panel. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    panels,
    loading,
    error,
    fetchPanels,
    addPanel: addNewPanel
  };

  console.log('Current panels state:', panels);
  console.log('Loading state:', loading);
  console.log('Error state:', error);
  console.log('Authentication state:', isAuthenticated);

  return (
    <PanelsContext.Provider value={value}>
      {children}
    </PanelsContext.Provider>
  );
}

export function usePanels() {
  const context = React.useContext(PanelsContext);
  if (!context) {
    throw new Error('usePanels must be used within a PanelsProvider');
  }
  return context;
} 