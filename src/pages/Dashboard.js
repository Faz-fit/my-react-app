import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Stack, List, ListItem, ListItemText } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Dashboard() {
  // Sample data (replace with real logic/data)
  const totalEmployees = 100;
  const todaysPresent = 88;
  const todaysAbsent = 12;

  const attendanceTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Present',
        data: [80, 85, 78, 90, 87, 70, 75],
        borderColor: '#4caf50',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Absent',
        data: [20, 15, 22, 10, 13, 30, 25],
        borderColor: '#f44336',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Sample recent leave data (replace with actual API data)
  const recentLeaves = [
    { employee: 'John Doe', type: 'Sick Leave', date: '2025-05-04' },
    { employee: 'Jane Smith', type: 'Vacation', date: '2025-05-03' },
    { employee: 'Sam Wilson', type: 'Casual Leave', date: '2025-05-02' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e3f2fd', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="subtitle1">Total Employees</Typography>
              <Typography variant="h4">{totalEmployees}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e8f5e9', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="subtitle1">Today's Present</Typography>
              <Typography variant="h4" color="success.main">{todaysPresent}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#ffebee', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="subtitle1">Today's Absent</Typography>
              <Typography variant="h4" color="error.main">{todaysAbsent}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Access
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary">
                  Leave Approvals
                </Button>
                <Button variant="contained" color="secondary">
                  Reports
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Leave Requests */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Leave Requests
              </Typography>
              <List>
                {recentLeaves.map((leave, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${leave.employee} - ${leave.type}`}
                      secondary={`Date: ${leave.date}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Chart */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Weekly Attendance Overview
              </Typography>
              <Line data={attendanceTrendData} options={chartOptions} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
