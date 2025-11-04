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
import api from "utils/api";

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

  // --- State for Confirmation Dialog ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);

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
      await fetchEmployeesForOutlet();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update attendance");
    }
  };

  const handleProcessRowUpdate = (newRow, oldRow) => {
    if (
      newRow.check_in_time !== oldRow.check_in_time ||
      newRow.check_out_time !== oldRow.check_out_time
    ) {
      setPendingUpdate({ newRow, oldRow });
      setIsConfirmOpen(true);
      return oldRow;
    }
    return newRow;
  };

  const handleConfirmUpdate = async () => {
    if (pendingUpdate) {
      await handleAttendanceUpdate(
        pendingUpdate.newRow.id,
        pendingUpdate.newRow.check_in_time,
        pendingUpdate.newRow.check_out_time
      );
      setIsConfirmOpen(false);
      setPendingUpdate(null);
    }
  };

  const handleCancelUpdate = () => {
    setIsConfirmOpen(false);
    setPendingUpdate(null);
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
       <Typography
                 variant="h4"
                 sx={{
                   fontWeight: 'bold',
                   textTransform:'uppercase',
                   display: 'inline-block',
                   pb: 0.5,
                 }}
               >Attendance History</Typography>
        <Button variant="contained" onClick={handleOpenBulkDialog} disabled={!selectedOutletId}>
          Bulk Add Attendance
        </Button>
      </Box>

      {/* Redesigned Outlet and Employee Selectors */}
      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={2}>
        {/* Outlet Select */}
        <FormControl
          size="medium"
          variant="outlined"
          sx={{
            minWidth: 220,
            maxWidth: 300,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 2px 6px rgb(0 0 0 / 0.1)",
            height: 48,
            "& .MuiOutlinedInput-root": {
              height: "100%",
              "& fieldset": {
                borderColor: "rgba(25, 118, 210, 0.5)",
              },
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
                borderWidth: 2,
              },
              "& .MuiSelect-select": {
                height: "100%",
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                fontWeight: 600,
                fontSize: "1rem",
              },
            },
          }}
        >
          <InputLabel id="outlet-label">Outlet</InputLabel>
          <Select
            labelId="outlet-label"
            value={selectedOutletId}
            onChange={(e) => setSelectedOutletId(e.target.value)}
            label="Outlet"
            MenuProps={{ PaperProps: { sx: { borderRadius: 2 } } }}
          >
            {outlets.map((outlet) => (
              <MenuItem key={outlet.id} value={outlet.id}>
                {outlet.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Employee Select */}
        <FormControl
          size="medium"
          variant="outlined"
          sx={{
            minWidth: 220,
            maxWidth: 300,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 2px 6px rgb(0 0 0 / 0.1)",
            height: 48,
            "& .MuiOutlinedInput-root": {
              height: "100%",
              "& fieldset": {
                borderColor: "rgba(25, 118, 210, 0.5)",
              },
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
                borderWidth: 2,
              },
              "& .MuiSelect-select": {
                height: "100%",
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                fontWeight: 600,
                fontSize: "1rem",
              },
            },
          }}
        >
          <InputLabel id="employee-label">Employee</InputLabel>
          <Select
            labelId="employee-label"
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            label="Employee"
            MenuProps={{ PaperProps: { sx: { borderRadius: 2 } } }}
          >
            {employees.map((emp) => (
              <MenuItem key={emp.employee_id} value={emp.employee_id}>
                {emp.first_name} {emp.last_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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
            processRowUpdate={handleProcessRowUpdate}
          />
        ) : (
          <Typography p={2}>No attendance records found</Typography>
        )}
      </Box>

      {/* --- Confirmation Dialog --- */}
      <Dialog open={isConfirmOpen} onClose={handleCancelUpdate}>
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to update this attendance record?</Typography>
          {pendingUpdate && (
            <Box mt={2}>
              <Typography variant="body2">
                <strong>Date:</strong> {pendingUpdate.newRow.date}
              </Typography>
              <Typography variant="body2">
                <strong>Check-in:</strong> {pendingUpdate.oldRow.check_in_time} → {pendingUpdate.newRow.check_in_time}
              </Typography>
              <Typography variant="body2">
                <strong>Check-out:</strong> {pendingUpdate.oldRow.check_out_time} → {pendingUpdate.newRow.check_out_time}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUpdate}>Cancel</Button>
          <Button onClick={handleConfirmUpdate} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

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
                selected.map((id) => employees.find((e) => e.employee_id === id)?.first_name).join(", ")
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
          <Button onClick={handleBulkSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
