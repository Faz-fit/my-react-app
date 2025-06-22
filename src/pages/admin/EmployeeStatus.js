import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Tooltip, Typography
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useForm, Controller } from 'react-hook-form';
import api from 'utils/api';

const initialEmployees = [];

export default function EmployeeGrid() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [openDialog, setOpenDialog] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [groups, setGroups] = useState([]);
  const [passwordError, setPasswordError] = useState('')

  const fetchEmployees = async () => {
    try {
      const [employeesRes, outletsRes] = await Promise.all([
        api.get('/api/getemployees'),
        api.get('/api/outlets/')
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
          group: employee.groups.join(', ')
        };
      });

      setEmployees(updatedEmployees);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchEmployees();
        const [outletRes, groupsRes] = await Promise.all([
          api.get('/api/outlets/'),
          api.get('/api/groups/'),
        ]);
        setOutlets(outletRes.data);
        setGroups(groupsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        alert('Error fetching employees, outlets, or groups');
      }
    };
    fetchData();
  }, []);

const handleOpenAdd = () => {
  reset({
    fullname: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    outlets: [],
    group: '',
    password: '',
  }); // Reset form values when opening the add dialog
  setProfilePhoto(null);
  setEditEmployee(null); // Ensure we don't prefill any employee data
  setOpenDialog(true); // Open the dialog
};
const { control, handleSubmit, reset, formState: { errors } } = useForm();

  const handleClose = () => {
    setOpenDialog(false);
    setEditEmployee(null);
  };

  const onSubmit = async (data) => {
    // Check if password is provided when creating a new employee
    if (!editEmployee && !data.password) {
      setPasswordError('Password is required when adding a new employee!');
      return;
    }

    const formData = new FormData();

    // Loop through form data and append to formData object
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'outlets') {
        value.forEach((id) => formData.append('outlets', id));
      } else {
        formData.append(key, value);
      }
    });

    // Add profile photo if available
    if (profilePhoto) {
      formData.append('profile_photo', profilePhoto);
    }

    try {
      // Check if we're editing or creating an employee
      if (editEmployee) {
        // Update existing employee
        await api.put(`/api/editemployees/${editEmployee.employee_id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Employee updated successfully!');
      } else {
        // Create new employee
        await api.post('/api/employees/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Employee created successfully!');
      }

      // Re-fetch employees list after the operation
      await fetchEmployees();

      // Close the dialog after submission
      handleClose();
    } catch (err) {
      console.error('Error during employee creation/updating:', err);
      alert('There was an error while processing your request. Please try again.');
    }
  };

  const columns = [
    { field: 'fullname', headerName: 'User Name', flex: 1 },
    { field: 'first_name', headerName: 'First Name', flex: 1 },
    { field: 'last_name', headerName: 'Last Name', flex: 1 },
    { field: 'phone_number', headerName: 'Phone', flex: 1 },
    { field: 'date_of_birth', headerName: 'DOB', flex: 1 },
    { field: 'outlets', headerName: 'Outlets', flex: 1 },
    { field: 'group', headerName: 'Role', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Edit',
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="Edit"><EditIcon /></Tooltip>}
          label="Edit"
          onClick={() => {
            const prefilled = {
              ...params.row,
              outlets: outlets.filter(outlet =>
                params.row.outlets.split(', ').includes(outlet.name)
              ).map(o => o.id),
              group: groups.find(g => params.row.group.includes(g.name))?.id || '',
            };
            reset(prefilled);
            setProfilePhoto(null);
            setEditEmployee(params.row);
            setOpenDialog(true);
            setPasswordError('');
          }}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 600, width: '90%', mx: 'auto', mt: 5, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>EMPLOYEES</Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpenAdd}
        sx={{ mb: 2, ml: 'auto' }}
      >
        Add Employee
      </Button>

      <DataGrid
        rows={employees}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.employee_id}
      />

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
  <DialogTitle>{editEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
  <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
    <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* User Information Fields */}
      {[
        ['fullname', 'User Name'],
        ['email', 'Email'],
        ['first_name', 'First Name'],
        ['last_name', 'Last Name'],
        ['phone_number', 'Phone Number'],
        ['date_of_birth', 'Date of Birth', 'date'],
      ].map(([name, label, type = 'text']) => (
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
              autoComplete="off"  // Prevent autofill for all fields
            />
          )}
        />
      ))}

      {/* Conditional Password Field */}
      {!editEmployee && (
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              label="Password"
              type="password"
              fullWidth
              error={!!passwordError || !!errors.password}
              helperText={passwordError || errors.password?.message}
              {...field}
              autoComplete="new-password" // Prevent autofill for password field
            />
          )}
        />
      )}

      {/* Outlets Multi-Select */}
      <Controller
        name="outlets"
        control={control}
        render={({ field }) => (
          <TextField
            select
            label="Outlets"
            fullWidth
            SelectProps={{ multiple: true }}
            error={!!errors.outlets}
            helperText={errors.outlets?.message}
            {...field}
            autoComplete="off"  // Prevent autofill for multi-select outlets
          >
            {outlets.map((outlet) => (
              <MenuItem key={outlet.id} value={outlet.id}>
                {outlet.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {/* Group (Role) Selection */}
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
            autoComplete="off"  // Prevent autofill for the role field
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {/* Profile Photo Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setProfilePhoto(e.target.files[0])}
      />
    </DialogContent>

    {/* Dialog Actions */}
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
