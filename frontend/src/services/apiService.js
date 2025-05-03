import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const apiService = {
  createMaintenanceRecord: async (record) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/maintenance`, record);
      return response.data;
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      throw error.response?.data || { error: 'Failed to create maintenance record' };
    }
  },

  getMaintenanceHistory: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`${API_BASE_URL}/maintenance/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
      throw error.response?.data || { error: 'Failed to fetch maintenance history' };
    }
  },

  getPanelMaintenance: async (panelId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance/panel/${panelId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching panel maintenance:', error);
      throw error.response?.data || { error: 'Failed to fetch panel maintenance' };
    }
  },

  getMaintenanceRecord: async (recordId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance record:', error);
      throw error.response?.data || { error: 'Failed to fetch maintenance record' };
    }
  },

  updateMaintenanceRecord: async (recordId, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/maintenance/${recordId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      throw error.response?.data || { error: 'Failed to update maintenance record' };
    }
  },

  deleteMaintenanceRecord: async (recordId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/maintenance/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      throw error.response?.data || { error: 'Failed to delete maintenance record' };
    }
  },

  getMaintenanceAnalytics: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance analytics:', error);
      throw error.response?.data || { error: 'Failed to fetch maintenance analytics' };
    }
  },

  analyzePanel: async (panelId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance/analyze/${panelId}`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing panel:', error);
      throw error.response?.data || { error: 'Failed to analyze panel' };
    }
  },

  predictMaintenance: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/predict-maintenance`, data);
      return response.data;
    } catch (error) {
      console.error('Error predicting maintenance:', error);
      throw error.response?.data || { error: 'Failed to predict maintenance' };
    }
  },

  aiMaintenanceCheck: async (data) => {
    try {
      console.log('Making AI maintenance check request with data:', data);
      const response = await axios.post(`${API_BASE_URL}/maintenance/ai-check`, data);
      console.log('AI maintenance check response:', response.data);
      
      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Unknown error occurred');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error performing AI maintenance check:', error);
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to perform AI maintenance check',
          status: error.response.data.status || 'error'
        };
      }
      throw {
        message: error.message || 'Failed to perform AI maintenance check',
        status: 'error'
      };
    }
  }
}; 