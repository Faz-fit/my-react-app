import React, { useState } from 'react';
import { Card, CardContent, Grid, Typography, TextField, Box } from '@mui/material';

// Sample employee data
const employees = [
  {
    id: 1,
    name: 'John Doe',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    employeeId: 'E001',
    contact: '123-456-7890',
    designation: 'Software Engineer',
  },
  {
    id: 2,
    name: 'Jane Smith',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    employeeId: 'E002',
    contact: '987-654-3210',
    designation: 'Project Manager',
  },
  {
    id: 3,
    name: 'Alice Johnson',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    employeeId: 'E003',
    contact: '555-123-4567',
    designation: 'UX Designer',
  },
  // Add more employees as needed
];

function Employees() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter employees based on the search term
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Employees</Typography>

      {/* Search Bar */}
      <TextField
        variant="outlined"
        fullWidth
        label="Search Employees"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Employee Cards */}
      <Grid container spacing={3}>
        {filteredEmployees.map((employee) => (
          <Grid item xs={12} sm={6} md={4} key={employee.id}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item>
                    <img
                      src={employee.image}
                      alt={employee.name}
                      style={{ width: 60, height: 60, borderRadius: '50%' }}
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">{employee.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      ID: {employee.employeeId}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Contact: {employee.contact}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Designation: {employee.designation}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Employees;
