import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePanels } from '../context/PanelsContext';

function PanelList() {
  const { panels, loading, error, deletePanel } = usePanels();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [panelToDelete, setPanelToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (panel) => {
    setPanelToDelete(panel);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!panelToDelete) return;
    
    try {
      setDeleting(true);
      await deletePanel(panelToDelete.id);
      setDeleteDialogOpen(false);
      setPanelToDelete(null);
    } catch (error) {
      console.error('Error deleting panel:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPanelToDelete(null);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!panels || panels.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="textSecondary">No panels found in database.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Installed Panels
        </Typography>
        <Grid container spacing={2}>
          {panels.map((panel) => (
            <Grid item xs={12} sm={6} md={4} key={panel.id}>
              <Paper
                sx={{
                  p: 2,
                  position: 'relative',
                  borderLeft: `4px solid ${
                    panel.status === 'active'
                      ? '#4CAF50'
                      : panel.status === 'maintenance'
                      ? '#FF9800'
                      : '#F44336'
                  }`,
                }}
              >
                <IconButton
                  size="small"
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                  onClick={() => handleDeleteClick(panel)}
                >
                  <DeleteIcon />
                </IconButton>
                <Typography variant="h6" gutterBottom>
                  {panel.name}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Location:</strong> {panel.location}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {panel.status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>DC Power:</strong> {panel.dc_power}W
                  </Typography>
                  <Typography variant="body2">
                    <strong>AC Power:</strong> {panel.ac_power}W
                  </Typography>
                  <Typography variant="body2">
                    <strong>Ambient Temp:</strong> {panel.ambient_temp}°C
                  </Typography>
                  <Typography variant="body2">
                    <strong>Module Temp:</strong> {panel.module_temp}°C
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Panel</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete panel "{panelToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PanelList; 