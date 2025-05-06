// src/pages/admin/create/CreateOutlet.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, TextField } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation schema
const schema = yup.object({
  name: yup.string().required('Outlet name is required'),
  location: yup.string().required('Location is required'),
}).required();

const CreateOutlet = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log('Creating outlet:', data);
    // TODO: Replace with API call (e.g. axios.post('/api/outlets', data))
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Outlet Name"
          fullWidth
          margin="normal"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          label="Location"
          fullWidth
          margin="normal"
          {...register('location')}
          error={!!errors.location}
          helperText={errors.location?.message}
        />

        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Create Outlet
        </Button>
      </form>
    </Box>
  );
};

export default CreateOutlet;
