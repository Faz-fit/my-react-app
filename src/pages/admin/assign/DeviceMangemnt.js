import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Tooltip
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import api from 'utils/api';

const initialDevices = [];

export default function DeviceGrid() {
  const [devices, setDevices] = useState(initialDevices);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);

  // Fetch devices only
  const fetchDevices = async () => {
    try {
      const devicesRes = await api.get('/api/devices/');
      setDevices(devicesRes.data);  // Update state with the devices
    } catch (err) {
      console.error('Error fetching devices:', err);
    }
  };

  useEffect(() => {
    fetchDevices();  // Fetch devices on initial load
  }, []);

  const handleDeleteClick = (deviceId) => {
    setDeviceToDelete(deviceId);  // Set the device to be deleted
    setDeleteConfirmOpen(true);   // Open the delete confirmation dialog
  };

const handleDeleteConfirm = async () => {
  try {
    await api.delete('/api/devices/delete/', {
      headers: {
        'Content-Type': 'application/json',  // Set content type to application/json
      },
      data: JSON.stringify({ device_id: deviceToDelete }),  // Send device_id as JSON in the body
    });
    alert('Device deleted successfully!');
    fetchDevices();  // Refresh the list of devices after deletion
  } catch (err) {
    console.error('Error deleting device:', err);
    alert('There was an error deleting the device.');
  }
  setDeleteConfirmOpen(false);  // Close the confirmation dialog
};


  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);  // Close the confirmation dialog without deleting
  };

  const columns = [
    { field: 'device_id', headerName: 'Device ID', flex: 1 },
    { field: 'fullname', headerName: 'Employee ID', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="Delete"><DeleteIcon /></Tooltip>}
          label="Delete"
          onClick={() => handleDeleteClick(params.row.device_id)} // Handle delete action
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 600, width: '90%', mx: 'auto', mt: 5, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>Devices</Typography>

      <DataGrid
        rows={devices}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.device_id}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this device?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="secondary">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
