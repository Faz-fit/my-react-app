// src/pages/admin/AdminDashboard.js
import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
  Button,
  useTheme,

} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import ManagerIcon from '@mui/icons-material/SupervisorAccount';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const totalEmployees = 120;
  const totalOutlets = 5;
  const totalManagers = 10;
  const todaysAttendance = 95;
  const todaysAbsentees = totalEmployees - todaysAttendance;
  const pendingLeaveRequests = 15;

  const outletAttendance = [
    { outlet: 'Outlet 1', total: 30, present: 25, absent: 5 },
    { outlet: 'Outlet 2', total: 25, present: 22, absent: 3 },
    { outlet: 'Outlet 3', total: 20, present: 18, absent: 2 },
    { outlet: 'Outlet 4', total: 25, present: 20, absent: 5 },
    { outlet: 'Outlet 5', total: 20, present: 10, absent: 10 },
  ];

  const pendingLeaves = [
    { id: 1, name: 'John Doe', outlet: 'Outlet 1', dates: '2025-05-21 to 2025-05-23', status: 'Pending' },
    { id: 2, name: 'Jane Smith', outlet: 'Outlet 3', dates: '2025-05-25 to 2025-05-27', status: 'Pending' },
    { id: 3, name: 'Bob Johnson', outlet: 'Outlet 2', dates: '2025-05-22 to 2025-05-24', status: 'Pending' },
  ];

  const getAttendancePercent = (present, total) => Math.round((present / total) * 100);
   useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ padding: 1, maxWidth: 1200, margin: 'auto', fontFamily: 'Roboto, sans-serif' }}>
      {/* Title */}
      <Typography
        variant="h3"
        align="left"
        fontWeight="bold"
        sx={{ letterSpacing: 1, color: 'text.primary' }}
      >
        Dashboard
      </Typography>

      <Typography variant="h5" sx={{ color: 'text.primary' }} align="right" fontWeight="bold">
        {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
      </Typography>
      {/* Summary Cards */}
      <Grid container spacing={3} justifyContent="center" sx={{ marginBottom: 5 }}>
        {[
          { label: 'Total Employees', value: totalEmployees, icon: <PeopleIcon color="primary" sx={{ fontSize: 40 }} /> },
          { label: 'Total Outlets', value: totalOutlets, icon: <StoreIcon color="primary" sx={{ fontSize: 40 }} /> },
          { label: 'Total Managers', value: totalManagers, icon: <ManagerIcon color="primary" sx={{ fontSize: 40 }} /> },
          { label: "Today's Attendance", value: todaysAttendance, icon: <EventAvailableIcon color="primary" sx={{ fontSize: 40 }} /> },
          { label: "Today's Absentees", value: todaysAbsentees, icon: <EventBusyIcon color="error" sx={{ fontSize: 40 }} /> },
          { label: 'Pending Leave Requests', value: pendingLeaveRequests, icon: <HourglassEmptyIcon color="warning" sx={{ fontSize: 40 }} /> },
        ].map((item, i) => (
          <Grid item xs={6} sm={4} md={2} key={i} sx={{ minHeight: 140, display: 'flex', justifyContent: 'center' }}>
            <Paper
              elevation={6}
              sx={{
                padding: 3,
                borderRadius: 3,
                width: '100%',
                maxWidth: 180,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backgroundColor: theme.palette.background.paper,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': { transform: 'translateY(-6px)', boxShadow: theme.shadows[8] },
              }}
            >
              {item.icon}
              <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5, fontWeight: 600, color: theme.palette.text.secondary }}>
                {item.label}
              </Typography>
              <Typography variant="h3" color={item.label.includes('Absent') ? 'error' : 'primary'} sx={{ fontWeight: 700, letterSpacing: 1 }}>
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tables side by side */}
      <Grid container spacing={3} justifyContent="center">
        {/* Outlet-wise Attendance */}
<Box
  sx={{
    display: 'flex',
    gap: 3,
    justifyContent: 'center',
    alignItems: 'stretch',
    flexWrap: 'nowrap',
    marginTop: 4,
  }}
>
  {/* Outlet-wise Attendance - Slightly Wider */}
  <Paper
    elevation={6}
    sx={{
      flex: 1.1,
      padding: 4,
      borderRadius: 3,
      height: '520px',
      backgroundColor: theme.palette.background.paper,
      overflow: 'auto',
    }}
  >
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
      Outlet-wise Attendance
    </Typography>
    <TableContainer>
      <Table size="medium" stickyHeader aria-label="outlet attendance table">
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Outlet</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Total Employees</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Present</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Absent</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: 130 }}>Attendance %</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {outletAttendance.map(({ outlet, total, present, absent }, i) => (
            <TableRow key={i} hover>
              <TableCell>{outlet}</TableCell>
              <TableCell>{total}</TableCell>
              <TableCell>{present}</TableCell>
              <TableCell>{absent}</TableCell>
              <TableCell sx={{ width: 130 }}>
                <LinearProgress
                  variant="determinate"
                  value={getAttendancePercent(present, total)}
                  color={present / total > 0.9 ? 'primary' : 'warning'}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: theme.palette.grey[300],
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 6,
                      background: `linear-gradient(90deg, ${
                        present / total > 0.9 ? '#1976d2' : '#fbc02d'
                      }, ${present / total > 0.9 ? '#64b5f6' : '#fdd835'})`,
                    },
                  }}
                />
                <Typography variant="caption" align="center" display="block" sx={{ mt: 1, fontWeight: 600 }}>
                  {getAttendancePercent(present, total)}%
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>

  {/* Pending Leave Requests */}
 <Paper
    elevation={6}
    sx={{
      flex: 1.5,
      padding: 4,
      borderRadius: 3,
      height: '520px',
      backgroundColor: theme.palette.background.paper,
      overflow: 'auto',
    }}
  >
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
      Pending Leave Requests
    </Typography>
    {/* ... leave table stays the same */}
    <TableContainer>
      <Table size="medium" aria-label="pending leave requests">
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Employee Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Outlet</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Dates</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingLeaves.map(({ id, name, outlet, dates, status }) => (
            <TableRow key={id} hover>
              <TableCell>{name}</TableCell>
              <TableCell>{outlet}</TableCell>
              <TableCell>{dates}</TableCell>
              <TableCell>{status}</TableCell>
              <TableCell align="center" sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" color="success" size="medium" sx={{ minWidth: 100 }}>
                  Approve
                </Button>
                <Button variant="contained" color="error" size="medium" sx={{ minWidth: 100 }}>
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {pendingLeaves.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No pending leave requests
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
</Box>

        {/* Pending Leave Requests */}

      </Grid>
    </Box>
  );
};

export default AdminDashboard;
