import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const rowsPerPage = 10;

const employeeData = [
  { id: 1, name: 'John Doe', department: 'Engineering', attendance: '95%' },
  { id: 2, name: 'Jane Smith', department: 'Marketing', attendance: '90%' },
  // Add more employee data here
];

const leaveData = [
  { id: 1, employee: 'John Doe', leaveType: 'Sick', days: 2, status: 'Approved' },
  { id: 2, employee: 'Jane Smith', leaveType: 'Vacation', days: 5, status: 'Pending' },
  // Add more leave data here
];

const workShiftData = [
  { id: 1, employee: 'John Doe', shift: 'Morning', date: '2025-05-01' },
  { id: 2, employee: 'Jane Smith', shift: 'Afternoon', date: '2025-05-01' },
  // Add more work shift data here
];

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('employee');
  const [pageSize, setPageSize] = useState(rowsPerPage);

  const handleChangeReport = (event) => {
    setSelectedReport(event.target.value);
  };

  // Define columns for each report type
  const columnsMap = {
    employee: [
      { field: 'name', headerName: 'Employee Name', flex: 1, minWidth: 150 },
      { field: 'department', headerName: 'Department', flex: 1, minWidth: 150 },
      { field: 'attendance', headerName: 'Attendance', width: 120 },
    ],
    leave: [
      { field: 'employee', headerName: 'Employee', flex: 1, minWidth: 150 },
      { field: 'leaveType', headerName: 'Leave Type', flex: 1, minWidth: 150 },
      { field: 'days', headerName: 'Days', width: 90, type: 'number' },
      { field: 'status', headerName: 'Status', width: 120 },
    ],
    shift: [
      { field: 'employee', headerName: 'Employee', flex: 1, minWidth: 150 },
      { field: 'shift', headerName: 'Shift', flex: 1, minWidth: 150 },
      { field: 'date', headerName: 'Date', width: 130 },
    ],
  };

  // Data for currently selected report
  const dataMap = {
    employee: employeeData,
    leave: leaveData,
    shift: workShiftData,
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        REPORTS
      </Typography>

      <FormControl fullWidth sx={{ maxWidth: 300, mb: 3 }}>
        <InputLabel id="report-select-label">Select Report</InputLabel>
        <Select
          labelId="report-select-label"
          value={selectedReport}
          label="Select Report"
          onChange={handleChangeReport}
        >
          <MenuItem value="employee">Employee Report</MenuItem>
          <MenuItem value="leave">Leave Report</MenuItem>
          <MenuItem value="shift">Work Shift Report</MenuItem>
        </Select>
      </FormControl>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report
      </Typography>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={dataMap[selectedReport]}
          columns={columnsMap[selectedReport]}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          pagination
          disableSelectionOnClick
          sx={{ bgcolor: 'background.paper' }}
        />
      </Box>
    </Box>
  );
};

export default Reports;
