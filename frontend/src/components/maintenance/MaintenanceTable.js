import React, { useState } from 'react';
import { 
  DataGrid, 
  GridToolbar,
  GridActionsCellItem
} from '@mui/x-data-grid';
import { 
  Box, 
  Typography, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Status chip colors
const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Critical':
      return 'error';
    case 'In Progress':
      return 'info';
    default:
      return 'default';
  }
};

// Type chip colors
const getTypeColor = (type) => {
  switch (type) {
    case 'Routine Check':
      return 'primary';
    case 'Repair':
      return 'error';
    case 'Cleaning':
      return 'info';
    case 'AI-Suggested Maintenance':
      return 'secondary';
    default:
      return 'default';
  }
};

function MaintenanceTable({ 
  records, 
  isLoading, 
  onEditRecord, 
  onDeleteRecord, 
  onViewDetails 
}) {
  const theme = useTheme();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Handle row actions
  const handleViewDetails = (record) => {
    if (onViewDetails) {
      onViewDetails(record);
    }
  };

  const handleEditRecord = (record) => {
    if (onEditRecord) {
      onEditRecord(record);
    }
  };

  const handleDeleteClick = (record) => {
    setSelectedRecord(record);
    setConfirmDelete(true);
  };

  const confirmDeleteRecord = () => {
    if (onDeleteRecord && selectedRecord) {
      onDeleteRecord(selectedRecord.id);
      setConfirmDelete(false);
      setSelectedRecord(null);
    }
  };

  // Table columns configuration
  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70,
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 120,
      valueFormatter: (params) => {
        // Format date if needed
        return params.value;
      }
    },
    { 
      field: 'panelId', 
      headerName: 'Panel ID', 
      width: 120 
    },
    { 
      field: 'technician', 
      headerName: 'Technician', 
      width: 180,
      valueGetter: (params) => params.row.technician || params.row.technicianName || 'N/A'
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 200,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getTypeColor(params.value)} 
          size="small" 
          variant="outlined"
        />
      ),
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value)} 
          size="small"
        />
      ),
    },
    { 
      field: 'source', 
      headerName: 'Source', 
      width: 130,
      valueGetter: (params) => params.row.source || 'Manual Entry'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="View"
          onClick={() => handleViewDetails(params.row)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditRecord(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteClick(params.row)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={records || []}
        columns={columns}
        loading={isLoading}
        components={{ Toolbar: GridToolbar }}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
          sorting: {
            sortModel: [{ field: 'date', sort: 'desc' }],
          },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        sx={{
          '& .MuiDataGrid-row:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this maintenance record?
            {selectedRecord && (
              <Box component="span" sx={{ fontWeight: 'bold' }}>
                {` (ID: ${selectedRecord.id}, Panel: ${selectedRecord.panelId})`}
              </Box>
            )}
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={confirmDeleteRecord} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MaintenanceTable; 