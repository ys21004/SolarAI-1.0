import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  where,
  getDoc
} from 'firebase/firestore';

// Validate panel data before sending to Firestore
const validatePanelData = (panelData) => {
  // Required fields for basic panel data
  const requiredFields = [
    'name', 
    'dcPower',
    'acPower',
    'ambientTemp',
    'moduleTemp',
    'irradiation'
  ];
  
  const missingFields = requiredFields.filter(field => !panelData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate numeric fields
  const numericFields = [
    'dcPower',
    'acPower',
    'ambientTemp',
    'moduleTemp',
    'irradiation'
  ];
  
  const invalidFields = numericFields.filter(field => 
    panelData[field] !== undefined && 
    (isNaN(parseFloat(panelData[field])) || parseFloat(panelData[field]) < 0)
  );

  if (invalidFields.length > 0) {
    throw new Error(`Invalid numeric values for: ${invalidFields.join(', ')}`);
  }

  // Validate status if provided
  if (panelData.status) {
    const validStatuses = ['active', 'maintenance_required', 'inactive'];
  if (!validStatuses.includes(panelData.status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
  }

  return true;
};

export const addPanel = async (panelData) => {
  try {
    validatePanelData(panelData);
    
    const docRef = await addDoc(collection(db, 'panels'), {
      ...panelData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: panelData.status || 'active',
      lastMaintenance: panelData.lastMaintenance || null,
      maintenanceRequired: panelData.maintenanceRequired || false,
      efficiency: calculateEfficiency(panelData.dcPower, panelData.acPower),
      notes: panelData.notes || ''
    });
    
    return { id: docRef.id, ...panelData };
  } catch (error) {
    console.error('Error adding panel:', error);
    throw error;
  }
};

// Helper function to calculate panel efficiency
const calculateEfficiency = (dcPower, acPower) => {
  if (!dcPower || !acPower) return 0;
  return (acPower / dcPower) * 100;
};

export const getPanels = async () => {
  try {
    console.log('Getting panels from Firestore...');
    const q = query(collection(db, 'panels'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    console.log('Query snapshot:', querySnapshot);
    const panels = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Mapped panels:', panels);
    return panels;
  } catch (error) {
    console.error('Error getting panels:', error);
    throw error;
  }
};

export const getPanelById = async (panelId) => {
  try {
    const docRef = doc(db, 'panels', panelId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Panel not found');
    }
  } catch (error) {
    console.error('Error getting panel:', error);
    throw error;
  }
};

export const updatePanel = async (panelId, panelData) => {
  try {
    validatePanelData(panelData);
    
    const docRef = doc(db, 'panels', panelId);
    await updateDoc(docRef, {
      ...panelData,
      updatedAt: new Date()
    });
    
    return { id: panelId, ...panelData };
  } catch (error) {
    console.error('Error updating panel:', error);
    throw error;
  }
};

export const deletePanel = async (panelId) => {
  try {
    const docRef = doc(db, 'panels', panelId);
    await deleteDoc(docRef);
    return panelId;
  } catch (error) {
    console.error('Error deleting panel:', error);
    throw error;
  }
};

export const getPanelsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, 'panels'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting panels by status:', error);
    throw error;
  }
};

export const getPanelsByLocation = async (location) => {
  try {
    const q = query(
      collection(db, 'panels'),
      where('location', '==', location),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting panels by location:', error);
    throw error;
  }
};

export const getPanelsRequiringMaintenance = async () => {
  try {
    const q = query(
      collection(db, 'panels'),
      where('maintenanceRequired', '==', true),
      orderBy('lastMaintenance', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting panels requiring maintenance:', error);
    throw error;
  }
}; 