// src/pages/admin/assign/AssignWorkShift.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, TextField, MenuItem, FormControl, InputLabel, Select, FormHelperText } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Dummy data for employees and work shifts
const employees = [
  { id: 'e1', name: 'John Doe' },
  { id: 'e2', name: 'Jane Smith' },
];
const workShifts = ['Morning Shift', 'Afternoon Shift', 'Night Shift'];

// Validation schema
const schema = yup.object({
  employeeId: yup.string().required('Employee is required'),
  workShift: yup.string().required('Work shift is required'),
  date: yup.date().required('Date is required'),
}).required();

const AssignWorkShift = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log('Assigning work shift to employee:', data);
    // TODO: Send data to backend to assign work shift
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

        <FormControl fullWidth margin="normal" error={!!errors.workShift}>
          <InputLabel id="work-shift-label">Work Shift</InputLabel>
          <Select
            labelId="work-shift-label"
            {...register('workShift')}
            label="Work Shift"
            defaultValue=""
          >
            {workShifts.map((shift, index) => (
              <MenuItem key={index} value={shift}>
                {shift}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.workShift?.message}</FormHelperText>
        </FormControl>

        <TextField
          label="Date"
          type="date"
          fullWidth
          margin="normal"
          {...register('date')}
          error={!!errors.date}
          helperText={errors.date?.message}
          InputLabelProps={{ shrink: true }}
        />

        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Assign Work Shift
        </Button>
      </form>
    </Box>
  );
};

export default AssignWorkShift;
