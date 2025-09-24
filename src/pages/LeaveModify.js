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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

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

  // Fetch outlets
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://139.59.243.2:8000/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load outlets");
        const data = await res.json();
        setOutlets(data.outlets);
        if (data.outlets.length > 0) setSelectedOutletId(data.outlets[0].id);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchOutlets();
  }, []);

  // Fetch employees for selected outlet
  useEffect(() => {
    if (!selectedOutletId) return;
    fetchOutletData();
  }, [selectedOutletId]);

  const fetchOutletData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `http://139.59.243.2:8000/outletsalldata/${selectedOutletId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch outlet data");
      const outletData = await res.json();
      const allEmployees = outletData.employees || [];
      setEmployees(allEmployees);
      if (allEmployees.length > 0)
        setSelectedEmployeeId(allEmployees[0].employee_id);
      setError(null);
    } catch (err) {
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave types
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          "http://139.59.243.2:8000/api/leavetypes/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch leave types");
        const data = await res.json();
        setLeaveTypes(data.filter((lt) => lt.active));
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

  // 🔄 Updated function to POST leave to backend
  const handleAddLeave = async () => {
    if (!newLeaveDate || !newLeaveType || !selectedEmployeeId) {
      alert("Please fill all fields.");
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch("http://139.59.243.2:8000/api/attendance/addleave/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee: selectedEmployeeId,
          leave_date: newLeaveDate,
          leave_type: newLeaveType,
          remarks: newLeaveRemarks,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.success === false) {
        alert(result.error || "Failed to add leave.");
        return;
      }

      alert("Leave added successfully.");

      // Refresh employee data to get updated leave list
      await fetchOutletData();

      // Reset input fields
      setNewLeaveDate("");
      setNewLeaveType("");
      setNewLeaveRemarks("");
    } catch (error) {
      console.error("Error adding leave:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Leave Management
      </Typography>

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
    </Box>
  );
}
