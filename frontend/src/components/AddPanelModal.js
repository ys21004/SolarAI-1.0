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
    dcPower: '',
    acPower: '',
    ambientTemp: '',
    moduleTemp: '',
    irradiation: '',
    status: 'active'
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
    const requiredFields = ['name', 'dcPower', 'acPower', 'ambientTemp', 'moduleTemp', 'irradiation'];
    const emptyFields = requiredFields.filter(field => !panelData[field]);
    
    if (emptyFields.length > 0) {
      setValidationError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return false;
    }

    // Validate numeric values
    const numericFields = ['dcPower', 'acPower', 'ambientTemp', 'moduleTemp', 'irradiation'];
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
      // Convert string values to numbers
      const processedData = {
        ...panelData,
        dcPower: parseFloat(panelData.dcPower),
        acPower: parseFloat(panelData.acPower),
        ambientTemp: parseFloat(panelData.ambientTemp),
        moduleTemp: parseFloat(panelData.moduleTemp),
        irradiation: parseFloat(panelData.irradiation)
      };

      await addPanel(processedData);
      // Reset form and close modal on success
      setPanelData({
        name: '',
        dcPower: '',
        acPower: '',
        ambientTemp: '',
        moduleTemp: '',
        irradiation: '',
        status: 'active'
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
              name="dcPower"
              type="number"
              value={panelData.dcPower}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="AC Power (W)"
              name="acPower"
              type="number"
              value={panelData.acPower}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ambient Temperature (°C)"
              name="ambientTemp"
              type="number"
              value={panelData.ambientTemp}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Module Temperature (°C)"
              name="moduleTemp"
              type="number"
              value={panelData.moduleTemp}
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