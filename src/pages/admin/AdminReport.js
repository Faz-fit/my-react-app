import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
  Chip,
  Tooltip,
  TextField,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

// Helper function to get the start of the current month
const getStartOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
};

// Helper function to get today's date
const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

export default function EmployeeActivityLog() {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState("all");
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(getStartOfMonth());
  const [endDate, setEndDate] = useState(getToday());

  useEffect(() => {
    const fetchOutlets = async () => {
      // Don't set loading here as the main useEffect will handle it
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://139.59.243.2:8000/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load outlets");
        const data = await res.json();
        setOutlets(data.outlets || []);
      } catch (err) {
        setError(err.message);
      }
      // No setLoading(false) here, let the main data fetch handle it
    };
    fetchOutlets();
  }, []);

  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      setError(null);
      setActivityData([]); // Clear previous data on new fetch

      if (!startDate || !endDate || outlets.length === 0) {
        if (selectedOutletId !== 'all') { // For single outlet, outlets list isn't strictly needed to start
           // proceed
        } else {
            setLoading(false);
            return;
        }
      }

      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        let combinedData = { employees: [] };

        if (selectedOutletId === "all") {
          // --- FETCH FOR ALL OUTLETS ---
          // Create an array of fetch promises, one for each outlet
          const allOutletPromises = outlets.map(outlet => {
            const url = `http://139.59.243.2:8000/outletsalldata/${outlet.id}/?start_date=${startDate}&end_date=${endDate}`;
            return fetch(url, { headers }).then(res => {
              if (!res.ok) {
                console.error(`Failed to fetch data for outlet: ${outlet.name}`);
                return null; // Return null for failed requests to not break Promise.all
              }
              return res.json();
            });
          });

          // Wait for all fetches to complete
          const allResults = await Promise.all(allOutletPromises);

          // Filter out any failed requests and combine the employee data
          const successfulResults = allResults.filter(data => data !== null);
          const allEmployees = successfulResults.flatMap(data => data.employees || []);
          
          // Merge data for employees who might appear in multiple outlets
          const employeeMap = new Map();
          allEmployees.forEach(emp => {
            if (employeeMap.has(emp.employee_id)) {
              const existingEmp = employeeMap.get(emp.employee_id);
              existingEmp.attendances = [...(existingEmp.attendances || []), ...(emp.attendances || [])];
              existingEmp.leaves = [...(existingEmp.leaves || []), ...(emp.leaves || [])];
            } else {
              employeeMap.set(emp.employee_id, { ...emp });
            }
          });
          
          combinedData.employees = Array.from(employeeMap.values());

        } else {
          // --- FETCH FOR A SINGLE OUTLET ---
          const url = `http://139.59.243.2:8000/outletsalldata/${selectedOutletId}/?start_date=${startDate}&end_date=${endDate}`;
          const response = await fetch(url, { headers });
          if (!response.ok) {
            throw new Error(`Failed to fetch data for the selected outlet`);
          }
          combinedData = await response.json();
        }

        const transformedData = transformDataForActivityLog(combinedData);
        setActivityData(transformedData);
      } catch (err) {
        setError(err.message);
        setActivityData([]);
      } finally {
        setLoading(false);
      }
    };

    // Run fetch if a single outlet is selected, or if 'all' is selected and the outlets list has loaded
    if (selectedOutletId !== 'all' || (selectedOutletId === 'all' && outlets.length > 0)) {
        fetchActivityData();
    }

  }, [selectedOutletId, startDate, endDate, outlets]); // outlets is now a dependency


  const transformDataForActivityLog = (data) => {
    if (!data || !data.employees) return [];
    const activityLog = [];
    const formatTime = (isoString) => {
        if (!isoString) return "-";
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    data.employees.forEach((emp) => {
      const employeeName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
      if (emp.attendances) {
        emp.attendances.forEach((att) => {
          let verificationNotes = "-";
          const notes = [];
          const checkinUpdate = att.verification_notes?.checkin_update;
          if (checkinUpdate) {
            const originalTime = formatTime(checkinUpdate.Original_check_in_time);
            const newTime = formatTime(checkinUpdate.check_in_time);
            notes.push(`Check-in updated by user ${checkinUpdate.updated_by} (from ${originalTime} to ${newTime})`);
          }
          const checkoutUpdate = att.verification_notes?.checkout_update;
          if (checkoutUpdate) {
            const originalTime = formatTime(checkoutUpdate.Original_check_out_time);
            const newTime = formatTime(checkoutUpdate.check_out_time);
            notes.push(`Check-out updated by user ${checkoutUpdate.updated_by} (from ${originalTime} to ${newTime})`);
          }
          if (notes.length > 0) verificationNotes = notes.join('; ');
          activityLog.push({
            id: `att-${att.attendance_id}`, employee_id: emp.employee_id, fullname: employeeName,
            date: new Date(att.date), eventType: "Attendance", status: att.punchin_verification,
            check_in_time: formatTime(att.check_in_time), check_out_time: formatTime(att.check_out_time),
            worked_hours: att.worked_hours ? att.worked_hours.toFixed(2) : "-",
            ot_hours: att.ot_hours ? att.ot_hours.toFixed(2) : "-",
            details: att.status, verification_notes: verificationNotes,
          });
        });
      }
      if (emp.leaves) {
        emp.leaves.forEach((lv) => {
          activityLog.push({
            id: `leave-${lv.leave_refno}`, employee_id: emp.employee_id, fullname: employeeName,
            date: new Date(lv.leave_date), eventType: "Leave", status: lv.status,
            check_in_time: "-", check_out_time: "-", worked_hours: "-", ot_hours: "-",
            details: lv.leave_type_name, verification_notes: "-",
          });
        });
      }
    });
    return activityLog.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const columns = [
    { field: "employee_id", headerName: "Emp ID", width: 90 },
    { field: "fullname", headerName: "Full Name", flex: 1.5, minWidth: 180 },
    { field: "date", headerName: "Date", type: "date", minWidth: 120 },
    {
      field: "eventType", headerName: "Event Type", minWidth: 130,
      renderCell: (params) => (<Chip label={params.value} color={params.value === "Attendance" ? "primary" : "warning"} variant="outlined" size="small"/>),
    },
    { field: "details", headerName: "Details", flex: 1, minWidth: 120 },
    { field: "check_in_time", headerName: "Check In", flex: 1, minWidth: 100 },
    { field: "check_out_time", headerName: "Check Out", flex: 1, minWidth: 100 },
    { field: "worked_hours", headerName: "Worked Hrs", type: "number", flex: 0.8, minWidth: 100 },
    {
      field: "verification_notes", headerName: "Verification Notes", flex: 2, minWidth: 250,
      renderCell: (params) => (
        <Tooltip title={params.value} placement="top-start">
          <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "status", headerName: "Status", minWidth: 120,
      renderCell: (params) => {
        const status = params.value || "";
        let color = "default";
        if (["approved", "verified"].includes(status.toLowerCase())) color = "success";
        if (status.toLowerCase() === "pending") color = "warning";
        if (status.toLowerCase() === "rejected") color = "error";
        return <Chip label={status} color={color} size="small" />;
      },
    },
  ];

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3, boxShadow: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", mb: 3, gap: 2, }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Detailed Report</Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <TextField label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 200 }} />
          <TextField label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 200 }} />
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Select Outlet</InputLabel>
            <Select value={selectedOutletId} label="Select Outlet" onChange={(e) => setSelectedOutletId(e.target.value)}>
              <MenuItem value="all">All Outlets</MenuItem>
              {outlets.map((outlet) => (<MenuItem key={outlet.id} value={outlet.id}>{outlet.name}</MenuItem>))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      {error && <Typography color="error" align="center" sx={{ my: 4 }}>{error}</Typography>}
      <Box sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={activityData}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{ borderRadius: 2, "& .MuiDataGrid-cell:focus": { outline: "none" } }}
          showToolbar
        />
      </Box>
    </Paper>
  );
}