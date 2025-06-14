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
import api from 'utils/api';

const Dashboard = () => {
  const theme = useTheme();

  // Data states
  const [employees, setEmployees] = useState([]);
  const [groups, setGroups] = useState([]);
  const [outlets, setOutlets] = useState([]);

  // Current logged-in employee and outlet info
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [currentOutletName, setCurrentOutletName] = useState('');
  const [loggedInUserData, setLoggedInUserData] = useState(null);

  const loggedInUserId = 12; // replace with your actual logged-in user id

  // Dummy pending leaves
  const pendingLeaves = [
    { id: 1, name: 'John Doe', outlet: 'Outlet 1', dates: '2025-05-21 to 2025-05-23', status: 'Pending' },
    { id: 2, name: 'Jane Smith', outlet: 'Outlet 3', dates: '2025-05-25 to 2025-05-27', status: 'Pending' },
    { id: 3, name: 'Bob Johnson', outlet: 'Outlet 2', dates: '2025-05-22 to 2025-05-24', status: 'Pending' },
  ];

  // Fetch employees, groups, outlets on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, groupsRes, outletsRes] = await Promise.all([
          api.get('/api/getemployees'),
          api.get('/api/groups/'),
          api.get('/api/outlets/'),
        ]);
        setEmployees(employeesRes.data);
        setGroups(groupsRes.data);
        setOutlets(outletsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        alert('Error fetching employees, groups, or outlets');
      }
    };
    fetchData();
  }, []);

  // Fetch logged-in user data (to get outlets array)
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const res = await api.get(`/api/users/${loggedInUserId}`); // adjust API endpoint as needed
        setLoggedInUserData(res.data);
      } catch (error) {
        console.error('Failed to fetch logged-in user data:', error);
      }
    };
    fetchLoggedInUser();
  }, [loggedInUserId]);

  // Find current employee from employees list
  useEffect(() => {
    if (employees.length > 0) {
      const emp = employees.find((e) => e.user === loggedInUserId);
      setCurrentEmployee(emp || null);
    }
  }, [employees, loggedInUserId]);

  // Determine outlet name:
  // Priority: loggedInUserData.outlets array first, fallback to currentEmployee.outlet id matching outlets list
  useEffect(() => {
    if (loggedInUserData?.outlets?.length > 0) {
      setCurrentOutletName(loggedInUserData.outlets[0].name);
    } else if (currentEmployee && outlets.length > 0) {
      const outlet = outlets.find((o) => o.id === Number(currentEmployee.outlet));
      setCurrentOutletName(outlet ? outlet.name : '');
    }
  }, [loggedInUserData, currentEmployee, outlets]);

  // Calculate employees in current outlet
  const employeesInOutlet = currentEmployee
    ? employees.filter((e) => String(e.outlet) === String(currentEmployee.outlet))
    : [];

  const totalEmployees = employeesInOutlet.length;

  // For demo, hardcoded todaysAttendance; replace with real logic if available
  const todaysAttendance = 95;
  const todaysAbsentees = totalEmployees - todaysAttendance;

  return (
    <Box sx={{ padding: 2, maxWidth: 1400, margin: 'auto', fontFamily: 'Roboto, sans-serif' }}>
      {/* Header with only outlet name */}
      <Box display="flex" justifyContent="flex-start" alignItems="center" mb={3}>
        <Typography variant="h3" fontWeight="bold" sx={{ color: 'text.primary' }}>
          {currentOutletName || 'Loading...'}
        </Typography>
      </Box>

      {/* Main Layout */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        {/* Left side cards */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Grid container spacing={2}>
            {[
              { label: 'Total Employees', value: totalEmployees, icon: <PeopleIcon color="primary" sx={{ fontSize: 40 }} /> },
              { label: "Today's Attendance", value: todaysAttendance, icon: <EventAvailableIcon color="primary" sx={{ fontSize: 40 }} /> },
              { label: "Today's Absentees", value: todaysAbsentees, icon: <EventBusyIcon color="error" sx={{ fontSize: 40 }} /> },
            ].map((item, i) => (
              <Grid item md={6} key={i}>
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
                    gap: 1,
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

        {/* Right side: Pending Leaves Table */}
        <Box sx={{ flex: 1 }}>
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: '15px',
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
