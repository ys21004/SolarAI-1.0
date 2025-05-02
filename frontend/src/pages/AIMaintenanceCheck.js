import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  MenuItem,
} from '@mui/material';
import { apiService } from '../services/apiService';
import { usePanels } from '../context/PanelsContext';

const AIMaintenanceCheck = () => {
  const { panels, loading, error: panelsError } = usePanels();
  const [selectedPanel, setSelectedPanel] = useState('');
  const [formData, setFormData] = useState({
    dc_power: '',
    ac_power: '',
    ambient_temp: '',
    module_temp: '',
    irradiation: '',
  });
  const [loadingApi, setLoadingApi] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    console.log('AIMaintenanceCheck - Component mounted');
    console.log('AIMaintenanceCheck - Current panels:', panels);
    console.log('AIMaintenanceCheck - Loading state:', loading);
    console.log('AIMaintenanceCheck - Error state:', panelsError);
    console.log('AIMaintenanceCheck - Selected panel:', selectedPanel);
    console.log('AIMaintenanceCheck - Form data:', formData);
  }, [panels, loading, panelsError, selectedPanel, formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form field changed:', name, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePanelChange = (e) => {
    const panelId = e.target.value;
    console.log('Panel selection changed:', panelId);
    setSelectedPanel(panelId);
    
    // Find the selected panel
    const panel = panels.find(p => p.id === panelId);
    console.log('Found panel:', panel);
    
    if (panel) {
      // Convert string values to numbers and handle missing values
      const formData = {
        dc_power: panel.dc_power ? parseFloat(panel.dc_power) : '',
        ac_power: panel.ac_power ? parseFloat(panel.ac_power) : '',
        ambient_temp: panel.ambient_temp ? parseFloat(panel.ambient_temp) : '',
        module_temp: panel.module_temp ? parseFloat(panel.module_temp) : '',
        irradiation: panel.irradiation ? parseFloat(panel.irradiation) : '',
      };
      
      console.log('Setting form data from panel:', formData);
      setFormData(formData);
    } else {
      console.log('Panel not found, resetting form data');
      setFormData({
        dc_power: '',
        ac_power: '',
        ambient_temp: '',
        module_temp: '',
        irradiation: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', { selectedPanel, formData });
    setLoadingApi(true);
    setError(null);
    setPrediction(null);

    try {
      // Validate input values
      const numericData = {
        panelId: selectedPanel,
        dc_power: parseFloat(formData.dc_power),
        ac_power: parseFloat(formData.ac_power),
        ambient_temp: parseFloat(formData.ambient_temp),
        module_temp: parseFloat(formData.module_temp),
        irradiation: parseFloat(formData.irradiation),
      };
      
      console.log('Validated numeric data:', numericData);
      
      for (const [key, value] of Object.entries(numericData)) {
        if (isNaN(value)) {
          throw new Error(`Invalid value for ${key}`);
        }
      }

      console.log('Sending data to API:', numericData);
      const response = await apiService.aiMaintenanceCheck(numericData);
      console.log('API Response:', response);
      
      if (response.status === 'success' && response.prediction) {
        setPrediction({
          needsMaintenance: response.prediction.needs_maintenance,
          confidence: response.prediction.confidence,
          efficiency: response.prediction.efficiency,
          issues: response.prediction.issues,
          timestamp: response.prediction.timestamp
        });
      } else {
        console.error('Invalid response format:', response);
        setError(response.message || 'Invalid response from server');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'An error occurred while making the prediction');
    } finally {
      setLoadingApi(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading panels...</Typography>
      </Box>
    );
  }

  if (panelsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading panels: {panelsError}
        </Alert>
      </Box>
    );
  }

  if (!panels || panels.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          No panels found in the database. Please add some panels first.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Maintenance Check
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Panel"
                value={selectedPanel}
                onChange={handlePanelChange}
                required
              >
                {panels.map((panel) => (
                  <MenuItem key={panel.id} value={panel.id}>
                    {panel.name} - {panel.location}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="DC Power (W)"
                name="dc_power"
                type="number"
                value={formData.dc_power}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="AC Power (W)"
                name="ac_power"
                type="number"
                value={formData.ac_power}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ambient Temperature (°C)"
                name="ambient_temp"
                type="number"
                value={formData.ambient_temp}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Module Temperature (°C)"
                name="module_temp"
                type="number"
                value={formData.module_temp}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Irradiation (W/m²)"
                name="irradiation"
                type="number"
                value={formData.irradiation}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loadingApi}
                fullWidth
              >
                {loadingApi ? <CircularProgress size={24} /> : 'Run Maintenance Check'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {prediction && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Maintenance Check Results
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert 
                severity={prediction.needsMaintenance ? "warning" : "success"}
                sx={{ mb: 2 }}
              >
                {prediction.needsMaintenance 
                  ? "Maintenance Required" 
                  : "No Maintenance Required"}
              </Alert>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                Confidence: {prediction.confidence}%
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                Efficiency: {prediction.efficiency}%
            </Typography>
            </Grid>
            
            {prediction.issues && prediction.issues.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Detected Issues:
            </Typography>
                <ul>
                  {prediction.issues.map((issue, index) => (
                    <li key={index}>
            <Typography variant="body2">
                        {issue}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Analysis performed at: {new Date(prediction.timestamp).toLocaleString()}
            </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default AIMaintenanceCheck; 