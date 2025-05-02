import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { usePanels } from '../context/PanelsContext';

function AddPanelModal({ open, onClose }) {
  const { addPanel, loading, error } = usePanels();
  const [panelData, setPanelData] = useState({
    name: '',
    dc_power: '',
    ac_power: '',
    ambient_temp: '',
    module_temp: '',
    irradiation: '',
  });
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPanelData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user starts typing
    if (validationError) setValidationError('');
  };

  const validateForm = () => {
    const requiredFields = ['name', 'dc_power', 'ac_power', 'ambient_temp', 'module_temp', 'irradiation'];
    const emptyFields = requiredFields.filter(field => !panelData[field]);
    
    if (emptyFields.length > 0) {
      setValidationError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return false;
    }

    // Validate numeric values
    const numericFields = ['dc_power', 'ac_power', 'ambient_temp', 'module_temp', 'irradiation'];
    const invalidFields = numericFields.filter(field => isNaN(parseFloat(panelData[field])));
    
    if (invalidFields.length > 0) {
      setValidationError(`Invalid values for: ${invalidFields.join(', ')}. Please enter numbers only.`);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await addPanel(panelData);
      // Reset form and close modal on success
      setPanelData({
        name: '',
        dc_power: '',
        ac_power: '',
        ambient_temp: '',
        module_temp: '',
        irradiation: '',
      });
      onClose();
    } catch (error) {
      // Error is handled by the context
      console.error('Error adding panel:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Solar Panel</DialogTitle>
      <DialogContent>
        {(error || validationError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || validationError}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Panel Name"
              name="name"
              value={panelData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="DC Power (W)"
              name="dc_power"
              type="number"
              value={panelData.dc_power}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="AC Power (W)"
              name="ac_power"
              type="number"
              value={panelData.ac_power}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ambient Temperature (°C)"
              name="ambient_temp"
              type="number"
              value={panelData.ambient_temp}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Module Temperature (°C)"
              name="module_temp"
              type="number"
              value={panelData.module_temp}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Irradiation (W/m²)"
              name="irradiation"
              type="number"
              value={panelData.irradiation}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Adding...' : 'Add Panel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddPanelModal; 