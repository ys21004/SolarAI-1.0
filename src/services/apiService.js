import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Update this with your backend URL

export const apiService = {
  createMaintenanceRecord: async (record) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/maintenance/`, record);
      if (!response.ok) {
        throw new Error(`Failed to submit maintenance record: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      throw error;
    }
  },

  getMaintenanceHistory: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance/history`);
      if (!response.ok) {
        throw new Error(`Failed to fetch maintenance history: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
      throw error;
    }
  },

  analyzePanel: async (panelId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance/analyze/${panelId}`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing panel:', error);
      throw error;
    }
  },

  predictMaintenance: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/predict-maintenance`, data);
      return response.data;
    } catch (error) {
      console.error('Error predicting maintenance:', error);
      throw error;
    }
  },

  aiMaintenanceCheck: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai-maintenance-check`, data);
      return response.data;
    } catch (error) {
      console.error('Error performing AI maintenance check:', error);
      throw error;
    }
  }
}; 