import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, MenuItem, FormControl, InputLabel, Select, CircularProgress, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Dummy data for devices with UUIDs (normally, this would come from an API)
const devices = [
  { id: 'uuid1', name: 'Device 1' },
  { id: 'uuid2', name: 'Device 2' },
  { id: 'uuid3', name: 'Device 3' },
];

const AssignDeviceOutlet = () => {
  const [incomingRequests, setIncomingRequests] = useState([
    { id: 'uuid1', deviceId: 'uuid1', outletId: '' },
    { id: 'uuid2', deviceId: 'uuid2', outletId: '' },
    { id: 'uuid3', deviceId: 'uuid3', outletId: '' },
  ]);

  const [assignedData, setAssignedData] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch outlets data after the component mounts
    fetchOutlets();
  }, []);

  const fetchOutlets = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('access_token');  // Get access token from local storage
      const response = await axios.get('http://139.59.243.2:8000/api/outlets/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,  // Send the token in the header for authorization
        },
      });
      setOutlets(response.data);  // Set the fetched outlets data
      setLoading(false);
    } catch (error) {
      console.error('Error fetching outlets:', error);
      setLoading(false);
    }
  };

  const handleOutletChange = (deviceId, outletId) => {
    const updatedRequests = incomingRequests.map((request) =>
      request.deviceId === deviceId ? { ...request, outletId } : request
    );
    setIncomingRequests(updatedRequests);
  };

  const handleAssignOutlet = (deviceId) => {
    const request = incomingRequests.find((req) => req.deviceId === deviceId);

    if (request && request.outletId) {
      const updatedAssignedData = [...assignedData, { ...request }];
      setAssignedData(updatedAssignedData);
      setIncomingRequests(incomingRequests.filter((req) => req.deviceId !== deviceId));
    }
  };

  const incomingColumns = [
    { field: 'deviceId', headerName: 'Device UUID', width: 250 },
    {
      field: 'outletId',
      headerName: 'Assign Outlet',
      renderCell: (params) => (
        <FormControl fullWidth>
          <InputLabel id={`outlet-label-${params.row.deviceId}`}>Select Outlet</InputLabel>
          <Select
            labelId={`outlet-label-${params.row.deviceId}`}
            value={params.row.outletId}
            onChange={(e) => handleOutletChange(params.row.deviceId, e.target.value)}
            label="Select Outlet"
          >
            {outlets.map((outlet) => (
              <MenuItem key={outlet.id} value={outlet.id}>
                {outlet.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
      width: 250,
    },
    {
      field: 'assign',
      headerName: 'Assign',
      renderCell: (params) => (
        <Button
          onClick={() => handleAssignOutlet(params.row.deviceId)}
          color="primary"
          variant="contained"
          sx={{ borderRadius: 2 }}
          disabled={!params.row.outletId}
        >
          Assign
        </Button>
      ),
      width: 150,
    },
  ];

  const assignedColumns = [
    { field: 'deviceId', headerName: 'Device UUID', width: 250 },
    {
      field: 'outletId',
      headerName: 'Assigned Outlet',
      width: 250,
      renderCell: (params) => {
        const outlet = outlets.find((outlet) => outlet.id === params.value);
        return outlet ? outlet.name : 'No Outlet Assigned';
      },
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p:1 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 900 }}>
        Company Device Management
      </Typography>
     

      {/* Incoming Requests Section */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Incoming Device Assignment Requests</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <div style={{ height: 300, width: '100%' }}>
          <DataGrid
            rows={incomingRequests}
            columns={incomingColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            
          />
        </div>
      )}

      {/* Assigned Devices Section */}
      <Typography variant="h6" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>Assigned Devices and Outlets</Typography>
      <div style={{ height: 300, width: '100%' }}>
        <DataGrid
          rows={assignedData}
          columns={assignedColumns}
          pageSize={5}
          rowsPerPageOptions={[5]}
         
        />
      </div>
    </Box>
  );
};

export default AssignDeviceOutlet;
