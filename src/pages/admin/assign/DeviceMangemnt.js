import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tooltip, Typography
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import api from 'utils/api';

const passwordSchema = yup.object({
  password: yup.string().required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function EmployeeGrid() {
  const [employees, setEmployees] = useState([]);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/getemployees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setSelectedEmployee(null);
    resetPasswordForm();
  };

  const onPasswordSubmit = async (data) => {
    if (!selectedEmployee) return;
    try {
      await api.put(`/api/changepassword/${selectedEmployee.employee_id}/`, {
        password: data.password,
      });
      alert('Password updated successfully!');
      handleClosePasswordDialog();
    } catch (err) {
      console.error('Error updating password:', err);
      alert('Error updating password');
    }
  };

  const columns = [
    { field: 'fullname', headerName: 'User Name', flex: 1 },
    { field: 'first_name', headerName: 'Name', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="Change Password"><LockResetIcon /></Tooltip>}
          label="Change Password"
          onClick={() => {
            setSelectedEmployee(params.row);
            setOpenPasswordDialog(true);
          }}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 600, width: '90%', mx: 'auto', mt: 5 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>Change Password</Typography>

      <DataGrid
        rows={employees}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.employee_id}
      />

      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Change Password for {selectedEmployee?.fullname}</DialogTitle>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} noValidate>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="password"
              control={passwordControl}
              render={({ field }) => (
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  autoFocus
                  error={!!passwordErrors.password}
                  helperText={passwordErrors.password?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={passwordControl}
              render={({ field }) => (
                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword?.message}
                  {...field}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePasswordDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
