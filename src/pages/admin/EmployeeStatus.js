import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Validation schema for form
const schema = yup.object({
  name: yup.string().required('Name is required'),
  role: yup.string().required('Role is required'),
  phone: yup.string(),
  location: yup.string(),
  status: yup.string().oneOf(['active', 'inactive']).required('Status required'),
});

const initialEmployees = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Software Engineer',
    phone: '123-456-7890',
    status: 'active',
    location: 'New York',
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Project Manager',
    phone: '987-654-3210',
    status: 'inactive',
    location: 'New York',
  },
  {
    id: 3,
    name: 'Alice Johnson',
    role: 'UX Designer',
    phone: '555-123-4567',
    status: 'active',
    location: 'Melbourne',
  },
];

export default function EmployeeGrid() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [openDialog, setOpenDialog] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  // react-hook-form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      role: '',
      phone: '',
      location: '',
      status: 'active',
    },
  });

  // Open dialog for Add or Edit
  const handleOpenAdd = () => {
    setEditEmployee(null);
    reset({
      name: '',
      role: '',
      phone: '',
      location: '',
      status: 'active',
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (employee) => {
    setEditEmployee(employee);
    reset(employee);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditEmployee(null);
  };

  const onSubmit = (data) => {
    if (editEmployee) {
      // Edit mode - update employee
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === editEmployee.id ? { ...emp, ...data } : emp))
      );
    } else {
      // Add mode - add new employee with new id
      const newId = employees.length ? Math.max(...employees.map((e) => e.id)) + 1 : 1;
      setEmployees((prev) => [...prev, { id: newId, ...data }]);
    }
    handleClose();
  };

  // Define columns for DataGrid
  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'role', headerName: 'Role', flex: 1, minWidth: 150 },
    { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 130 },
    { field: 'location', headerName: 'Location', flex: 1, minWidth: 130 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Typography
          sx={{
            color: params.value === 'active' ? 'green' : 'red',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit">
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleOpenEdit(params.row)}
          showInMenu={false}
          key="edit"
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 500, width: '90%', mx: 'auto', mt: 5, position: 'relative' }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        Employees
      </Typography>

      {/* Add Button top right */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}
        onClick={handleOpenAdd}
      >
        Add Employee
      </Button>

      <DataGrid
        rows={employees}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10]}
        disableSelectionOnClick
        sx={{ mt: 4 }}
      />

      {/* Dialog for Add/Edit */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Role"
                  fullWidth
                  error={!!errors.role}
                  helperText={errors.role?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Phone"
                  fullWidth
                  {...field}
                />
              )}
            />
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Location"
                  fullWidth
                  {...field}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField select label="Status" fullWidth error={!!errors.status} helperText={errors.status?.message} {...field}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              )}
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
