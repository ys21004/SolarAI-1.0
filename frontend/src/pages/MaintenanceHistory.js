import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const MaintenanceHistory = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/maintenance/history');
        if (response.data.status === 'success') {
          setMaintenanceRecords(response.data.records);
        } else {
          setError('Failed to fetch maintenance records: ' + response.data.message);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch maintenance records: ' + (err.response?.data?.message || err.message));
        setLoading(false);
        console.error('Error fetching maintenance records:', err);
      }
    };

    fetchMaintenanceRecords();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Maintenance History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Panel ID</TableCell>
              <TableCell>Technician</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maintenanceRecords.length > 0 ? (
              maintenanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatTimestamp(record.timestamp)}</TableCell>
                  <TableCell>{record.panelId}</TableCell>
                  <TableCell>{record.technicianName}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{record.status}</TableCell>
                  <TableCell>{record.description || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No maintenance records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MaintenanceHistory; 