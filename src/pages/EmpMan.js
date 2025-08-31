import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
} from '@mui/material';
import api from 'utils/api';

const initialEmployees = [];

export default function EmployeeCards() {
  const [employees, setEmployees] = useState(initialEmployees);

  const fetchEmployees = async () => {
    try {
      const outletId = localStorage.getItem('outlet');
      if (!outletId) {
        console.error('Outlet ID not found in localStorage');
        return;
      }

      const [employeesRes, outletsRes] = await Promise.all([
        api.get('/api/getoutletemployees', { params: { outlet_id: outletId } }),
        api.get('/api/outlets/'),
      ]);

      const outletsMap = outletsRes.data.reduce((acc, outlet) => {
        acc[outlet.id] = outlet.name;
        return acc;
      }, {});

      const updatedEmployees = employeesRes.data.map((employee) => {
        const outletNames = employee.outlets?.map((id) => outletsMap[id]) || ['Unknown'];
        return {
          ...employee,
          outlets: outletNames.join(', '),
          group: employee.groups.join(', '),
        };
      });

      setEmployees(updatedEmployees);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <Box sx={{ width: '90%', mx: 'auto', mt: 5 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        EMPLOYEES MAN
      </Typography>

      <Grid container spacing={3} justifyContent="flex-start">
        {employees.map((employee) => (
          <Grid item key={employee.employee_id}>
            <Card
              sx={{
                width: 345,
                height: 400,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {typeof employee.profile_photo === 'string' ? (
                <CardMedia
                  component="img"
                  height="140"
                  image={employee.profile_photo}
                  alt={`${employee.fullname}'s photo`}
                  sx={{ objectFit: 'cover' }}
                />
              ) : null}
              <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  {employee.first_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>User Name:</strong> {employee.fullname}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Status:</strong> {employee.is_active ? 'Active' : 'Inactive'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>NIC NO:</strong> {employee.idnumber}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Phone:</strong> {employee.phone_number}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Outlets:</strong> {employee.outlets}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Groups:</strong> {employee.group}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
