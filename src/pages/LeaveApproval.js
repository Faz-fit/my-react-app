import React, { useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, TextField } from '@mui/material';

const leaveRequests = [
  // Pending
  {
    id: 1,
    employeeName: 'John Doe',
    leaveType: 'Sick Leave',
    startDate: '2025-05-10',
    endDate: '2025-05-12',
    status: 'Pending',
  },
  {
    id: 2,
    employeeName: 'Jane Smith',
    leaveType: 'Vacation',
    startDate: '2025-05-15',
    endDate: '2025-05-20',
    status: 'Pending',
  },
  {
    id: 3,
    employeeName: 'Alice Johnson',
    leaveType: 'Personal Leave',
    startDate: '2025-05-18',
    endDate: '2025-05-19',
    status: 'Pending',
  },
  {
    id: 4,
    employeeName: 'Michael Brown',
    leaveType: 'Maternity Leave',
    startDate: '2025-05-25',
    endDate: '2025-06-25',
    status: 'Pending',
  },

  // Approved
  {
    id: 5,
    employeeName: 'Linda Carter',
    leaveType: 'Vacation',
    startDate: '2025-04-01',
    endDate: '2025-04-07',
    status: 'Approved',
  },
  {
    id: 6,
    employeeName: 'James Wilson',
    leaveType: 'Sick Leave',
    startDate: '2025-03-14',
    endDate: '2025-03-16',
    status: 'Approved',
  },

  // Rejected
  {
    id: 7,
    employeeName: 'Sophia Turner',
    leaveType: 'Emergency Leave',
    startDate: '2025-04-10',
    endDate: '2025-04-12',
    status: 'Rejected',
  },
  {
    id: 8,
    employeeName: 'William Scott',
    leaveType: 'Personal Leave',
    startDate: '2025-04-20',
    endDate: '2025-04-21',
    status: 'Rejected',
  },
];

function LeaveApproval() {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState(leaveRequests);

  const filteredPending = requests.filter(
    (req) =>
      req.status === 'Pending' &&
      (req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.leaveType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredHistory = requests.filter(
    (req) =>
      (req.status === 'Approved' || req.status === 'Rejected') &&
      (req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.leaveType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const approveLeave = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: 'Approved' } : req
      )
    );
  };

  const rejectLeave = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: 'Rejected' } : req
      )
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Leave Management
      </Typography>

      <TextField
        variant="outlined"
        fullWidth
        label="Search by Employee Name or Leave Type"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />

      {/* Pending Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Pending Leave Requests
      </Typography>
      <Grid container spacing={3}>
        {filteredPending.length > 0 ? (
          filteredPending.map((req) => (
            <Grid item xs={12} sm={6} md={4} key={req.id}>
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6">{req.employeeName}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Leave Type: {req.leaveType}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Dates: {req.startDate} - {req.endDate}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {req.status}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => approveLeave(req.id)}
                      sx={{ mr: 2 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => rejectLeave(req.id)}
                    >
                      Reject
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography sx={{ ml: 2 }}>No pending requests found.</Typography>
        )}
      </Grid>

      {/* History Section */}
      <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>
        Leave History
      </Typography>
      <Grid container spacing={3}>
        {filteredHistory.length > 0 ? (
          filteredHistory.map((req) => (
            <Grid item xs={12} sm={6} md={4} key={req.id}>
              <Card
                sx={{
                  boxShadow: 2,
                  borderRadius: 2,
                  backgroundColor: '#f9f9f9',
                }}
              >
                <CardContent>
                  <Typography variant="h6">{req.employeeName}</Typography>
                  <Typography variant="body2">
                    Leave Type: {req.leaveType}
                  </Typography>
                  <Typography variant="body2">
                    Dates: {req.startDate} - {req.endDate}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Status:{' '}
                    <strong
                      style={{
                        color: req.status === 'Approved' ? 'green' : 'red',
                      }}
                    >
                      {req.status}
                    </strong>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography sx={{ ml: 2 }}>No history found.</Typography>
        )}
      </Grid>
    </Box>
  );
}

export default LeaveApproval;
