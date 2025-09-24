import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function AttendanceHistory() {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [userDetails, setUserDetails] = useState(null); // Store logged-in user details

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

  // Fetch logged-in user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://139.59.243.2:8000/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user details");
        const data = await res.json();
        setUserDetails(data);  // Store the user details for updated_by
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUserDetails();
  }, []);

  // Fetch employees for selected outlet
  useEffect(() => {
    if (!selectedOutletId) return;
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
    fetchOutletData();
  }, [selectedOutletId]);

  // Update rows when selected employee changes
  useEffect(() => {
    const emp = employees.find((e) => e.employee_id === selectedEmployeeId);
    if (emp) {
      const formattedRows = emp.attendances.map((att) => ({
        id: att.attendance_id,
        date: att.date,
        check_in_time: att.check_in_time || "",
        check_out_time: att.check_out_time || "",
        status: att.status,
        updated_by: userDetails ? userDetails.username : "", // Add the username for updated_by
      }));
      setRows(formattedRows);
    } else setRows([]);
  }, [selectedEmployeeId, employees, userDetails]);

  // Handle attendance update
  const handleAttendanceUpdate = async (attendanceId, updatedCheckIn, updatedCheckOut) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://139.59.243.2:8000/api/attendance/update/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attendance_id: attendanceId,
          check_in_time: updatedCheckIn,
          check_out_time: updatedCheckOut,
          updated_by: userDetails ? userDetails.username : "", // Use the logged-in user as updated_by
        }),
      });
      if (!res.ok) throw new Error("Failed to update attendance");

      const data = await res.json();
      console.log("Attendance updated:", data);
      // After successful update, you can re-fetch the data or update the state
      fetchAttendanceData();
    } catch (err) {
      console.error("Error updating attendance:", err);
      setError(err.message);
    }
  };

  // Fetch attendance data again after an update
  const fetchAttendanceData = async () => {
    const emp = employees.find((e) => e.employee_id === selectedEmployeeId);
    if (emp) {
      const formattedRows = emp.attendances.map((att) => ({
        id: att.attendance_id,
        date: att.date,
        check_in_time: att.check_in_time || "",
        check_out_time: att.check_out_time || "",
        status: att.status,
        updated_by: userDetails ? userDetails.username : "",
      }));
      setRows(formattedRows);
    }
  };

  const columns = [
    { field: "date", headerName: "Date", width: 150 },
    { field: "check_in_time", headerName: "Check-in Time", width: 200, editable: true },
    { field: "check_out_time", headerName: "Check-out Time", width: 200, editable: true },
    { field: "status", headerName: "Status", width: 150 },
    { field: "updated_by", headerName: "Updated By", width: 150 },
  ];

  const handleProcessRowUpdate = (newRow) => {
    const updatedCheckIn = newRow.check_in_time;
    const updatedCheckOut = newRow.check_out_time;

    // Call API to update attendance
    handleAttendanceUpdate(newRow.id, updatedCheckIn, updatedCheckOut);

    return newRow;
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Attendance History
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
    </Box>
  );
}
