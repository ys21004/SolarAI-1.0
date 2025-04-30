import React, { useState } from 'react';
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
  const { panels, loading } = usePanels();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePanelChange = (e) => {
    const panelName = e.target.value;
    setSelectedPanel(panelName);
    const panel = panels.find(p => p.name === panelName);
    if (panel) {
      setFormData({
        dc_power: panel.dc_power,
        ac_power: panel.ac_power,
        ambient_temp: panel.ambient_temp,
        module_temp: panel.module_temp,
        irradiation: panel.irradiation,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          prediction: response.prediction.prediction,
          confidence: response.prediction.confidence,
          timestamp: response.prediction.timestamp
        });
      } else {
        console.error('Invalid response format:', response);
        setError(response.error || 'Invalid response from server');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'An error occurred while making the prediction');
    } finally {
      setLoadingApi(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
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
                  <MenuItem key={panel.name} value={panel.name}>
                    {panel.name}
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
            <Grid item xs={12}>
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
                fullWidth
                disabled={loadingApi}
              >
                {loadingApi ? <CircularProgress size={24} /> : 'Analyze'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {prediction && (
        <Card sx={{ 
          bgcolor: prediction.prediction ? 'error.light' : 'success.light',
          color: 'white',
          mb: 2
        }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {prediction.prediction ? 'Maintenance Required' : 'System OK'}
            </Typography>
            <Typography variant="body1">
              Confidence: {(prediction.confidence * 100).toFixed(2)}%
            </Typography>
            <Typography variant="body2">
              Timestamp: {new Date(prediction.timestamp).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AIMaintenanceCheck; 