import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  Grid,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import api from 'utils/api';

// Detail Panel Component: Renders the individual records when a row is expanded.
const DetailPanelContent = ({ row }) => {
  const { subRows } = row;
  if (!subRows || subRows.length === 0) return null;

  const formatTime = (isoString) =>
    isoString
      ? new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "-";

  return (
    <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0", backgroundColor: "#fafafa" }}>
      <Typography variant="h6" gutterBottom component="div">
        Individual Records
      </Typography>
      {subRows.map((record) => (
        <Paper key={`detail-${record.attendance_id}`} variant="outlined" sx={{ p: 2, mb: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Typography variant="body2">
                <strong>Status:</strong> {record.status}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2">
                <strong>Check In:</strong> {formatTime(record.check_in_time)}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2">
                <strong>Check Out:</strong> {formatTime(record.check_out_time)}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2">
                <strong>Worked Hrs:</strong> {Number(record.worked_hours || 0).toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};

export default function EmployeeActivityLog() {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the list of available outlets on component mount
  useEffect(() => {
    const fetchOutlets = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/user/");
        const userOutlets = response.data.outlets || [];
        setOutlets(userOutlets);

        if (userOutlets.length > 0) {
          setSelectedOutletId(userOutlets[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOutlets();
  }, []);

  // Fetch data for the selected outlet
  useEffect(() => {
    if (!selectedOutletId) return;

    const fetchActivityData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/outletsalldata/${selectedOutletId}/`);
        const transformedData = transformDataForActivityLog(response.data);
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

  // Transformer function with all features
  const transformDataForActivityLog = (data) => {
    if (!data || !data.employees) return [];

    const activityLog = [];
    const groupedAttendance = {};
    const parseTime = (isoString) => isoString ? new Date(isoString) : null;

    data.employees.forEach((emp) => {
      const employeeName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim();

      if (emp.attendances) {
        emp.attendances.forEach((att) => {
          const key = `${emp.employee_id}-${att.date}`;
          if (!groupedAttendance[key]) {
            groupedAttendance[key] = {
              employee_id: emp.employee_id,
              fullname: employeeName,
              date: new Date(att.date),
              records: [],
            };
          }
          groupedAttendance[key].records.push(att);
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
            details: lv.leave_type_name,
            check_in_time: "-",
            check_out_time: "-",
            worked_hours: "-",
            verification_notes: "-",
            consolidation_summary: "Single Event",
          });
        });
      }
    });

    for (const key in groupedAttendance) {
      const group = groupedAttendance[key];
      const { records } = group;

      if (records.length === 1) {
        const att = records[0];
        activityLog.push({
          id: `att-${att.attendance_id}`,
          employee_id: group.employee_id,
          fullname: group.fullname,
          date: group.date,
          eventType: "Attendance",
          status: att.punchin_verification,
          details: att.status,
          check_in_time: formatTime(att.check_in_time),
          check_out_time: formatTime(att.check_out_time),
          worked_hours: att.worked_hours ? Number(att.worked_hours).toFixed(2) : "-",
          verification_notes: formatVerificationNotes(att.verification_notes),
          consolidation_summary: "Single Event",
        });
      } else {
        const checkInTimes = records.map((r) => parseTime(r.check_in_time)).filter(Boolean);
        const checkOutTimes = records.map((r) => parseTime(r.check_out_time)).filter(Boolean);
        const earliestCheckIn = checkInTimes.length ? new Date(Math.min(...checkInTimes)) : null;
        const latestCheckOut = checkOutTimes.length ? new Date(Math.max(...checkOutTimes)) : null;
        const totalWorkedHours = records.reduce((sum, r) => sum + (Number(r.worked_hours) || 0), 0);
        const allDetails = records.map((r) => r.status).join(", ");
        const allVerificationNotes = records
          .map((r) => formatVerificationNotes(r.verification_notes))
          .filter((n) => n !== "-")
          .join("; ");

        const summaryParts = [
          `Consolidated ${records.length} records.`,
          `Earliest Check-in: ${formatTime(earliestCheckIn)}.`,
          `Latest Check-out: ${formatTime(latestCheckOut)}.`,
          `Sum of Worked Hours: ${totalWorkedHours.toFixed(2)} hrs.`,
        ];

        activityLog.push({
          id: `group-${key}`,
          employee_id: group.employee_id,
          fullname: group.fullname,
          date: group.date,
          eventType: "Attendance",
          status: "Multiple",
          details: allDetails,
          check_in_time: formatTime(earliestCheckIn),
          check_out_time: formatTime(latestCheckOut),
          worked_hours: totalWorkedHours.toFixed(2),
          verification_notes: allVerificationNotes || "-",
          consolidation_summary: summaryParts.join(" "),
          subRows: records,
        });
      }
    }

    return activityLog.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const formatTime = (isoString) =>
    isoString ? new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";

  const formatVerificationNotes = (notesObj) => {
    if (!notesObj || Object.keys(notesObj).length === 0) return "-";
    const notes = [];
    if (notesObj.checkin_update) notes.push(`Check-in updated by ${notesObj.checkin_update.updated_by}`);
    if (notesObj.checkout_update) notes.push(`Check-out updated by ${notesObj.checkout_update.updated_by}`);
    return notes.join("; ") || "-";
  };

  const columns = [
    { field: "employee_id", headerName: "Emp ID", width: 90 },
    { field: "fullname", headerName: "Full Name", flex: 1.5, minWidth: 180 },
    { field: "date", headerName: "Date", type: "date", minWidth: 120 },
    {
      field: "eventType", headerName: "Event Type", minWidth: 130, renderCell: (params) => (
        <Chip label={params.value} color={params.value === "Attendance" ? "primary" : "warning"} variant="outlined" size="small" />
      )
    },
    { field: "check_in_time", headerName: "Time In", flex: 1, minWidth: 120 },
    { field: "check_out_time", headerName: "Time Out", flex: 1, minWidth: 120 },
    { field: "worked_hours", headerName: "Total Worked Hrs", type: "number", flex: 1, minWidth: 150 },
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
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Employee Activity Log
        </Typography>

        {outlets.length > 0 && (
          <FormControl sx={{ minWidth: 250 }}>
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
      </Box>

      {error && (
        <Typography color="error" align="center" sx={{ my: 4 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={activityData}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          getDetailPanelHeight={({ row }) => (row.subRows ? "auto" : 0)}
          getDetailPanelContent={({ row }) => <DetailPanelContent row={row} />}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{
            borderRadius: 2,
            "& .MuiDataGrid-cell:focus": { outline: "none" },
          }}
          showToolbar
        />
      </Box>
    </Paper>
  );
}
