import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from 'utils/api';

export default function AttendanceHistory() {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [userDetails, setUserDetails] = useState(null);

  // --- State for Bulk Add Dialog ---
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkSelectedEmployees, setBulkSelectedEmployees] = useState([]);
  const [bulkDate, setBulkDate] = useState("");
  const [bulkCheckIn, setBulkCheckIn] = useState("");
  const [bulkCheckOut, setBulkCheckOut] = useState("");

  const fetchEmployeesForOutlet = async () => {
    if (!selectedOutletId) return;
    setLoading(true);
    try {
      const response = await api.get(`/outletsalldata/${selectedOutletId}/`);
      const allEmployees = response.data.employees || [];
      setEmployees(allEmployees);
      if (allEmployees.length > 0) {
        setSelectedEmployeeId(allEmployees[0].employee_id);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await api.get("/api/user/");
        const data = response.data;
        setUserDetails(data);
        const userOutlets = data.outlets || [];
        setOutlets(userOutlets);
        if (userOutlets.length > 0) {
          setSelectedOutletId(userOutlets[0].id);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchEmployeesForOutlet();
  }, [selectedOutletId]);

  useEffect(() => {
    const emp = employees.find((e) => e.employee_id === selectedEmployeeId);
    if (emp && emp.attendances) {
      const formattedRows = emp.attendances.map((att) => ({
        id: att.attendance_id,
        date: att.date,
        check_in_time: att.check_in_time || "",
        check_out_time: att.check_out_time || "",
        status: att.status,
        updated_by: userDetails ? userDetails.username : "",
      }));
      setRows(formattedRows);
    } else {
      setRows([]);
    }
  }, [selectedEmployeeId, employees, userDetails]);

  const handleAttendanceUpdate = async (attendanceId, updatedCheckIn, updatedCheckOut) => {
    const payload = {
      attendance_id: attendanceId,
      check_in_time: updatedCheckIn,
      check_out_time: updatedCheckOut,
    };
    try {
      await api.post("/api/attendance/update/", payload);
      // Refresh data after update
      await fetchEmployeesForOutlet();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update attendance");
    }
  };

  const handleProcessRowUpdate = (newRow) => {
    handleAttendanceUpdate(newRow.id, newRow.check_in_time, newRow.check_out_time);
    return newRow;
  };

  // --- Bulk Add Logic ---
  const handleOpenBulkDialog = () => setIsBulkAddOpen(true);

  const handleCloseBulkDialog = () => {
    setIsBulkAddOpen(false);
    setBulkSelectedEmployees([]);
    setBulkDate("");
    setBulkCheckIn("");
    setBulkCheckOut("");
  };

  const handleBulkSubmit = async () => {
    if (bulkSelectedEmployees.length === 0 || !bulkDate || !bulkCheckIn || !bulkCheckOut) {
      alert("Please select employees and fill in all date/time fields.");
      return;
    }

    const payload = {
      employee_ids: bulkSelectedEmployees,
      date: bulkDate,
      check_in_time: bulkCheckIn,
      check_out_time: bulkCheckOut,
      outlet_id: selectedOutletId,
    };

    try {
      const response = await api.post("/api/attendance/bulk-add/", payload);
      alert(response.data.message);
      handleCloseBulkDialog();
      // Refresh the data to show the new records
      await fetchEmployeesForOutlet();
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred during the bulk add.";
      alert(`Error: ${errorMessage}`);
    }
  };

  const columns = [
    { field: "date", headerName: "Date", width: 150 },
    { field: "check_in_time", headerName: "Check-in Time", width: 200, editable: true },
    { field: "check_out_time", headerName: "Check-out Time", width: 200, editable: true },
    { field: "status", headerName: "Status", width: 150 },
    { field: "updated_by", headerName: "Updated By", width: 150 },
  ];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Attendance History</Typography>
        <Button variant="contained" onClick={handleOpenBulkDialog} disabled={!selectedOutletId}>
          Bulk Add Attendance
        </Button>
      </Box>

      <FormControl sx={{ m: 1, minWidth: 200 }}>
        <InputLabel>Outlet</InputLabel>
        <Select
          value={selectedOutletId}
          onChange={(e) => setSelectedOutletId(e.target.value)}
        >
          {outlets.map((outlet) => (
            <MenuItem key={outlet.id} value={outlet.id}>
              {outlet.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Employee Dropdown */}
      <FormControl sx={{ m: 1, minWidth: 200 }}>
        <InputLabel>Employee</InputLabel>
        <Select
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
        >
          {employees.map((emp) => (
            <MenuItem key={emp.employee_id} value={emp.employee_id}>
              {emp.first_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Attendance DataGrid */}
      <Box mt={3} style={{ height: 400, width: "100%" }}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : rows.length > 0 ? (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            processRowUpdate={handleProcessRowUpdate} // Trigger update on cell edit
          />
        ) : (
          <Typography p={2}>No attendance records found</Typography>
        )}
      </Box>

      {/* --- Bulk Add Dialog --- */}
      <Dialog open={isBulkAddOpen} onClose={handleCloseBulkDialog} fullWidth maxWidth="sm">
        <DialogTitle>Bulk Add Attendance Records</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Employees</InputLabel>
            <Select
              multiple
              value={bulkSelectedEmployees}
              onChange={(e) => setBulkSelectedEmployees(e.target.value)}
              renderValue={(selected) =>
                selected.map(id => employees.find(e => e.employee_id === id)?.first_name).join(', ')
              }
            >
              {employees.map((emp) => (
                <MenuItem key={emp.employee_id} value={emp.employee_id}>
                  {emp.first_name} {emp.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="normal"
            value={bulkDate}
            onChange={(e) => setBulkDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Check-in Time"
            type="time"
            fullWidth
            margin="normal"
            value={bulkCheckIn}
            onChange={(e) => setBulkCheckIn(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Check-out Time"
            type="time"
            fullWidth
            margin="normal"
            value={bulkCheckOut}
            onChange={(e) => setBulkCheckOut(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDialog}>Cancel</Button>
          <Button onClick={handleBulkSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
