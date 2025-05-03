import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Autocomplete,
  Divider,
} from '@mui/material';
import { usePanels } from '../context/PanelsContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Safe operating ranges for solar panel parameters
const SAFE_RANGES = {
  dc_power: { min: 0, max: 1000, unit: 'W' },
  ac_power: { min: 0, max: 800, unit: 'W' },
  ambient_temp: { min: -20, max: 50, unit: '°C' },
  module_temp: { min: -20, max: 85, unit: '°C' },
  irradiation: { min: 0, max: 1200, unit: 'W/m²' },
};

const AIMaintenanceCheck = () => {
  const { panels } = usePanels();
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [formData, setFormData] = useState({
    dc_power: '',
    ac_power: '',
    ambient_temp: '',
    module_temp: '',
    irradiation: '',
    technician: ''
  });

  // Chart data for safe ranges
  const chartData = {
    labels: Object.keys(SAFE_RANGES).map(key => 
      key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    ),
    datasets: [
      {
        label: 'Safe Range',
        data: Object.values(SAFE_RANGES).map(range => range.max),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Current Values',
        data: Object.keys(SAFE_RANGES).map(key => {
          const value = parseFloat(formData[key]);
          return isNaN(value) ? 0 : value;
        }),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Solar Panel Parameters vs Safe Ranges',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw;
            const param = Object.keys(SAFE_RANGES)[context.dataIndex];
            const unit = SAFE_RANGES[param].unit;
            return `${label}: ${value}${unit}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    }
  };

  const handlePanelChange = (event, newValue) => {
    setSelectedPanel(newValue);
    
    // If a panel is selected, populate form with its data
    if (newValue) {
      setFormData({
        dc_power: newValue.dc_power || '',
        ac_power: newValue.ac_power || '',
        ambient_temp: newValue.ambient_temp || '',
        module_temp: newValue.module_temp || '',
        irradiation: newValue.irradiation || '',
        technician: newValue.technician || ''
      });
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch('http://localhost:5001/api/maintenance/ai-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          panelId: selectedPanel?.id,
          technician: formData.technician,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to perform maintenance check');
      }

      setPrediction(data.prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        AI Maintenance Check
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    value={selectedPanel}
                    onChange={handlePanelChange}
                    options={panels}
                    getOptionLabel={(option) => option.name || ''}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Solar Panel"
                        variant="outlined"
                        required
                        sx={{ mb: 2 }}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Typography variant="body1">{option.name}</Typography>
                      </Box>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Technician Name"
                    name="technician"
                    value={formData.technician}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    placeholder="Enter technician's name"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="DC Power (W)"
                    name="dc_power"
                    type="number"
                    value={formData.dc_power}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="AC Power (W)"
                    name="ac_power"
                    type="number"
                    value={formData.ac_power}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ambient Temperature (°C)"
                    name="ambient_temp"
                    type="number"
                    value={formData.ambient_temp}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    InputProps={{
                      inputProps: { min: -50, max: 100 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Module Temperature (°C)"
                    name="module_temp"
                    type="number"
                    value={formData.module_temp}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    InputProps={{
                      inputProps: { min: -50, max: 100 }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Irradiation (W/m²)"
                    name="irradiation"
                    type="number"
                    value={formData.irradiation}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    InputProps={{
                      inputProps: { min: 0, max: 2000 }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !selectedPanel || !formData.technician}
                    fullWidth
                    size="large"
                    sx={{ mt: 2, py: 1.5 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Run AI Maintenance Check'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Safe Operating Ranges
            </Typography>
            <Box sx={{ height: 400 }}>
              <Bar data={chartData} options={chartOptions} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Legend:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Green bars represent safe operating ranges
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Red bars represent current panel values
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          </Grid>
        )}

        {prediction && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, mt: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Maintenance Check Results
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert 
                    severity={prediction.needs_maintenance ? "warning" : "success"}
                    sx={{ mb: 3 }}
                  >
                    {prediction.needs_maintenance 
                      ? "Maintenance Required" 
                      : "No Maintenance Required"}
                  </Alert>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Model Confidence
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ width: '100%', mr: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={prediction.confidence}
                        color={prediction.needs_maintenance ? "warning" : "success"}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 45 }}>
                      <Typography variant="body2" color="text.secondary">
                        {prediction.confidence}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    System Efficiency
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {prediction.efficiency}%
                  </Typography>
                </Grid>
                
                {prediction.issues && prediction.issues.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Detected Issues and Recommendations
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {prediction.issues.map((issue, index) => (
                        <Paper 
                          key={index} 
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            borderLeft: 4, 
                            borderColor: issue.severity === 'High' ? 'error.main' : 'warning.main',
                            backgroundColor: 'background.default'
                          }}
                        >
                          <Typography variant="subtitle2" color="error" gutterBottom>
                            {issue.issue}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Severity: {issue.severity}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
                            Recommended Actions:
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                            {issue.recommended_actions.map((action, actionIndex) => (
                              <Box component="li" key={actionIndex} sx={{ mb: 0.5 }}>
                                <Typography variant="body2">
                                  {action}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  </Grid>
                )}

                {prediction.general_recommendations && prediction.general_recommendations.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      General Maintenance Recommendations
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                      {prediction.general_recommendations.map((recommendation, index) => (
                        <Box component="li" key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            {recommendation}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Analysis performed at: {new Date(prediction.timestamp).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AIMaintenanceCheck; 