// src/pages/admin/create/CreateEmployee.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, TextField, Grid, MenuItem, InputLabel, FormControl, Select, FormHelperText } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().required('Role is required'),
  outlet: yup.string().required('Outlet is required'),
}).required();

const outlets = ['Outlet 1', 'Outlet 2', 'Outlet 3']; // Replace with actual outlet data

const CreateEmployee = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log(data);
    // Handle form submission logic here
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <FormControl fullWidth margin="normal" error={!!errors.role}>
          <InputLabel>Role</InputLabel>
          <Select
            {...register('role')}
            label="Role"
          >
            <MenuItem value="employee">Employee</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
          </Select>
          <FormHelperText>{errors.role?.message}</FormHelperText>
        </FormControl>
        <FormControl fullWidth margin="normal" error={!!errors.outlet}>
          <InputLabel>Outlet</InputLabel>
          <Select
            {...register('outlet')}
            label="Outlet"
          >
            {outlets.map((outlet, index) => (
              <MenuItem key={index} value={outlet}>{outlet}</MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.outlet?.message}</FormHelperText>
        </FormControl>
        <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2 }}>
          Create Employee
        </Button>
      </form>
    </Box>
  );
};

export default CreateEmployee;
