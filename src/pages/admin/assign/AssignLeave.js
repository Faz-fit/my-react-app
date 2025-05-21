import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Typography,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';

// Dummy employees
const employees = [
  { id: 'e1', name: 'John Doe', department: 'Engineering' },
  { id: 'e2', name: 'Jane Smith', department: 'Marketing' },
];

// Pre-made leave types
const leaveTypes = [
  { id: 'lt1', name: 'Sick Leave' },
  { id: 'lt2', name: 'Maternity Leave' },
  { id: 'lt3', name: 'Casual Leave' },
];

export default function EmployeeLeaveAssignmentSimple() {
  // employeeLeaves: map employeeId => array of leaveType ids assigned
  const [employeeLeaves, setEmployeeLeaves] = useState({
    e1: ['lt1'], // John Doe assigned Sick Leave
    e2: [], // Jane Smith no leaves assigned yet
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Open dialog for editing employee leaves
  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
  };

  // Toggle leave type assignment checkbox
  const handleToggleLeave = (leaveTypeId) => {
    setEmployeeLeaves((prev) => {
      const current = prev[selectedEmployee.id] || [];
      if (current.includes(leaveTypeId)) {
        // remove
        return {
          ...prev,
          [selectedEmployee.id]: current.filter((id) => id !== leaveTypeId),
        };
      } else {
        // add
        return {
          ...prev,
          [selectedEmployee.id]: [...current, leaveTypeId],
        };
      }
    });
  };

  // Prepare grid rows - each employee + count of assigned leaves
  const rows = employees.map((emp) => ({
    id: emp.id,
    name: emp.name,
    department: emp.department,
    leaveCount: (employeeLeaves[emp.id] || []).length,
  }));

  const columns = [
    { field: 'name', headerName: 'Employee Name', flex: 1 },
    { field: 'department', headerName: 'Department', flex: 1 },
    {
      field: 'leaveCount',
      headerName: 'Assigned Leaves',
      width: 150,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Assign Leaves">
              <EditIcon />
            </Tooltip>
          }
          label="Assign Leaves"
          onClick={() => handleEditClick(employees.find((e) => e.id === params.id))}
          showInMenu={false}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 500, width: '90%', mx: 'auto', mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Employee Leave Assignment
      </Typography>

      <DataGrid rows={rows} columns={columns} pageSize={7} rowsPerPageOptions={[7, 14]} />

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Leaves to {selectedEmployee ? selectedEmployee.name : ''}
        </DialogTitle>

        <DialogContent dividers>
          {leaveTypes.map((leaveType) => {
            const isChecked =
              selectedEmployee &&
              employeeLeaves[selectedEmployee.id]?.includes(leaveType.id);

            return (
              <FormControlLabel
                key={leaveType.id}
                control={
                  <Checkbox
                    checked={isChecked || false}
                    onChange={() => handleToggleLeave(leaveType.id)}
                  />
                }
                label={leaveType.name}
              />
            );
          })}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleClose}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
