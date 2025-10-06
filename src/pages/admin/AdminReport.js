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
  Tooltip, // Import Tooltip
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

export default function EmployeeActivityLog() {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOutlets = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://139.59.243.2:8000/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load outlets");
        const data = await res.json();
        setOutlets(data.outlets || []);
        if (data.outlets && data.outlets.length > 0) {
          setSelectedOutletId(data.outlets[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOutlets();
  }, []);

  useEffect(() => {
    if (!selectedOutletId) return;

    const fetchActivityData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `http://139.59.243.2:8000/outletsalldata/${selectedOutletId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error(`Failed to fetch data for outlet ${selectedOutletId}`);
        const data = await response.json();
        const transformedData = transformDataForActivityLog(data);
        setActivityData(transformedData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setActivityData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [selectedOutletId]);

  // **UPDATED and SAFER** function to handle all verification_notes cases
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

          // Safely access check-in update details using optional chaining (?.)
          const checkinUpdate = att.verification_notes?.checkin_update;
          if (checkinUpdate) {
            const originalTime = formatTime(checkinUpdate.Original_check_in_time);
            const newTime = formatTime(checkinUpdate.check_in_time);
            notes.push(`Check-in updated by user ${checkinUpdate.updated_by} (from ${originalTime} to ${newTime})`);
          }

          // Safely access check-out update details
          const checkoutUpdate = att.verification_notes?.checkout_update;
          if (checkoutUpdate) {
            const originalTime = formatTime(checkoutUpdate.Original_check_out_time);
            const newTime = formatTime(checkoutUpdate.check_out_time);
            notes.push(`Check-out updated by user ${checkoutUpdate.updated_by} (from ${originalTime} to ${newTime})`);
          }

          if (notes.length > 0) {
            verificationNotes = notes.join('; ');
          }

          activityLog.push({
            id: `att-${att.attendance_id}`,
            employee_id: emp.employee_id,
            fullname: employeeName,
            date: new Date(att.date),
            eventType: "Attendance",
            status: att.punchin_verification,
            check_in_time: formatTime(att.check_in_time),
            check_out_time: formatTime(att.check_out_time),
            worked_hours: att.worked_hours ? att.worked_hours.toFixed(2) : "-",
            ot_hours: att.ot_hours ? att.ot_hours.toFixed(2) : "-",
            details: att.status,
            verification_notes: verificationNotes,
          });
        });
      }

      if (emp.leaves) {
        emp.leaves.forEach((lv) => {
          activityLog.push({
            id: `leave-${lv.leave_refno}`,
            employee_id: emp.employee_id,
            fullname: employeeName,
            date: new Date(lv.leave_date),
            eventType: "Leave",
            status: lv.status,
            check_in_time: "-",
            check_out_time: "-",
            worked_hours: "-",
            ot_hours: "-",
            details: lv.leave_type_name,
            verification_notes: "-",
          });
        });
      }
    });

    return activityLog.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // **UPDATED** columns with Tooltip for better readability
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
    // { field: "ot_hours", headerName: "OT Hrs", type: "number", flex: 0.8, minWidth: 90 },
    {
      field: "verification_notes",
      headerName: "Verification Notes",
      flex: 2,
      minWidth: 250,
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
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Employee Activity Log</Typography>
        {outlets.length > 0 && (
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Select Outlet</InputLabel>
            <Select value={selectedOutletId} label="Select Outlet" onChange={(e) => setSelectedOutletId(e.target.value)}>
              {outlets.map((outlet) => (<MenuItem key={outlet.id} value={outlet.id}>{outlet.name}</MenuItem>))}
            </Select>
          </FormControl>
        )}
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