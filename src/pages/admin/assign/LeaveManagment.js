import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, MenuItem, Select, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from 'utils/api';

export default function LeaveApproval() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false); // Dialog visibility state
  const [currentRequest, setCurrentRequest] = useState(null); // Track the request to approve/reject

  // Retrieve JWT token from localStorage or sessionStorage
  const token = localStorage.getItem('access_token'); // or sessionStorage.getItem('token')

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await api.get('/api/attendance/allleaverequests');
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };

    const fetchEmployeeData = async () => {
      try {
        const response = await api.get('/api/getemployees/');
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchLeaveRequests();
    fetchEmployeeData();
  }, []);

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
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.leave_refno === currentRequest.id
              ? { ...req, status: currentRequest.action }
              : req
          )
        );

        alert(`${currentRequest.action.charAt(0).toUpperCase() + currentRequest.action.slice(1)} Leave`);
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
    setOpenDialog(false); // Close the dialog without action
    setCurrentRequest(null);
  };

  const mapEmployeeData = (requests, employees) => {
    return requests.map(request => {
      const employee = employees.find(emp => emp.employee_id === request.employee);
      return {
        ...request,
        employeeName: employee ? employee.first_name : 'Unknown',
      };
    });
  };

  useEffect(() => {
    if (requests.length > 0 && employees.length > 0) {
      const mappedRequests = mapEmployeeData(requests, employees);
      setRequests(mappedRequests);
      setLoading(false);
    }
  }, [requests, employees]);

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(req => req.status === statusFilter);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const columns = [
    { field: 'leave_refno', headerName: 'Leave Ref No', width: 150 },
    { field: 'leave_date', headerName: 'Leave Date', width: 150 },
    { field: 'remarks', headerName: 'Remarks', width: 200 },
    { field: 'add_date', headerName: 'Added On', width: 150 },
    { field: 'employee', headerName: 'Employee ID', width: 150 },
    { field: 'employeeName', headerName: 'Full Name', width: 200 },
    { field: 'leave_type_name', headerName: 'Leave Type', width: 200 },
    {
      field: 'actions',
      headerName: 'Status',
      width: 150,
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
            <Typography>{params.row.status}</Typography>
          )}
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }} fontWeight="bold">
        LEAVE MANAGEMENT
      </Typography>

      <FormControl sx={{ mb: 2 }} fullWidth>
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

      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={filteredRequests}
          columns={columns}
          pageSize={5}
          disableRowSelectionOnClick
          getRowId={(row) => row.leave_refno}
        />
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {currentRequest?.action} this leave request?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmAction} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
