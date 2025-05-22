import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, LinearProgress,useTheme,TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import ManagerIcon from '@mui/icons-material/SupervisorAccount';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import api from 'utils/api';

const AdminDashboard = () => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [groups, setGroups] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [managers, setManagers] = useState([]);
  
  const [todaysAttendance] = useState(95); // Hardcoded as 95 for now
  const [pendingLeaveRequests] = useState(15); // Hardcoded for now

  const getAttendancePercent = (present, total) => Math.round((present / total) * 100);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, agenciesRes, groupsRes, outletsRes] = await Promise.all([
          api.get('/api/getemployees'),
          api.get('/api/getagencies/'),
          api.get('/api/groups/'),
          api.get('/api/outlets/')
        ]);

        setEmployees(employeesRes.data);
        setAgencies(agenciesRes.data);
        setGroups(groupsRes.data);
        setOutlets(outletsRes.data);

        // Get the managers count by group
        const managersRes = await api.get('/api/groups/managers');
        setManagers(managersRes.data);

        // Update Attendance and Pending Leave Requests (You can set them from your API if available)
        // For now, hardcoded values are used, but you can update them with actual data if needed.
      } catch (error) {
        console.error('Failed to fetch data:', error);
        alert('Error fetching employees, agencies, groups, or outlets');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic counts
  const totalEmployees = employees.length;
  const totalOutlets = outlets.length;
  const totalManagers = managers.length;

  const outletAttendance = outlets.map(outlet => ({
    outlet: outlet.name, // Assuming outlet has a 'name' field
    total: outlet.totalEmployees, // Assuming outlet has a 'totalEmployees' field
    present: outlet.present, // Assuming outlet has a 'present' field
    absent: outlet.absent, // Assuming outlet has a 'absent' field
  }));

  return (
    <Box sx={{ padding: 1, maxWidth: 1200, margin: 'auto', fontFamily: 'Roboto, sans-serif' }}>
      <Typography variant="h3" align="left" fontWeight="bold" sx={{ letterSpacing: 1, color: 'text.primary' }}>
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
          { label: "Today's Absentees", value: totalEmployees - todaysAttendance, icon: <EventBusyIcon color="error" sx={{ fontSize: 40 }} /> },
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

      {/* Tables for Outlet-wise Attendance and Pending Leave Requests */}
      <Grid container spacing={3} justifyContent="center">
        {/* Outlet-wise Attendance */}
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'stretch', flexWrap: 'nowrap', marginTop: 4 }}>
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
            {/* Leave requests table logic remains the same */}
          </Paper>
        </Box>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
