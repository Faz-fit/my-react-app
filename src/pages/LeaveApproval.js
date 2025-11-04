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
  Tooltip,
  IconButton,
  useTheme,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from 'utils/api';

export default function LeaveApproval() {
  const theme = useTheme();

  const [requests, setRequests] = useState([]);
  const [userOutlets, setUserOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user outlets
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/user/');
        const outlets = res.data.outlets || [];
        setUserOutlets(outlets);
        if (outlets.length > 0) setSelectedOutlet(outlets[0].id);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  // Fetch leave requests when outlet changes
  useEffect(() => {
    if (!selectedOutlet) return;

    const fetchLeaveRequests = async () => {
      setLoading(true);
      try {
        const [leaveRes] = await Promise.all([
          api.get('/api/attendance/outletleaverequests/', {
            params: { outlet_id: selectedOutlet },
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
      } catch (err) {
        console.error('Error fetching leave requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, [selectedOutlet]);

  // Approve / Reject handlers
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

  // Columns for DataGrid
  const columns = [
    { field: 'leave_refno', headerName: 'Leave Ref No', flex: 1, minWidth: 120 },
    { field: 'leave_date', headerName: 'Leave Date', flex: 1, minWidth: 120 },
    { field: 'remarks', headerName: 'Remarks', flex: 1.5, minWidth: 180 },
    { field: 'action_date', headerName: 'Action Date', flex: 1, minWidth: 130 },
    { field: 'employee_name', headerName: 'Full Name', flex: 2, minWidth: 200 },
    { field: 'leave_type_name', headerName: 'Leave Type', flex: 1, minWidth: 140 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 140,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const status = params.value?.toLowerCase();
        if (status === 'pending') {
          return (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Tooltip title="Approve">
                <IconButton
                  aria-label="approve"
                  color="success"
                  size="small"
                  onClick={() => handleApprove(params.row.leave_refno)}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton
                  aria-label="reject"
                  color="error"
                  size="small"
                  onClick={() => handleReject(params.row.leave_refno)}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }
        return (
          <Chip
            label={status.toUpperCase()}
            color={status === 'approved' ? 'success' : 'error'}
            size="small"
            sx={{ fontWeight: 600, borderRadius: '4px' }} 
          />
        );
      },
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 18,
          color: theme.palette.text.secondary,
        }}
      >
        Loading leave requests...
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        mt: 4,
        maxWidth: 1200,
        mx: 'auto',
        bgcolor: 'transparent',
        boxSizing: 'border-box',
      }}
    >
      {/* Header & Outlet Selector */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            
            pb: 0.5,
            userSelect: 'none',
            textTransform:'uppercase',
          }}
        >
          Leave Requests
        </Typography>

        {userOutlets.length > 1 && (
          <FormControl
            variant="standard"
            size="small"
            sx={{ minWidth: 220 }}
          >
            <InputLabel id="outlet-select-label" sx={{ color: '#555' }}>
              Select Outlet
            </InputLabel>
            <Select
              labelId="outlet-select-label"
              value={selectedOutlet || ''}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              sx={{
                color: '#222',
              }}
            >
              {userOutlets.map((outlet) => (
                <MenuItem key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Leave Requests Table */}
      <Box sx={{ height: 520, width: '100%' }}>
        <DataGrid
          rows={requests}
          columns={columns}
          pageSize={7}
          rowsPerPageOptions={[5, 7, 10, 20]}
          getRowId={(row) => row.leave_refno}
          disableSelectionOnClick
          sx={{
            borderRadius: 1,
            border: '1px solid #e0e0e0',
            fontSize: 14,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f0f0f0',
              fontWeight: 600,
              color: '#333',
              minHeight: 40,
              maxHeight: 40,
              userSelect: 'none',
            },
            '& .MuiDataGrid-cell': {
              py: 1,
              borderBottom: '1px solid #eee',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#fafafa',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#fafafa',
            },
          }}
        />
      </Box>
    </Paper>
  );
}
