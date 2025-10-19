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
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from 'utils/api';

export default function LeaveManagement() {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [newLeaveDate, setNewLeaveDate] = useState("");
  const [newLeaveType, setNewLeaveType] = useState("");
  const [newLeaveRemarks, setNewLeaveRemarks] = useState("");
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkSelectedEmployees, setBulkSelectedEmployees] = useState([]);
  const [bulkLeaveDate, setBulkLeaveDate] = useState("");
  const [bulkLeaveType, setBulkLeaveType] = useState("");
  const [bulkLeaveRemarks, setBulkLeaveRemarks] = useState("");

  // Fetch outlets
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const response = await api.get("/api/user/");
        const userOutlets = response.data.outlets || [];
        setOutlets(userOutlets);
        if (userOutlets.length > 0) {
          setSelectedOutletId(userOutlets[0].id);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchOutlets();
  }, []);

  useEffect(() => {
    if (selectedOutletId)
      fetchOutletData();
  }, [selectedOutletId]);

  const fetchOutletData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/outletsalldata/${selectedOutletId}/`);
      const outletData = response.data;
      const allEmployees = outletData.employees || [];
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
    const fetchLeaveTypes = async () => {
      try {
        const response = await api.get("/api/leavetypes/");
        setLeaveTypes(response.data.filter((lt) => lt.active));
      } catch (err) {
        console.error(err);
      }
    };
    fetchLeaveTypes();
  }, []);

  // Update leaves when selected employee changes
  useEffect(() => {
    const emp = employees.find((e) => e.employee_id === selectedEmployeeId);
    if (emp) {
      const formattedLeaves = (emp.leaves || []).map((l) => ({
        id: l.leave_refno,
        leave_date: l.leave_date,
        leave_type_name: l.leave_type_name,
        remarks: l.remarks,
        status: l.status,
      }));
      setLeaves(formattedLeaves);
    } else setLeaves([]);
  }, [selectedEmployeeId, employees]);

  const columns = [
    { field: "leave_date", headerName: "Leave Date", width: 150 },
    {
      field: "leave_type_name",
      headerName: "Leave Type",
      width: 180,
    },
    { field: "remarks", headerName: "Remarks", width: 200 },
    { field: "status", headerName: "Status", width: 120 },
  ];

  const handleAddLeave = async () => {
    if (!newLeaveDate || !newLeaveType || !selectedEmployeeId) {
      alert("Please fill all fields.");
      return;
    }

    const payload = {
      employee: selectedEmployeeId,
      leave_date: newLeaveDate,
      leave_type: newLeaveType,
      remarks: newLeaveRemarks,
    };

    try {
      const response = await api.post("/api/attendance/addleave/", payload);
      const result = response.data;

      if (result.success === false) {
        alert(result.error || "Failed to add leave.");
        return;
      }

      alert("Leave added successfully.");
      await fetchOutletData();

      setNewLeaveDate("");
      setNewLeaveType("");
      setNewLeaveRemarks("");
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Something went wrong. Please try again.";
      console.error("Error adding leave:", error);
      alert(errorMessage);
    }
  };

  // --- Bulk Add Logic ---
  const handleOpenBulkDialog = () => setIsBulkAddOpen(true);
  const handleCloseBulkDialog = () => {
    setIsBulkAddOpen(false);
    setBulkSelectedEmployees([]);
    setBulkLeaveDate("");
    setBulkLeaveType("");
    setBulkLeaveRemarks("");
  };

  const handleBulkSubmit = async () => {
    if (bulkSelectedEmployees.length === 0 || !bulkLeaveDate || !bulkLeaveType) {
      alert("Please select employees, a leave date, and a leave type.");
      return;
    }

    const payload = {
      employee_ids: bulkSelectedEmployees,
      leave_date: bulkLeaveDate,
      leave_type: bulkLeaveType,
      remarks: bulkLeaveRemarks,
    };

    try {
      const response = await api.post("/api/attendance/bulk-addleave/", payload);
      alert(response.data.message);
      handleCloseBulkDialog();
      await fetchOutletData(); // Refresh data
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred during the bulk add.";
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Leave Management</Typography>
        <Button variant="contained" onClick={handleOpenBulkDialog} disabled={!selectedOutletId}>
          Bulk Add Leave
        </Button>
      </Box>

      {/* Outlet Dropdown */}
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

      {/* Add New Leave */}
      <Box mt={2} mb={2} display="flex" gap={2}>
        <TextField
          label="Leave Date"
          type="date"
          value={newLeaveDate}
          onChange={(e) => setNewLeaveDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Leave Type</InputLabel>
          <Select
            value={newLeaveType}
            onChange={(e) => setNewLeaveType(e.target.value)}
          >
            {leaveTypes.map((lt) => (
              <MenuItem key={lt.id} value={lt.id}>
                {lt.att_type_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Remarks"
          value={newLeaveRemarks}
          onChange={(e) => setNewLeaveRemarks(e.target.value)}
        />

        <Button variant="contained" onClick={handleAddLeave}>
          Add Leave
        </Button>
      </Box>

      {/* Leave DataGrid */}
      <Box style={{ height: 400, width: "100%" }}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : leaves.length > 0 ? (
          <DataGrid rows={leaves} columns={columns} pageSize={5} />
        ) : (
          <Typography p={2}>No leaves found</Typography>
        )}
      </Box>

      {/* --- Bulk Add Leave Dialog --- */}
      <Dialog open={isBulkAddOpen} onClose={handleCloseBulkDialog} fullWidth maxWidth="sm">
        <DialogTitle>Bulk Add Leave Records</DialogTitle>
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
            label="Leave Date"
            type="date"
            fullWidth
            margin="normal"
            value={bulkLeaveDate}
            onChange={(e) => setBulkLeaveDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Leave Type</InputLabel>
            <Select
              value={bulkLeaveType}
              onChange={(e) => setBulkLeaveType(e.target.value)}
            >
              {leaveTypes.map((lt) => (
                <MenuItem key={lt.id} value={lt.id}>
                  {lt.att_type_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Remarks (Optional)"
            fullWidth
            margin="normal"
            value={bulkLeaveRemarks}
            onChange={(e) => setBulkLeaveRemarks(e.target.value)}
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
