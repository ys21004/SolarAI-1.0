import React from 'react';
import { addPanel, getPanels } from '../services/panelService';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const PanelsContext = React.createContext({
  panels: [],
  loading: true,
  error: null,
  fetchPanels: () => {},
  addPanel: () => {},
  panelStats: {
    total: 0,
    active: 0,
    maintenanceRequired: 0
  }
});

export function PanelsProvider({ children }) {
  const [panels, setPanels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [panelStats, setPanelStats] = React.useState({
    total: 0,
    active: 0,
    maintenanceRequired: 0
  });

  const calculatePanelStats = (panels) => {
    try {
      const total = panels.length;
      const active = panels.filter(panel => panel.status === 'active').length;
      
      // Calculate maintenance required based on status or conditions
      const maintenanceRequired = panels.filter(panel => {
        // Check explicit maintenance status
        if (panel.status === 'maintenance_required') return true;
        
        // Check temperature conditions
        const highTemp = panel.moduleTemp > 80; // Temperature threshold in °C
        
        // Check power conditions
        const lowPower = panel.dcPower < 100 || panel.acPower < 80; // Power thresholds in W
        
        return highTemp || lowPower;
      }).length;

      return { total, active, maintenanceRequired };
    } catch (error) {
      console.error('Error calculating panel stats:', error);
      return {
        total: 0,
        active: 0,
        maintenanceRequired: 0
      };
    }
  };

  const validatePanelData = (data) => {
    if (!data || typeof data !== 'object') return false;
    
    // Check for required fields
    const requiredFields = ['name', 'dcPower', 'acPower', 'ambientTemp', 'moduleTemp', 'irradiation'];
    const hasRequiredFields = requiredFields.every(field => data[field] !== undefined);
    
    if (!hasRequiredFields) {
      console.error('Panel data missing required fields:', data);
      return false;
    }

    // Validate numeric fields
    const numericFields = ['dcPower', 'acPower', 'ambientTemp', 'moduleTemp', 'irradiation'];
    const hasValidNumbers = numericFields.every(field => {
      if (data[field] === undefined) return true; // Optional fields
      const value = parseFloat(data[field]);
      return !isNaN(value) && value >= 0;
    });

    if (!hasValidNumbers) {
      console.error('Panel data has invalid numeric values:', data);
      return false;
    }

    // Validate status if provided
    if (data.status) {
      const validStatuses = ['active', 'maintenance_required', 'inactive'];
      if (!validStatuses.includes(data.status)) {
        console.error('Panel data has invalid status:', data.status);
        return false;
      }
    }

    return true;
  };

  const fetchPanels = async () => {
    try {
      console.log('Starting to fetch panels...');
      setLoading(true);
      setError(null);
      const data = await getPanels();
      console.log('Fetched panels:', data);
      
      // Validate each panel
      const validPanels = data.filter(validatePanelData);
      if (validPanels.length !== data.length) {
        console.warn('Some panels were filtered out due to invalid data');
      }
      
      setPanels(validPanels);
      setPanelStats(calculatePanelStats(validPanels));
    } catch (error) {
      console.error('Error fetching panels:', error);
      setError('Failed to load panels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    console.log('PanelsContext mounted, setting up real-time listener...');
    
    try {
      // Set up real-time listener for panels collection
      const q = query(
        collection(db, 'panels'),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Firestore query created:', q);
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          try {
            console.log('Panels snapshot received:', snapshot);
            console.log('Snapshot size:', snapshot.size);
            console.log('Snapshot empty:', snapshot.empty);
            
            const updatedPanels = snapshot.docs.map(doc => {
              const data = doc.data();
              console.log(`Panel ${doc.id} data:`, data);
              return {
                id: doc.id,
                ...data,
                // Ensure numeric fields are numbers
                dcPower: parseFloat(data.dcPower) || 0,
                acPower: parseFloat(data.acPower) || 0,
                ambientTemp: parseFloat(data.ambientTemp) || 0,
                moduleTemp: parseFloat(data.moduleTemp) || 0,
                irradiation: parseFloat(data.irradiation) || 0
              };
            }).filter(validatePanelData); // Filter out invalid panels
            
            console.log('Updated panels array:', updatedPanels);
            console.log('Number of valid panels:', updatedPanels.length);
            
            setPanels(updatedPanels);
            setPanelStats(calculatePanelStats(updatedPanels));
            setLoading(false);
            setError(null); // Clear any previous errors
          } catch (error) {
            console.error('Error processing snapshot:', error);
            setError('Error processing panel data. Please refresh the page.');
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error in panels listener:', error);
          console.error('Error details:', error.message, error.code);
          setError('Failed to sync panels. Please check your connection and try again.');
          setLoading(false);
        }
      );

      // Clean up listener on unmount
      return () => {
        console.log('Cleaning up panels listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up panels listener:', error);
      setError('Failed to initialize panel sync. Please refresh the page.');
      setLoading(false);
    }
  }, []);

  const addNewPanel = async (panelData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate panel data before adding
      if (!validatePanelData(panelData)) {
        throw new Error('Invalid panel data');
      }
      
      // Add timestamp and default status if not provided
      const newPanelData = {
        ...panelData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: panelData.status || 'active'
      };
      
      const newPanel = await addPanel(newPanelData);
      return newPanel;
    } catch (error) {
      console.error('Error adding panel:', error);
      setError('Failed to add panel. Please check the data and try again.');
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
    addPanel: addNewPanel,
    panelStats
  };

  return (
    <PanelsContext.Provider value={value}>
      {children}
    </PanelsContext.Provider>
  );
}

export const usePanels = () => {
  const context = React.useContext(PanelsContext);
  if (!context) {
    throw new Error('usePanels must be used within a PanelsProvider');
  }
  return context;
}; 