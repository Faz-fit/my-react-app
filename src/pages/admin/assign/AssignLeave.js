// src/pages/admin/assign/AssignLeave.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, TextField, MenuItem, FormControl, InputLabel, Select, FormHelperText } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Dummy data for employees and leave types
const employees = [
  { id: 'e1', name: 'John Doe' },
  { id: 'e2', name: 'Jane Smith' },
];
const leaveTypes = ['Sick Leave', 'Casual Leave', 'Annual Leave'];

// Validation schema
const schema = yup.object({
  employeeId: yup.string().required('Employee is required'),
  leaveType: yup.string().required('Leave type is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().required('End date is required').min(yup.ref('startDate'), 'End date must be after start date'),
}).required();

const AssignLeave = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log('Assigning leave to employee:', data);
    // TODO: Send data to backend to assign leave
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl fullWidth margin="normal" error={!!errors.employeeId}>
          <InputLabel id="employee-label">Employee</InputLabel>
          <Select
            labelId="employee-label"
            {...register('employeeId')}
            label="Employee"
            defaultValue=""
          >
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>
                {employee.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.employeeId?.message}</FormHelperText>
        </FormControl>

        <FormControl fullWidth margin="normal" error={!!errors.leaveType}>
          <InputLabel id="leave-type-label">Leave Type</InputLabel>
          <Select
            labelId="leave-type-label"
            {...register('leaveType')}
            label="Leave Type"
            defaultValue=""
          >
            {leaveTypes.map((type, index) => (
              <MenuItem key={index} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.leaveType?.message}</FormHelperText>
        </FormControl>

        <TextField
          label="Start Date"
          type="date"
          fullWidth
          margin="normal"
          {...register('startDate')}
          error={!!errors.startDate}
          helperText={errors.startDate?.message}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="End Date"
          type="date"
          fullWidth
          margin="normal"
          {...register('endDate')}
          error={!!errors.endDate}
          helperText={errors.endDate?.message}
          InputLabelProps={{ shrink: true }}
        />

        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Assign Leave
        </Button>
      </form>
    </Box>
  );
};

export default AssignLeave;
