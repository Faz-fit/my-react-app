// src/pages/admin/AdminDashboard.js
import React from 'react';
import { Box, Typography, Grid, Paper, List, ListItem, ListItemText } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const AdminDashboard = () => {
  // Dummy Data (replace with API data)
  const totalEmployees = 120;
  const totalOutlets = 5;
  const totalManagers = 10;
  const todaysAttendance = 95;
  const todaysAbsentees = totalEmployees - todaysAttendance;
  const pendingLeaveRequests = 15;

  // Work Shift Data for Pie Chart
  const workShiftData = [
    { name: 'Morning', value: 60 },
    { name: 'Afternoon', value: 40 },
    { name: 'Night', value: 20 },
  ];

  // Employee Designation Data (replace with actual data from backend)
  const designationData = [
    { name: 'Manager', present: 8, absent: 2 },
    { name: 'Staff', present: 50, absent: 10 },
    { name: 'HR', present: 5, absent: 1 },
    { name: 'Developer', present: 20, absent: 5 },
    { name: 'Sales', present: 15, absent: 3 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {[
          { label: 'Total Employees', value: totalEmployees },
          { label: 'Total Outlets', value: totalOutlets },
          { label: 'Total Managers', value: totalManagers },
          { label: "Today's Attendance", value: todaysAttendance },
          { label: "Today's Absentees", value: todaysAbsentees },
          { label: 'Pending Leave Requests', value: pendingLeaveRequests },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
              <Typography variant="h6">{item.label}</Typography>
              <Typography variant="h4" color="primary">{item.value}</Typography>
            </Paper>
          </Grid>
        ))}

        {/* Work Shift Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Work Shift Distribution
            </Typography>
            <PieChart width={300} height={300}>
              <Pie
                data={workShiftData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {workShiftData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>

        {/* Employee Designation List with Present and Absent Counts */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Employee Designations and Attendance Status
            </Typography>
            <List>
              {designationData.map((designation, i) => (
                <ListItem key={i}>
                  <ListItemText
                    primary={designation.name}
                    secondary={`Present: ${designation.present} | Absent: ${designation.absent}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
