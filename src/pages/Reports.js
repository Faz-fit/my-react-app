import React, { useState } from 'react';
import {
  Box,
  Typography,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Sample Data
const leaveSummary = [
  { name: 'John Doe', type: 'Sick Leave', days: 2, status: 'Approved' },
  { name: 'Alice Johnson', type: 'Vacation', days: 5, status: 'Pending' },
  { name: 'Jane Smith', type: 'Personal Leave', days: 1, status: 'Rejected' },
];

const upcomingLeaves = [
  { name: 'Bob Lee', from: '2025-05-10', to: '2025-05-12', type: 'Vacation' },
  { name: 'Linda Carter', from: '2025-05-15', to: '2025-05-20', type: 'Sick Leave' },
];

const employeeSummary = [
  {
    name: 'John Doe',
    id: 'EMP001',
    designation: 'Cashier',
    present: 22,
    absent: 2,
    leaves: 1,
    late: 3,
    earlyExit: 1,
  },
  {
    name: 'Jane Smith',
    id: 'EMP002',
    designation: 'Floor Manager',
    present: 20,
    absent: 4,
    leaves: 2,
    late: 1,
    earlyExit: 0,
  },
  {
    name: 'Alice Johnson',
    id: 'EMP003',
    designation: 'Sales Assistant',
    present: 18,
    absent: 5,
    leaves: 2,
    late: 2,
    earlyExit: 3,
  },
];

// Excel Export
const downloadExcel = () => {
  const dataToExport = employeeSummary.map(emp => ({
    'Employee ID': emp.id,
    Name: emp.name,
    Designation: emp.designation,
    'Days Present': emp.present,
    'Days Absent': emp.absent,
    'Leaves Taken': emp.leaves,
    'Late Arrivals': emp.late,
    'Early Exits': emp.earlyExit,
    'Attendance %': ((emp.present / (emp.present + emp.absent)) * 100).toFixed(1) + '%',
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Summary');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(dataBlob, 'EmployeeSummary.xlsx');
};

function Reports() {
  const [selectedSection, setSelectedSection] = useState('employee');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Outlet Reports
      </Typography>

      {/* Dropdown Selection */}
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Select Report Section</InputLabel>
        <Select
          value={selectedSection}
          label="Select Report Section"
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          <MenuItem value="employee">Employee Summary</MenuItem>
          <MenuItem value="leave">Leave Summary</MenuItem>
          <MenuItem value="upcoming">Upcoming Leaves</MenuItem>
        </Select>
      </FormControl>

      {/* Render Section Based on Selection */}
      {selectedSection === 'employee' && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" onClick={downloadExcel}>
              Download Excel
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Present</TableCell>
                  <TableCell>Absent</TableCell>
                  <TableCell>Leaves</TableCell>
                  <TableCell>Late</TableCell>
                  <TableCell>Early Exits</TableCell>
                  <TableCell>Attendance %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeSummary.map((emp, index) => {
                  const attendancePercent = (
                    (emp.present / (emp.present + emp.absent)) *
                    100
                  ).toFixed(1);
                  return (
                    <TableRow key={index}>
                      <TableCell>{emp.id}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.designation}</TableCell>
                      <TableCell>{emp.present}</TableCell>
                      <TableCell>{emp.absent}</TableCell>
                      <TableCell>{emp.leaves}</TableCell>
                      <TableCell>{emp.late}</TableCell>
                      <TableCell>{emp.earlyExit}</TableCell>
                      <TableCell>{attendancePercent}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {selectedSection === 'leave' && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveSummary.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.days}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedSection === 'upcoming' && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Leave Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingLeaves.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.from}</TableCell>
                  <TableCell>{row.to}</TableCell>
                  <TableCell>{row.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default Reports;
