import React, { useState, useEffect } from 'react';
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
import api from 'utils/api';

export default function LeaveApproval() {
  const [requests, setRequests] = useState([]);
  const [userOutlets, setUserOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/user/');
      const userOutlets = res.data.outlets || [];
      setUserOutlets(userOutlets);

      if (userOutlets.length > 0) {
        setSelectedOutlet(userOutlets[0].id);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchLeaveRequests = async (outletId) => {
    if (!outletId) return;

    try {
      const [leaveRes] = await Promise.all([
        api.get('/api/attendance/outletleaverequests/', {
          params: { outlet_id: outletId },
        }),
        api.get('/api/getemployees/'),
      ]);

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
    fetchUser();
  }, []);

  useEffect(() => {
    fetchLeaveRequests(selectedOutlet);
  }, [selectedOutlet]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/attendance/updateleavestatus/${id}/`, { status: 'approved' });
      setRequests((prev) =>
        prev.map((req) => (req.leave_refno === id ? { ...req, status: 'approved' } : req))
      );
    } catch (err) {
      console.error('Error approving leave:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/api/attendance/updateleavestatus/${id}/`, { status: 'rejected' });
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
