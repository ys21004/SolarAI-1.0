import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddIcon from '@mui/icons-material/Add';
import AddPanelModal from '../components/AddPanelModal';
import { usePanels } from '../context/PanelsContext';

const Dashboard = () => {
  const { panels, loading } = usePanels();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading dashboard data...</Typography>
      </Box>
    );
  }

  // Calculate panel statistics
  const totalPanels = panels.length;
  const activePanels = panels.filter(panel => panel.status === 'active').length;
  const maintenancePanels = panels.filter(panel => 
    panel.status === 'maintenance' || panel.maintenanceRequired === true
  ).length;

  // Prepare chart data
  const powerData = panels.map(panel => ({
    name: panel.name,
    dc_power: panel.dc_power ? parseFloat(panel.dc_power) : 0,
    ac_power: panel.ac_power ? parseFloat(panel.ac_power) : 0,
  }));

  const temperatureData = panels.map(panel => ({
    name: panel.name,
    ambient: panel.ambient_temp ? parseFloat(panel.ambient_temp) : 0,
    module: panel.module_temp ? parseFloat(panel.module_temp) : 0,
  }));

  const handlePanelAdded = () => {
    setModalOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Add Panel
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                  <Typography variant="subtitle1">Total Panels</Typography>
                  <Typography variant="h4">{totalPanels}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                  <Typography variant="subtitle1">Active Panels</Typography>
                  <Typography variant="h4">{activePanels || totalPanels}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                  <Typography variant="subtitle1">Maintenance Required</Typography>
                  <Typography variant="h4">{maintenancePanels}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Power Output
            </Typography>
            {panels.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={powerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="dc_power" fill="#1a237e" name="DC Power" />
                <Bar dataKey="ac_power" fill="#3949ab" name="AC Power" />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body1" color="textSecondary">
                  No panel data available. Add a panel to see power metrics.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Temperature Readings
            </Typography>
            {panels.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ambient" fill="#ff9800" name="Ambient Temperature" />
                <Bar dataKey="module" fill="#f44336" name="Module Temperature" />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body1" color="textSecondary">
                  No panel data available. Add a panel to see temperature metrics.
            </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <AddPanelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPanelAdded={handlePanelAdded}
      />
    </Box>
  );
};

export default Dashboard; 