import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Tooltip, Typography
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import api from 'utils/api';

// Validation schema
const schema = yup.object({
  fullname: yup.string().required('Full name is required'),
  email: yup.string().email().required('Email is required'),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  phone_number: yup.string(),
  date_of_birth: yup.string().required('Date of birth is required'),
  password: yup.string().required('Password is required'),
  agency: yup.string().required('Agency is required'),
  group: yup.string().required('Group is required'),
});

const initialEmployees = [];

export default function EmployeeGrid() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [openDialog, setOpenDialog] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [groups, setGroups] = useState([]);

  const {
    control, handleSubmit, reset, formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullname: '',
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      date_of_birth: '',
      agency: '',
      group: '',
      password: '',
    },
  });

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/getemployees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchEmployees();
        const [agenciesRes, groupsRes] = await Promise.all([
          api.get('/api/outlets/'),
          api.get('/api/groups/')
        ]);
        setAgencies(agenciesRes.data);
        setGroups(groupsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        alert('Error fetching employees, agencies, or groups');
      }
    };
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    reset();
    setProfilePhoto(null);
    setEditEmployee(null);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditEmployee(null);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    if (profilePhoto) {
      formData.append('profile_photo', profilePhoto);
    }

    try {
      await api.post('/api/employees/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchEmployees(); // Always re-fetch to ensure data consistency
      handleClose(); // Close the form
    } catch (err) {
      console.error(err);
      alert('Error creating employee');
    }
  };

  const columns = [
    { field: 'fullname', headerName: 'User Name', flex: 1 },
    { field: 'first_name', headerName: 'Name', flex: 1 },
    { field: 'phone_number', headerName: 'Phone', flex: 1 },
    { field: 'date_of_birth', headerName: 'DOB', flex: 1 },
    { field: 'agency', headerName: 'Outlets', flex: 1 },
    { field: 'group', headerName: 'Role', flex: 1 },
    /*{
      field: 'profile_photo',
      headerName: 'Photo',
      width: 100,
      renderCell: (params) =>
        typeof params.value === 'string' ? (
          <img src={params.value} alt="Profile" width={40} height={40} style={{ borderRadius: '50%' }} />
        ) : (
          'No Photo'
        ),
    },*/
   
  ];

  return (
    <Box sx={{ height: 600, width: '90%', mx: 'auto', mt: 5 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>Employees</Typography>

      <DataGrid
        rows={employees}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.employee_id}
      />

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[['fullname', 'User Name'],
              ['email', 'Email'],
              ['first_name', 'First Name'],
              ['last_name', 'Last Name'],
              ['phone_number', 'Phone Number'],
              ['date_of_birth', 'Date of Birth', 'date'],
              ['password', 'Password', 'password']].map(([name, label, type = 'text']) => (
                <Controller
                  key={name}
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label={label}
                      type={type}
                      fullWidth
                      error={!!errors[name]}
                      helperText={errors[name]?.message}
                      {...field}
                    />
                  )}
                />
              ))}

            <Controller
              name="agency"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Outlets"
                  fullWidth
                  error={!!errors.agency}
                  helperText={errors.agency?.message}
                  {...field}
                >
                  {agencies.map((agency) => (
                    <MenuItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="group"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Role"
                  fullWidth
                  error={!!errors.group}
                  helperText={errors.group?.message}
                  {...field}
                >
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files[0])}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editEmployee ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
