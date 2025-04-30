import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddPanelModal from '../components/AddPanelModal';
import { usePanels } from '../context/PanelsContext';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { panels, loading, error, panelStats } = usePanels();
  const [modalOpen, setModalOpen] = useState(false);

  // Prepare chart data with proper validation
  const prepareChartData = (panels) => {
    return panels.map(panel => ({
      name: panel.name || 'Unnamed Panel',
      dcPower: typeof panel.dcPower === 'number' ? panel.dcPower : 
               typeof panel.dcPower === 'string' ? parseFloat(panel.dcPower) : 0,
      acPower: typeof panel.acPower === 'number' ? panel.acPower : 
               typeof panel.acPower === 'string' ? parseFloat(panel.acPower) : 0,
      moduleTemp: typeof panel.moduleTemp === 'number' ? panel.moduleTemp : 
                 typeof panel.moduleTemp === 'string' ? parseFloat(panel.moduleTemp) : 0,
      ambientTemp: typeof panel.ambientTemp === 'number' ? panel.ambientTemp : 
                  typeof panel.ambientTemp === 'string' ? parseFloat(panel.ambientTemp) : 0,
    }));
  };

  const chartData = prepareChartData(panels);

  // Power Output Chart Configuration
  const powerChartData = {
    labels: chartData.map(panel => panel.name),
    datasets: [
      {
        label: 'DC Power (W)',
        data: chartData.map(panel => panel.dcPower),
        backgroundColor: 'rgba(26, 35, 126, 0.8)',
        borderColor: 'rgba(26, 35, 126, 1)',
        borderWidth: 1,
      },
      {
        label: 'AC Power (W)',
        data: chartData.map(panel => panel.acPower),
        backgroundColor: 'rgba(57, 73, 171, 0.8)',
        borderColor: 'rgba(57, 73, 171, 1)',
        borderWidth: 1,
      },
    ],
  };

  const powerChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Power Output by Panel',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Power (W)',
        },
      },
    },
  };

  // Temperature Chart Configuration
  const temperatureChartData = {
    labels: chartData.map(panel => panel.name),
    datasets: [
      {
        label: 'Module Temperature (°C)',
        data: chartData.map(panel => panel.moduleTemp),
        backgroundColor: 'rgba(244, 67, 54, 0.8)',
        borderColor: 'rgba(244, 67, 54, 1)',
        borderWidth: 1,
      },
      {
        label: 'Ambient Temperature (°C)',
        data: chartData.map(panel => panel.ambientTemp),
        backgroundColor: 'rgba(255, 152, 0, 0.8)',
        borderColor: 'rgba(255, 152, 0, 1)',
        borderWidth: 1,
      },
    ],
  };

  const temperatureChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Temperature Readings by Panel',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Temperature (°C)',
        },
      },
    },
  };

  const handlePanelAdded = () => {
    setModalOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

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
                  <Typography variant="h4">{panelStats.total}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                  <Typography variant="subtitle1">Active Panels</Typography>
                  <Typography variant="h4">{panelStats.active}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                  <Typography variant="subtitle1">Maintenance Required</Typography>
                  <Typography variant="h4">{panelStats.maintenanceRequired}</Typography>
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
              <Box sx={{ height: 400 }}>
                <Bar data={powerChartData} options={powerChartOptions} />
              </Box>
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
              <Box sx={{ height: 400 }}>
                <Bar data={temperatureChartData} options={temperatureChartOptions} />
              </Box>
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