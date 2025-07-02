import React, { useState, useEffect, useCallback } from 'react';
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
  useTheme,
  CircularProgress,  // Importing CircularProgress for the loading indicator
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import api from 'utils/api';

const Dashboard = () => {
  const theme = useTheme();

  // Data states
  const [employees, setEmployees] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(false);  // Loading state

  // Current logged-in employee and outlet info
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [currentOutletName, setCurrentOutletName] = useState('');
  const [loggedInUserData, setLoggedInUserData] = useState(null);

  // Fetch pending leave requests, memoized to prevent unnecessary re-renders
  const fetchLeavebyoutlet = useCallback(async () => {
    setIsLoading(true); // Start loading
    const outletId = localStorage.getItem('outlet');
    console.log('Fetching leaves for outletId:', outletId); // Log outlet ID for debugging

    try {
      const res = await api.get('api/attendance/outletleaverequests/', {
        params: { outlet_id: outletId },
      });
      console.log('Fetched pending leave requests:', res.data); // Log the fetched data
      setPendingLeaves(res.data);
    } catch (error) {
      console.error('Failed to fetch pending leave requests:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  }, []);

  // Fetch data for employees, outlets, and user on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, outletsRes] = await Promise.all([
          api.get('/api/getemployees'),
          api.get('/api/outlets/'),
        ]);
        setEmployees(employeesRes.data);
        setOutlets(outletsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);  // Empty dependency array, runs only once when the component mounts

  // Fetch logged-in user data (to get outlets array)
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      if (!sessionStorage.getItem('hasRequestedUserData')) {
        try {
          const res = await api.get(`/api/user/`);
          setLoggedInUserData(res.data);
          sessionStorage.setItem('hasRequestedUserData', 'true'); // Set the flag to prevent repeated requests
        } catch (error) {
          console.error('Failed to fetch logged-in user data:', error);
        }
      }
    };
    fetchLoggedInUser();
  }, []);  // Runs only once on component mount

  // Find current employee from employees list
  useEffect(() => {
    if (employees.length > 0 && loggedInUserData) {
      const emp = employees.find((e) => e.user === loggedInUserData.user);
      setCurrentEmployee(emp || null);
    }
  }, [employees, loggedInUserData]);  // Runs when employees or loggedInUserData change

  // Determine outlet name and fetch pending leaves
  useEffect(() => {
    if (loggedInUserData?.outlets?.length > 0) {
      setCurrentOutletName(loggedInUserData.outlets[0].name);
    } else if (currentEmployee && outlets.length > 0) {
      const outlet = outlets.find((o) => o.id === Number(currentEmployee.outlet));
      setCurrentOutletName(outlet ? outlet.name : '');
    }

    // Fetch pending leave requests if outlet and employee are ready
    if (currentEmployee && outlets.length > 0) {
      fetchLeavebyoutlet();
    }
  }, [loggedInUserData, currentEmployee, outlets, fetchLeavebyoutlet]);  // Correctly handle dependencies

  // Prevent multiple requests using sessionStorage (only fetch once per session)
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('hasRequestedUserData');
    };
  }, []);  // Cleanup sessionStorage flag when component unmounts

  // Calculate employees in current outlet
  const employeesInOutlet = currentEmployee
    ? employees.filter((e) => String(e.outlet) === String(currentEmployee.outlet))
    : [];

  const totalEmployees = employeesInOutlet.length;
  const todaysAttendance = 95; // For demo, replace with actual logic
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
          gap: 1,
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
                    height: '80%',
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
              height: '80%',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: '15px',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              Pending Leave Requests
            </Typography>

            {/* Show loading spinner if data is being fetched */}
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 200 }}>
                <Table size="medium" aria-label="pending leave requests" sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Employee Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Dates</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingLeaves.map(({ id, employee_name, leave_date, status }) => (
                      <TableRow key={id} hover>
                        <TableCell>{employee_name}</TableCell>
                        <TableCell>{leave_date}</TableCell>
                        <TableCell>{status}</TableCell>
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
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
//FINAL TEXT