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
import api2 from 'utils/api2';

// Validation schema
const schema = yup.object({
  fullname: yup.string().required('Full name is required'),
  email: yup.string().email().required('Email is required'),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  phone_number: yup.string(),
  date_of_birth: yup.string().required('Date of birth is required'),
  password: yup.string().required('Password is required'),
  outlets: yup
    .array()
    .of(yup.number())
    .min(1, 'At least one outlet is required')
    .required('Outlets is required'),
  group: yup.number().typeError('Group is required').required('Group is required'),
});

const initialEmployees = [];

export default function EmployeeGrid() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [openDialog, setOpenDialog] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [outlets, setOutlets] = useState([]);
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
      outlets: [],
      group: '',
      password: '',
    },
  });

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
    try {
      const formData = new FormData();

      // Add basic fields
      for (const key in data) {
        if (key === 'outlets') {
          data.outlets.forEach((id) => {
            formData.append('outlets', id); // ✅ No '[]'
          });
        } else {
          formData.append(key, data[key]);
        }
      }

      // Append file
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }

      // Submit
      if (editEmployee) {
        await api.put(`/api/editemployees/${editEmployee.employee_id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/api/employees/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      await fetchEmployees();
      handleClose();
    } catch (err) {
      console.error(err);
      alert('Error creating/updating employee');
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
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[['fullname', 'User Name'],
            ['email', 'Email'],
            ['first_name', 'First Name'],
            ['last_name', 'Last Name'],
            ['phone_number', 'Phone Number'],
            ['date_of_birth', 'Date of Birth', 'date'],
            ['password', 'Password', 'password'],
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
                  />
                )}
              />
            ))}

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
                >
                  {outlets.map((outlet) => (
                    <MenuItem key={outlet.id} value={outlet.id}>
                      {outlet.name}
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
