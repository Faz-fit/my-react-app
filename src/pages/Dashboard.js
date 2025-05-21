// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
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
  Button,
  useTheme,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';

const Dashboard = () => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Static data
  const totalEmployees = 120;
  const todaysAttendance = 95;
  const todaysAbsentees = totalEmployees - todaysAttendance;

  // Dummy pending leaves
  const pendingLeaves = [
    { id: 1, name: 'John Doe', outlet: 'Outlet 1', dates: '2025-05-21 to 2025-05-23', status: 'Pending' },
    { id: 2, name: 'Jane Smith', outlet: 'Outlet 3', dates: '2025-05-25 to 2025-05-27', status: 'Pending' },
    { id: 3, name: 'Bob Johnson', outlet: 'Outlet 2', dates: '2025-05-22 to 2025-05-24', status: 'Pending' },
  ];

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ padding: 2, maxWidth: 1400, margin: 'auto', fontFamily: 'Roboto, sans-serif' }}>
      {/* Header with title and live time */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3" fontWeight="bold" sx={{ color: 'text.primary' }}>
          Dashboard
        </Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary' }}>
          {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
        </Typography>
      </Box>

      {/* Main Layout: Left summary cards, Right pending leaves table */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        {/* Left side cards with stats */}
        <Box sx={{ flex: 1, minWidth: 0 }}>



          <Grid container spacing={2}>
            {[
              { label: 'Total Employees', value: totalEmployees, icon: <PeopleIcon color="primary" sx={{ fontSize: 40 }} /> },
              { label: "Today's Attendance", value: todaysAttendance, icon: <EventAvailableIcon color="primary" sx={{ fontSize: 40 }} /> },
              { label: "Today's Absentees", value: todaysAbsentees, icon: <EventBusyIcon color="error" sx={{ fontSize: 40 }} /> },
            ].map((item, i) => (
              <Grid item  md={6}>

                <Paper
                  elevation={12}
                  sx={{
                    padding: 3,
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    height: '100%',
                    gap:1,
                  }}
                >
                  {item.icon}
                  <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5, fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h3"
                    color={item.label.includes('Absent') ? 'error' : 'primary'}
                    sx={{ fontWeight: 700 }}
                  >
                    {item.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Right side: Pending Leave Requests Table */}
        <Box sx={{ flex: 1 }}>
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              height: '100%',
              overflowY: 'auto',       // vertical scroll only
              overflowX: 'hidden',     // hide horizontal scroll
              paddingRight: '15px',    // add right padding for scrollbar space
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              Pending Leave Requests
            </Typography>
            <TableContainer>
              <Table size="medium" aria-label="pending leave requests" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Outlet</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Dates</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
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
      </Box>
    </Box>
  );
};

export default Dashboard;
