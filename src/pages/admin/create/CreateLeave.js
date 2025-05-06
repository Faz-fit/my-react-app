// src/pages/admin/create/CreateLeave.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, TextField, MenuItem } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation schema
const schema = yup.object({
  leaveType: yup.string().required('Leave type is required'),
  description: yup.string().required('Description is required'),
  totalDays: yup
    .number()
    .typeError('Total days must be a number')
    .positive('Must be greater than zero')
    .required('Total days is required'),
}).required();

const leaveTypes = ['Sick Leave', 'Casual Leave', 'Maternity Leave', 'Annual Leave'];

const CreateLeave = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log('Creating leave type:', data);
    // TODO: Call API to save leave type
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          select
          label="Leave Type"
          fullWidth
          margin="normal"
          defaultValue=""
          {...register('leaveType')}
          error={!!errors.leaveType}
          helperText={errors.leaveType?.message}
        >
          {leaveTypes.map((type, index) => (
            <MenuItem key={index} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          {...register('description')}
          error={!!errors.description}
          helperText={errors.description?.message}
        />

        <TextField
          label="Total Days"
          type="number"
          fullWidth
          margin="normal"
          {...register('totalDays')}
          error={!!errors.totalDays}
          helperText={errors.totalDays?.message}
        />

        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Create Leave Type
        </Button>
      </form>
    </Box>
  );
};

export default CreateLeave;
