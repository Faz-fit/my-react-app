import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function LeaveApproval() {
  const [requests, setRequests] = useState([]);
  const [userOutlets, setUserOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('access_token');

  // Fetch logged-in user outlets
  const fetchUser = async () => {
    try {
      const res = await axios.get('http://139.59.243.2:8000/api/user/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserOutlets(res.data.outlets);

      // Set default selected outlet immediately
      if (res.data.outlets.length > 0) {
        setSelectedOutlet(res.data.outlets[0].id);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  // Fetch leave requests for selected outlet
  const fetchLeaveRequests = async (outletId) => {
    if (!outletId) return;

    try {
      const [leaveRes, empRes] = await Promise.all([
        axios.get('http://139.59.243.2:8000/api/attendance/outletleaverequests/', {
          params: { outlet_id: outletId },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://139.59.243.2:8000/api/getemployees/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Map employee full name to leave requests
const mapped = leaveRes.data.map((req) => ({
  leave_refno: req.leave_refno,
  leave_date: req.leave_date,
  remarks: req.remarks,
  action_date: req.action_date,
  status: req.status,
  employee_name: req.employee_name,
  leave_type_name: req.leave_type_name,
}));

      setRequests(mapped);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  useEffect(() => {
    fetchLeaveRequests(selectedOutlet);
  }, [selectedOutlet]);

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://139.59.243.2:8000/api/attendance/updateleavestatus/${id}/`,
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests((prev) =>
        prev.map((req) => (req.leave_refno === id ? { ...req, status: 'approved' } : req))
      );
    } catch (err) {
      console.error('Error approving leave:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://139.59.243.2:8000/api/attendance/updateleavestatus/${id}/`,
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests((prev) =>
        prev.map((req) => (req.leave_refno === id ? { ...req, status: 'rejected' } : req))
      );
    } catch (err) {
      console.error('Error rejecting leave:', err);
    }
  };

const columns = [
  { field: 'leave_refno', headerName: 'Leave Ref No', flex: 1 },
  { field: 'leave_date', headerName: 'Leave Date', flex: 1 },
  { field: 'remarks', headerName: 'Remarks', flex: 1 },
  { field: 'action_date', headerName: 'Action Date', flex: 1 },
  { field: 'employee_name', headerName: 'Full Name', flex: 2 },
  { field: 'leave_type_name', headerName: 'Leave Type', flex: 1 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 1,
    renderCell: (params) =>
      params.value === 'pending' ? (
        <>
          <GridActionsCellItem
            icon={<CheckCircleIcon color="success" />}
            label="Approve"
            onClick={() => handleApprove(params.row.leave_refno)}
          />
          <GridActionsCellItem
            icon={<CancelIcon color="error" />}
            label="Reject"
            onClick={() => handleReject(params.row.leave_refno)}
          />
        </>
      ) : (
        <Chip
          label={params.value.toUpperCase()}
          color={params.value === 'approved' ? 'success' : 'error'}
          size="small"
        />
      ),
  },
];


  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3, boxShadow: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          mb: 3,
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            borderBottom: '3px solid #1976d2',
            display: 'inline-block',
            pb: 0.5,
          }}
        >
          LEAVE REQUESTS
        </Typography>

        {userOutlets.length > 1 && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="outlet-select-label">Select Outlet</InputLabel>
            <Select
              labelId="outlet-select-label"
              value={selectedOutlet || ''}
              label="Select Outlet"
              onChange={(e) => setSelectedOutlet(e.target.value)}
            >
              {userOutlets.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={requests}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          getRowId={(row) => row.leave_refno}
          disableRowSelectionOnClick
          sx={{
            borderRadius: 2,
            '& .MuiDataGrid-row:hover': { backgroundColor: '#f5f5f5' },
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
          }}
        />
      </Box>
    </Paper>
  );
}
