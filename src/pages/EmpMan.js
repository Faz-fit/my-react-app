import React, { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Paper,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import api from 'utils/api';

const BASE_URL = 'http://139.59.243.2:8000';

export default function EmployeeDataGrid() {
  const [userOutlets, setUserOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [employees, setEmployees] = useState([]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/user/');
      setUserOutlets(res.data.outlets);

      if (res.data.outlets.length === 1) {
        setSelectedOutlet(res.data.outlets[0].id);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchEmployees = async (outletId) => {
    if (!outletId) return;

    try {
      const [employeesRes, outletsRes] = await Promise.all([
        api.get('/api/getoutletemployees', { params: { outlet_id: outletId } }),
        api.get('/api/outlets/'),
      ]);

      const outletsMap = outletsRes.data.reduce((acc, outlet) => {
        acc[outlet.id] = outlet.name;
        return acc;
      }, {});

      const updated = employeesRes.data.map((employee, index) => {
        const outletNames = employee.outlets?.map((id) => outletsMap[id]) || ['Unknown'];
        const photo = employee.reference_photo
          ? `${BASE_URL}${employee.reference_photo}`
          : null;

        return {
          id: index + 1,
          employee_id: employee.employee_id,
          first_name: employee.first_name,
          fullname: employee.fullname,
          idnumber: employee.idnumber,
          group: employee.groups.join(', '),
          outlets: outletNames.join(', '),
          is_active: employee.is_active,
          photo,
        };
      });

      setEmployees(updated);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchEmployees(selectedOutlet);
  }, [selectedOutlet]);

const columns = [
  {
    field: 'photo',
    headerName: 'Photo',
    flex: 0.5, // proportional width
    renderCell: (params) => (
      <Avatar alt={params.row.fullname} src={params.value} sx={{ width: 40, height: 40 }} />
    ),
    sortable: false,
    filterable: false,
    align: 'center',
    headerAlign: 'center',
  },
  { field: 'first_name', headerName: 'First Name', flex: 1.2 },
  { field: 'fullname', headerName: 'Username', flex: 1.5 },
  { field: 'idnumber', headerName: 'NIC No', flex: 1 },
  { field: 'group', headerName: 'Role', flex: 1.2 },
  {
    field: 'is_active',
    headerName: 'Status',
    flex: 0.8,
    renderCell: (params) => (
      <Chip
        label={params.value ? 'Active' : 'Inactive'}
        color={params.value ? 'success' : 'default'}
        size="small"
      />
    ),
    align: 'center',
    headerAlign: 'center',
  },
];


  return (
    <Paper sx={{ width: '95%', mx: 'auto', mt: 5, p: 3, borderRadius: 3, boxShadow: 3 }}>
      {/* Header and Dropdown */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            borderBottom: '3px solid #1976d2',
            display: 'inline-block',
            pb: 0.5,
          }}
        >
          EMPLOYEE INFO
        </Typography>

        {userOutlets.length > 1 && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="outlet-select-label">Select Outlet</InputLabel>
            <Select
              labelId="outlet-select-label"
              value={selectedOutlet || ''}
              label="Select Outlet"
              onChange={(e) => setSelectedOutlet(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              {userOutlets.map((outlet) => (
                <MenuItem key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={employees}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          getRowId={(row) => row.employee_id}
          sx={{
    '& .MuiDataGrid-columnHeaders': {
      minHeight: 40,       // reduce header height
      maxHeight: 40,
    },
    '& .MuiDataGrid-columnHeader': {
      padding: '0 8px',    // reduce horizontal padding
    },
    '& .MuiDataGrid-cell': {
      padding: '0 8px',    // optional: reduce cell padding too
    },
          }}
          slots={{
            toolbar: () => (
              <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <input
                  type="text"
                  placeholder="Quick Search..."
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    setEmployees((prev) =>
                      prev.map((emp) => ({
                        ...emp,
                        hide: !Object.values(emp)
                          .join(' ')
                          .toLowerCase()
                          .includes(value),
                      }))
                    );
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    width: '250px',
                  }}
                />
              </Box>
            ),
          }}
          getRowClassName={(params) => (params.row.hide ? 'MuiDataGrid-row-hidden' : '')}
        />
      </Box>
    </Paper>
  );
}
