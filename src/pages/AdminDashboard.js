import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  useTheme,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';

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

  // Hardcoded for now; replace with real API data if available
  const [todaysAttendance] = useState(95);
  const [pendingLeaveRequests] = useState(15);

  const getAttendancePercent = (present, total) =>
    total > 0 ? Math.round((present / total) * 100) : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, agenciesRes, groupsRes, outletsRes] = await Promise.all([
          api.get('/api/getemployees'),
          api.get('/api/getagencies/'),
          api.get('/api/groups/'),
          api.get('/api/outlets/'),
        ]);

        setEmployees(employeesRes.data);
        setAgencies(agenciesRes.data);
        setGroups(groupsRes.data);
        setOutlets(outletsRes.data);

        const managersRes = await api.get('/api/groups/managers');
        setManagers(managersRes.data);
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

  const totalEmployees = employees.length;
  const totalAgencies = agencies.length;
  const totalGroups = groups.length;
  const totalOutlets = outlets.length;
  const totalManagers = managers.length;

  // Count employees per outlet by matching employee.outlet with outlet.id
  const outletAttendance = outlets.map((outlet) => {
    const employeesForOutlet = employees.filter(
      (emp) => String(emp.outlet) === String(outlet.id)
    );
    const totalEmployees = employeesForOutlet.length;

    return {
      outlet: outlet.name || 'Unnamed Outlet',
      total: totalEmployees,
      present: 0, // update if attendance info per employee available
      absent: 0,
    };
  });

  return (
    <Box
      sx={{
        padding: 1,
        maxWidth: 1200,
        margin: 'auto',
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      <Typography
        variant="h3"
        align="left"
        fontWeight="bold"
        sx={{ letterSpacing: 1, color: 'text.primary' }}
      >
        Dashboard
      </Typography>

      <Typography
        variant="h5"
        sx={{ color: 'text.primary' }}
        align="right"
        fontWeight="bold"
        gutterBottom
      >
        {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} justifyContent="center" sx={{ marginBottom: 5 }}>
        {[
          {
            label: 'Total Employees',
            value: totalEmployees,
            icon: <PeopleIcon color="primary" sx={{ fontSize: 40 }} />,
          },
          {
            label: 'Total Agencies',
            value: totalAgencies,
            icon: <StoreIcon color="primary" sx={{ fontSize: 40 }} />,
          },
          {
            label: 'Total Groups',
            value: totalGroups,
            icon: <ManagerIcon color="primary" sx={{ fontSize: 40 }} />,
          },
          {
            label: 'Total Outlets',
            value: totalOutlets,
            icon: <StoreIcon color="primary" sx={{ fontSize: 40 }} />,
          },
          {
            label: 'Total Managers',
            value: totalManagers,
            icon: <ManagerIcon color="primary" sx={{ fontSize: 40 }} />,
          },
          {
            label: "Today's Attendance",
            value: todaysAttendance,
            icon: <EventAvailableIcon color="primary" sx={{ fontSize: 40 }} />,
          },
          {
            label: "Today's Absentees",
            value: totalEmployees - todaysAttendance,
            icon: <EventBusyIcon color="error" sx={{ fontSize: 40 }} />,
          },
          {
            label: 'Pending Leave Requests',
            value: pendingLeaveRequests,
            icon: <HourglassEmptyIcon color="warning" sx={{ fontSize: 40 }} />,
          },
        ].map((item, i) => (
          <Grid
            item
            xs={6}
            sm={4}
            md={2}
            key={i}
            sx={{ minHeight: 140, display: 'flex', justifyContent: 'center' }}
          >
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
              <Typography
                variant="subtitle1"
                sx={{ mt: 1, mb: 0.5, fontWeight: 600, color: theme.palette.text.secondary }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="h3"
                color={item.label.includes('Absent') ? 'error' : 'primary'}
                sx={{ fontWeight: 700, letterSpacing: 1 }}
              >
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Outlet Attendance Table and Pending Leave Requests */}
      <Grid container spacing={3} justifyContent="center">
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
          {/* Outlet-wise Attendance */}
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
                        <Typography
                          variant="caption"
                          align="center"
                          display="block"
                          sx={{ mt: 1, fontWeight: 600 }}
                        >
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
            {/* Implement pending leave requests UI here */}
          </Paper>
        </Box>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
