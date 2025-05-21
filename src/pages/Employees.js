import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Box,
  Avatar,
  InputAdornment,
  IconButton,
  Fade,
  useTheme,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

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
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // Normalize search input
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredEmployees = employees.filter(({ name, employeeId, contact, designation }) => {
    return (
      name.toLowerCase().includes(normalizedSearch) ||
      employeeId.toLowerCase().includes(normalizedSearch) ||
      contact.toLowerCase().includes(normalizedSearch) ||
      designation.toLowerCase().includes(normalizedSearch)
    );
  });

  const handleClearSearch = () => setSearchTerm('');

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: theme.palette.primary.main }}>
        Employees
      </Typography>

      <TextField
        variant="outlined"
        fullWidth
        label="Search Employees"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name, ID, contact, or designation"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton onClick={handleClearSearch} edge="end" size="small" aria-label="clear search">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 4 }}
      />

      {filteredEmployees.length === 0 ? (
        <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
          No employees found matching &quot;{searchTerm}&quot;.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {filteredEmployees.map((employee) => (
            <Grid item xs={12} sm={6} md={4} key={employee.id}>
              <Fade in timeout={400}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: 6,
                    },
                  }}
                  tabIndex={0} // make focusable for accessibility
                  role="button"
                  aria-pressed="false"
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={employee.image}
                      alt={employee.name}
                      sx={{ width: 64, height: 64 }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {employee.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.3 }}>
                        <strong>ID:</strong> {employee.employeeId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.3 }}>
                        <strong>Contact:</strong> {employee.contact}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Designation:</strong> {employee.designation}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Employees;
