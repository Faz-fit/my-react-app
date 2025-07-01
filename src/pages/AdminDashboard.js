import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid'; // Import the DataGrid component
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
  const [outlets, setOutlets] = useState([]);
  const [managers, setManagers] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [todaysAttendance] = useState(95);
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState(0);



  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees and outlets
        const employeesRes = await api.get('/api/getemployees');
        setEmployees(employeesRes.data);

        const outletsRes = await api.get('/api/outlets/');
        setOutlets(outletsRes.data);

        // Calculate the number of managers based on the 'groups' field
        const managersList = employeesRes.data.filter(employee =>
          employee.groups.includes("Manager")
        );
        setManagers(managersList);

        // Fetch leave requests from API
        const leaveRequestsRes = await api.get('http://139.59.243.2:8000/api/attendance/allleaverequests');
        setLeaveRequests(leaveRequestsRes.data);

        // Count pending leave requests
        const pendingRequests = leaveRequestsRes.data.filter(request => request.status === 'pending').length;
        setPendingLeaveRequests(pendingRequests);

      } catch (error) {
        console.error('Failed to fetch data:', error);
        alert('Error fetching employees, outlets, or leave requests');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalEmployees = employees.length;
  const totalOutlets = outlets.length;
  const totalManagers = managers.length;

  // Count employees per outlet by checking their outlet array
  const outletEmployeeCount = outlets.map((outlet) => {
    const employeesForOutlet = employees.filter((emp) =>
      emp.outlets.includes(outlet.id) // Check if outlet.id exists in the employee's outlets array
    );

    // Count present and absent employees
    const present = employeesForOutlet.filter(emp => emp.attendance === 'Present').length;
    const absent = employeesForOutlet.length - present;

    return {
      id: outlet.id,  // Use outlet.id as the unique identifier for DataGrid
      outlet: outlet.name || 'Unnamed Outlet',
      total: employeesForOutlet.length,
      present: present,
      absent: absent,
    };
  });

  // Columns for Outlet-wise Employee DataGrid
  const outletColumns = [
    { field: 'outlet', headerName: 'Outlet', width: 200 },
    { field: 'total', headerName: 'Total Employees', width: 180 },
    { field: 'present', headerName: 'Present', width: 180 },
    { field: 'absent', headerName: 'Absent', width: 180 },
    { field: 'attendancePercentage', headerName: 'Attendance %', width: 180 },
  ];

  // Columns for Leave Requests DataGrid
  const leaveColumns = [
    { field: 'leave_refno', headerName: 'Leave Ref No', width: 150 },
    { field: 'employee', headerName: 'Employee ID', width: 150 },
    { field: 'leave_date', headerName: 'Leave Date', width: 180 },
    { field: 'leave_type_name', headerName: 'Leave Type', width: 180 },
    { field: 'remarks', headerName: 'Remarks', width: 250 },
    { field: 'add_date', headerName: 'Added On', width: 180 },
  ];

  return (
    <Box sx={{ padding: 3, maxWidth: 1200, margin: 'auto' }}>
      <Typography
        variant="h3"
        align="left"
        fontWeight="bold"
        sx={{ letterSpacing: 1, color: 'text.primary', mb: 3 }}
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

      {/* Outlet-wise Employees DataGrid */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        Outlet-wise Employees
      </Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={outletEmployeeCount}
          columns={outletColumns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(row) => row.id}  // Ensure each row has a unique 'id'
        />
      </div>

      {/* Leave Requests DataGrid */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, mt: 4 }}>
        Leave Requests
      </Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={leaveRequests}
          columns={leaveColumns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(row) => row.leave_refno}  // Use leave_refno as unique 'id'
        />
      </div>
    </Box>
  );
};

export default AdminDashboard;
