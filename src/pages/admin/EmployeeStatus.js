import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

// Dummy data – replace with API calls
const dummyEmployees = [
  { id: 1, name: 'John Doe', status: 'active', imageUrl: 'https://i.pravatar.cc/40?img=1' },
  { id: 2, name: 'Jane Smith', status: 'inactive', imageUrl: 'https://i.pravatar.cc/40?img=2' },
  { id: 3, name: 'Alice Johnson', status: 'terminated', imageUrl: 'https://i.pravatar.cc/40?img=3' },
];

const statuses = ['active', 'inactive'];

function EmployeeStatus() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // The employee being edited
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setEmployees(dummyEmployees);
  }, []);

  const openEditDialog = (emp) => {
    setSelectedEmployee(emp);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleDialogChange = (field, value) => {
    setSelectedEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === selectedEmployee.id ? selectedEmployee : emp
      )
    );
    console.log('Saved:', selectedEmployee);
    closeDialog();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee Status Management
      </Typography>

      <Paper elevation={2} sx={{ mt: 2, overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Photo</strong></TableCell>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell><Avatar src={emp.imageUrl} alt={emp.name} /></TableCell>
                <TableCell>{emp.id}</TableCell>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.status}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => openEditDialog(emp)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog for editing */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          {selectedEmployee && (
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="ID"
                value={selectedEmployee.id}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Name"
                value={selectedEmployee.name}
                onChange={(e) => handleDialogChange('name', e.target.value)}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedEmployee.status}
                  label="Status"
                  onChange={(e) => handleDialogChange('status', e.target.value)}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Avatar
                src={selectedEmployee.imageUrl}
                alt={selectedEmployee.name}
                sx={{ width: 60, height: 60 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmployeeStatus;
