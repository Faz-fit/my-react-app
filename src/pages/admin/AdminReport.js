// src/pages/admin/Reports.js
import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, FormControl, InputLabel, Select, MenuItem,
  Pagination
} from '@mui/material';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('employee');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const employeeData = [
    { id: 1, name: 'John Doe', department: 'Engineering', attendance: '95%' },
    { id: 2, name: 'Jane Smith', department: 'Marketing', attendance: '90%' },
    // Add more employee data here
  ];

  const leaveData = [
    { employee: 'John Doe', leaveType: 'Sick', days: 2, status: 'Approved' },
    { employee: 'Jane Smith', leaveType: 'Vacation', days: 5, status: 'Pending' },
    // Add more leave data here
  ];

  const workShiftData = [
    { employee: 'John Doe', shift: 'Morning', date: '2025-05-01' },
    { employee: 'Jane Smith', shift: 'Afternoon', date: '2025-05-01' },
    // Add more work shift data here
  ];

  const handleChangeReport = (event) => {
    setSelectedReport(event.target.value);
    setPage(1); // Reset to first page on report change
  };

  const handlePageChange = (_, value) => {
    setPage(value);
  };

  const paginatedData = (data) => {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  };

  const renderTable = () => {
    switch (selectedReport) {
      case 'employee':
        return (
          <>
            <Typography variant="h6">Employee Report</Typography>
            <TableContainer component={Paper}>
              <Table aria-label="employee report">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Attendance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData(employeeData).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell>{row.attendance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Pagination
              count={Math.ceil(employeeData.length / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
              sx={{ mt: 2 }}
            />
          </>
        );
      case 'leave':
        return (
          <>
            <Typography variant="h6">Leave Report</Typography>
            <TableContainer component={Paper}>
              <Table aria-label="leave report">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData(leaveData).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.employee}</TableCell>
                      <TableCell>{row.leaveType}</TableCell>
                      <TableCell>{row.days}</TableCell>
                      <TableCell>{row.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Pagination
              count={Math.ceil(leaveData.length / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
              sx={{ mt: 2 }}
            />
          </>
        );
      case 'shift':
        return (
          <>
            <Typography variant="h6">Work Shift Report</Typography>
            <TableContainer component={Paper}>
              <Table aria-label="work shift report">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData(workShiftData).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.employee}</TableCell>
                      <TableCell>{row.shift}</TableCell>
                      <TableCell>{row.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Pagination
              count={Math.ceil(workShiftData.length / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
              sx={{ mt: 2 }}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Reports
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

      {renderTable()}
    </Box>
  );
};

export default Reports;
