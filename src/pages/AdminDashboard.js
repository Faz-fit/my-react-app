import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from 'utils/api';

// Helper function to get the start of the current month
const getStartOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split("T")[0];
};

// Helper function to get today's date
const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

export default function OutletAttendanceReport() {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState("");

  // State for date range
  const [startDate, setStartDate] = useState(getStartOfMonth());
  const [endDate, setEndDate] = useState(getToday());

  const [outletData, setOutletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch outlets data on component mount
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const response = await api.get('/api/user/');
        setOutlets(response.data.outlets);
        if (response.data.outlets && response.data.outlets.length > 0) {
          setSelectedOutletId(response.data.outlets[0].id); // Set default selected outlet
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchOutlets();
  }, []); // Runs only once

  // Fetch outlet attendance data when outletId changes
  useEffect(() => {
    if (!selectedOutletId) return;

    const fetchOutletData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/outletsalldata/${selectedOutletId}/`);
        setOutletData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setOutletData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOutletData();
  }, [selectedOutletId]); // Re-fetch only when outlet changes

  // Transform data into rows for the report
  const transformDataForReport = (data) => {
    if (!data || !data.employees) return [];

    const reportRows = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatTime = (isoString) => {
      if (!isoString) return "-";
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    data.employees.forEach((emp) => {
      // Add attendance records within the date range
      emp.attendances.forEach((att) => {
        const attDate = new Date(att.date);
        if (attDate >= start && attDate <= end) {
          reportRows.push({
            id: att.attendance_id, // Unique ID for each row
            employee_id: emp.employee_id,
            fullname: `${emp.first_name} ${emp.last_name}`,
            date: att.date,
            check_in_time: formatTime(att.check_in_time),
            check_out_time: formatTime(att.check_out_time),
            worked_hours: att.worked_hours ? att.worked_hours.toFixed(2) : "-",
            ot_hours: att.ot_hours ? att.ot_hours.toFixed(2) : "-",
            status: att.status,
          });
        }
      });

      // Add approved leave records within the date range
      emp.leaves.forEach((lv) => {
        const leaveDate = new Date(lv.leave_date);
        // Check if leave is approved and within the date range
        if (lv.status === 'approved' && leaveDate >= start && leaveDate <= end) {
          // Also check if there isn't already an attendance record for this day
          const hasAttendance = emp.attendances.some(att => att.date === lv.leave_date);
          if (!hasAttendance) {
            reportRows.push({
              id: `leave-${lv.leave_refno}`, // Unique ID for leave row
              employee_id: emp.employee_id,
              fullname: `${emp.first_name} ${emp.last_name}`,
              date: lv.leave_date,
              check_in_time: "-",
              check_out_time: "-",
              worked_hours: "-",
              ot_hours: "-",
              status: `On Leave (${lv.leave_type_name})`,
            });
          }
        }
      });
    });

    // Sort rows by date
    return reportRows.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const rows = outletData ? transformDataForReport(outletData) : [];

  const columns = [
    { field: "employee_id", headerName: "Emp ID", width: 90 },
    { field: "fullname", headerName: "Full Name", flex: 1.5, minWidth: 180 },
    { field: "date", headerName: "Date", flex: 1, minWidth: 120 },
    { field: "check_in_time", headerName: "Check In", flex: 1, minWidth: 100 },
    { field: "check_out_time", headerName: "Check Out", flex: 1, minWidth: 100 },
    { field: "worked_hours", headerName: "Worked Hours", flex: 1, minWidth: 120 },
    { field: "ot_hours", headerName: "OT Hours", flex: 1, minWidth: 100 },
    {
      field: "status",
      headerName: "Status",
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => {
        let color = "black";
        if (params.value.startsWith("On Leave")) color = "#E67E22"; // Orange
        if (params.value === "Present") color = "#27AE60"; // Green
        if (params.value === "Half Day") color = "#3498DB"; // Blue
        return <strong style={{ color }}>{params.value}</strong>;
      },
    },
  ];

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3, boxShadow: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            borderBottom: "3px solid #1976d2",
            display: "inline-block",
            pb: 0.5,
          }}
        >
          OUTLETLOG
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: 'center' }}>
          {outlets.length > 0 && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Outlet</InputLabel>
              <Select
                value={selectedOutletId}
                label="Select Outlet"
                onChange={(e) => setSelectedOutletId(e.target.value)}
              >
                {outlets.map((outlet) => (
                  <MenuItem key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      ) : (
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            sx={{
              borderRadius: 2,
              "& .MuiDataGrid-row:hover": { backgroundColor: "#f5f5f5" },
              "& .MuiDataGrid-cell:focus": { outline: "none" },
            }}

          />
        </Box>
      )}
    </Paper>
  );
}