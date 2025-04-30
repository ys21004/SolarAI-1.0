import { db } from '../config/firebase';
import { collection, getDocs, doc, onSnapshot, query, orderBy, getDoc, updateDoc, addDoc } from 'firebase/firestore';

export interface Panel {
  id: string;
  name: string;
  location: string;
  status: string;
  lastMaintenance: string;
  power_output: number[];
  temperature_readings: number[];
  // Add any other fields that exist in your panels collection
}

export const firebaseService = {
  // Create sample panel data
  createSamplePanels: async (): Promise<void> => {
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
  getPanels: async (): Promise<Panel[]> => {
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
        } as Panel;
      });
      
      console.log('Fetched panels:', panels);
      return panels;
    } catch (error) {
      console.error('Error fetching panels:', error);
      throw error;
    }
  },

  // Subscribe to real-time panel updates
  subscribeToPanelUpdates: (callback: (panels: Panel[]) => void) => {
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
        } as Panel;
      });
      
      console.log('Received panel updates:', panels);
      callback(panels);
    }, (error) => {
      console.error('Error in panel updates subscription:', error);
    });
  },

  // Get a single panel by ID
  getPanelById: async (panelId: string): Promise<Panel | null> => {
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
        } as Panel;
      }
      console.log('No panel found with ID:', panelId);
      return null;
    } catch (error) {
      console.error('Error fetching panel:', error);
      throw error;
    }
  },

  // Update panel data
  updatePanel: async (panelId: string, data: Partial<Panel>): Promise<void> => {
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