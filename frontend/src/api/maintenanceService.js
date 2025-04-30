import axios from 'axios';

// Base URL for API requests
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Maintenance API services
const maintenanceService = {
  // Get all maintenance records with optional filters
  getMaintenanceHistory: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await apiClient.get(`/maintenance?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch maintenance history' };
    }
  },
  
  // Get a single maintenance record by ID
  getMaintenanceRecord: async (recordId) => {
    try {
      const response = await apiClient.get(`/maintenance/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch maintenance record' };
    }
  },
  
  // Create a new maintenance record
  createMaintenanceRecord: async (recordData) => {
    try {
      const response = await apiClient.post('/maintenance', recordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create maintenance record' };
    }
  },
  
  // Update an existing maintenance record
  updateMaintenanceRecord: async (recordId, recordData) => {
    try {
      const response = await apiClient.put(`/maintenance/${recordId}`, recordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update maintenance record' };
    }
  },
  
  // Delete a maintenance record
  deleteMaintenanceRecord: async (recordId) => {
    try {
      const response = await apiClient.delete(`/maintenance/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete maintenance record' };
    }
  },
  
  // Submit an AI-based maintenance check
  submitAIMaintenance: async (checkData) => {
    try {
      const response = await apiClient.post('/maintenance/ai-check', checkData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to submit AI maintenance check' };
    }
  },
  
  // Get maintenance analysis for a specific panel
  getPanelAnalysis: async (panelId) => {
    try {
      const response = await apiClient.get(`/maintenance/analyze/${panelId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get panel analysis' };
    }
  }
};

export default maintenanceService; 