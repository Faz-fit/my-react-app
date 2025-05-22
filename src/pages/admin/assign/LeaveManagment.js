import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const initialLeaveRequests = [
  { id: 1, employeeName: 'John Doe', leaveType: 'Sick Leave', startDate: '2025-05-10', endDate: '2025-05-12', status: 'Pending' },
  { id: 2, employeeName: 'Jane Smith', leaveType: 'Vacation', startDate: '2025-05-15', endDate: '2025-05-20', status: 'Pending' },
  { id: 3, employeeName: 'Alice Johnson', leaveType: 'Personal Leave', startDate: '2025-05-18', endDate: '2025-05-19', status: 'Pending' },
  { id: 4, employeeName: 'Michael Brown', leaveType: 'Maternity Leave', startDate: '2025-05-25', endDate: '2025-06-25', status: 'Pending' },
  { id: 5, employeeName: 'Linda Carter', leaveType: 'Vacation', startDate: '2025-04-01', endDate: '2025-04-07', status: 'Approved' },
  { id: 6, employeeName: 'James Wilson', leaveType: 'Sick Leave', startDate: '2025-03-14', endDate: '2025-03-16', status: 'Approved' },
  { id: 7, employeeName: 'Sophia Turner', leaveType: 'Emergency Leave', startDate: '2025-04-10', endDate: '2025-04-12', status: 'Rejected' },
  { id: 8, employeeName: 'William Scott', leaveType: 'Personal Leave', startDate: '2025-04-20', endDate: '2025-04-21', status: 'Rejected' },
];

export default function LeaveApproval() {
  const [requests, setRequests] = useState(initialLeaveRequests);
  const [search, setSearch] = useState('');

  const handleApprove = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: 'Approved' } : req
      )
    );
  };

  const handleReject = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: 'Rejected' } : req
      )
    );
  };

  const filterRequests = (statusList) =>
    requests.filter(
      (req) =>
        statusList.includes(req.status) &&
        (req.employeeName.toLowerCase().includes(search.toLowerCase()) ||
         req.leaveType.toLowerCase().includes(search.toLowerCase()))
    );

  const commonColumns = [
    { field: 'employeeName', headerName: 'Employee Name', flex: 1 },
    { field: 'leaveType', headerName: 'Leave Type', flex: 1 },
    { field: 'startDate', headerName: 'Start Date', flex: 1 },
    { field: 'endDate', headerName: 'End Date', flex: 1 },
  ];

  const pendingColumns = [
    ...commonColumns,
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<CheckCircleIcon color="success" />}
          label="Approve"
          onClick={() => handleApprove(params.id)}
        />,
        <GridActionsCellItem
          icon={<CancelIcon color="error" />}
          label="Reject"
          onClick={() => handleReject(params.id)}
        />,
      ],
    },
  ];

  const historyColumns = [
    ...commonColumns,
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Typography
          color={params.value === 'Approved' ? 'green' : 'red'}
          fontWeight="bold"
        >
          {params.value}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Leave Management
      </Typography>

      <TextField
        variant="outlined"
        fullWidth
        label="Search by Employee or Leave Type"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 4 }}
      />

      <Typography variant="h5" sx={{ mb: 2 }}>
        Pending Leave Requests
      </Typography>
      <Box sx={{ height: 400, mb: 5 }}>
        <DataGrid
          rows={filterRequests(['Pending'])}
          columns={pendingColumns}
          pageSize={5}
          disableRowSelectionOnClick
        />
      </Box>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Leave History
      </Typography>
      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={filterRequests(['Approved', 'Rejected'])}
          columns={historyColumns}
          pageSize={5}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}
