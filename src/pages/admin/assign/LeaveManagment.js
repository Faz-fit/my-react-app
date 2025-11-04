import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Paper,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from 'utils/api';

export default function LeaveApproval() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaveRes, empRes] = await Promise.all([
          api.get('/api/attendance/allleaverequests'),
          api.get('/api/getemployees/'),
        ]);
        setRequests(leaveRes.data);
        setEmployees(empRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const mappedRequests = useMemo(() => {
    if (!requests.length || !employees.length) return [];
    return requests.map((req) => {
      const emp = employees.find((e) => e.employee_id === req.employee);
      return { ...req, employeeName: emp ? emp.first_name : 'Unknown' };
    });
  }, [requests, employees]);

  const handleApprove = (id) => {
    setCurrentRequest({ id, action: 'approved' });
    setOpenDialog(true);
  };

  const handleReject = (id) => {
    setCurrentRequest({ id, action: 'rejected' });
    setOpenDialog(true);
  };

  const confirmAction = async () => {
    if (!currentRequest) return;
    try {
      const response = await api.put(
        `/api/attendance/updateleavestatus/${currentRequest.id}/`,
        { status: currentRequest.action }
      );

      if (response.status === 200) {
        setRequests((prev) =>
          prev.map((req) =>
            req.leave_refno === currentRequest.id
              ? { ...req, status: currentRequest.action }
              : req
          )
        );
        alert(
          `${currentRequest.action.charAt(0).toUpperCase() + currentRequest.action.slice(1)} Leave`
        );
      } else {
        alert(`Error ${currentRequest.action} leave request!`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Error ${currentRequest.action} leave request!`);
    } finally {
      setOpenDialog(false);
      setCurrentRequest(null);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentRequest(null);
  };

  const filteredRequests =
    statusFilter === 'all'
      ? mappedRequests
      : mappedRequests.filter((req) => req.status === statusFilter);

  // ✅ FLEX columns for responsive fitting
  const columns = [
    { field: 'leave_refno', headerName: 'Ref No', flex: 0.6, minWidth: 100 },
    { field: 'leave_date', headerName: 'Date', flex: 0.8, minWidth: 120 },
    { field: 'remarks', headerName: 'Remarks', flex: 1.2, minWidth: 160 },
    { field: 'add_date', headerName: 'Added On', flex: 0.8, minWidth: 120 },
    { field: 'employee', headerName: 'Emp ID', flex: 0.7, minWidth: 100 },
    { field: 'employeeName', headerName: 'Name', flex: 1, minWidth: 140 },
    { field: 'leave_type_name', headerName: 'Leave Type', flex: 1, minWidth: 140 },
    {
      field: 'actions',
      headerName: 'Status / Action',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <>
          {params.row.status === 'pending' ? (
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
            <Typography
              sx={{
                textTransform: 'capitalize',
                color:
                  params.row.status === 'approved'
                    ? 'green'
                    : params.row.status === 'rejected'
                    ? 'red'
                    : 'inherit',
                fontWeight: 600,
              }}
            >
              {params.row.status}
            </Typography>
          )}
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

return (
  <Box sx={{ p: 4 }}>
    {/* Page Title */}
    <Typography
      variant="h4"
      sx={{
        mb: 3,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        
        display: 'inline-block',
        pb: 0.5,
      }}
    >
      Leave Management
    </Typography>

    {/* Filter Section */}
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3,
      }}
    >
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          label="Status"
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </FormControl>
    </Box>

    {/* DataGrid */}
    <Box sx={{ height: 460, width: '100%', overflowX: 'hidden' }}>
      <DataGrid
        rows={filteredRequests}
        columns={columns.map((col) => ({
          ...col,
          flex: col.flex || 1,
          minWidth: col.minWidth || 120,
        }))}
        pageSize={5}
        rowsPerPageOptions={[5, 10]}
        disableRowSelectionOnClick
        getRowId={(row) => row.leave_refno}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f7fa',
            fontWeight: 700,
            fontSize: '0.95rem',
          },
          '& .MuiDataGrid-cell': {
            fontSize: '0.9rem',
          },
          '& .MuiDataGrid-row:hover': { backgroundColor: '#f9f9f9' },
          '& .MuiDataGrid-cell:focus': { outline: 'none' },
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      />
    </Box>

    {/* Confirmation Dialog */}
    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm Action</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to{' '}
          <strong>{currentRequest?.action}</strong> this leave request?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="inherit">
          Cancel
        </Button>
        <Button onClick={confirmAction} variant="contained" color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);

}
