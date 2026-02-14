import React, { useEffect, useMemo, useState } from "react";
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
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Stack,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import api from "utils/api";

const API_TZ_OFFSET = "+05:30"; // Sri Lanka

// ✅ date string "2026-02-14" -> "2/14/2026"
const formatDate = (yyyyMmDd) => {
  if (!yyyyMmDd) return "-";
  const s = String(yyyyMmDd);
  // safest: parse yyyy-mm-dd manually
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return s;
  return new Date(y, m - 1, d).toLocaleDateString();
};

// ✅ "2026-02-13T21:19:18.818155+05:30" -> "21:19"
const isoToHHMM = (iso) => {
  if (!iso) return "-";
  const s = String(iso);
  if (s.includes("T") && s.length >= s.indexOf("T") + 6) {
    return s.slice(s.indexOf("T") + 1, s.indexOf("T") + 6);
  }
  if (/^\d{2}:\d{2}/.test(s)) return s.slice(0, 5);
  return s;
};

// ✅ build "YYYY-MM-DDTHH:MM:00+05:30"
const buildLocalIsoWithOffset = (dateStr, hhmm, offset = API_TZ_OFFSET) => {
  if (!dateStr || !hhmm) return null;
  return `${dateStr}T${hhmm}:00${offset}`;
};

// Compare yyyy-mm-dd safely
const ymdToNumber = (ymd) => {
  if (!ymd) return 0;
  const [y, m, d] = String(ymd).split("-").map(Number);
  if (!y || !m || !d) return 0;
  return y * 10000 + m * 100 + d;
};

export default function AttendanceHistory() {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);

  const [rows, setRows] = useState([]);
  const [userDetails, setUserDetails] = useState(null);

  // ✅ Date range state (default: last 7 days)
  const today = new Date();
  const prior = new Date();
  prior.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(prior.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  // Bulk add
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkSelectedEmployees, setBulkSelectedEmployees] = useState([]);
  const [bulkDate, setBulkDate] = useState("");
  const [bulkCheckIn, setBulkCheckIn] = useState("");
  const [bulkCheckOut, setBulkCheckOut] = useState("");

  // Edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [saving, setSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });
  const openToast = (msg, severity = "success") => setToast({ open: true, msg, severity });
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const fetchEmployeesForOutlet = async () => {
    if (!selectedOutletId) return;
    setLoading(true);
    try {
      const response = await api.get(`/outletsalldata/${selectedOutletId}/`);
      const allEmployees = response.data.employees || [];
      setEmployees(allEmployees);

      if (allEmployees.length > 0) {
        const stillExists = allEmployees.some((e) => e.employee_id === selectedEmployeeId);
        setSelectedEmployeeId(stillExists ? selectedEmployeeId : allEmployees[0].employee_id);
      } else {
        setSelectedEmployeeId("");
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
      setPageLoading(true);
      try {
        const response = await api.get("/api/user/");
        const data = response.data;
        setUserDetails(data);

        const userOutlets = data.outlets || [];
        setOutlets(userOutlets);
        if (userOutlets.length > 0) setSelectedOutletId(userOutlets[0].id);
      } catch (err) {
        setError(err.message);
      } finally {
        setPageLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchEmployeesForOutlet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOutletId]);

  // ✅ Build grid rows for selected employee AND apply date range filter
  useEffect(() => {
    const emp = employees.find((e) => e.employee_id === selectedEmployeeId);

    const sNum = ymdToNumber(startDate);
    const eNum = ymdToNumber(endDate);

    if (emp && Array.isArray(emp.attendances)) {
      const filteredAttendances = emp.attendances.filter((att) => {
        const dNum = ymdToNumber(att.date);
        if (!dNum) return false;
        if (sNum && dNum < sNum) return false;
        if (eNum && dNum > eNum) return false;
        return true;
      });

      const formattedRows = filteredAttendances.map((att) => ({
        id: att.attendance_id,
        attendance_id: att.attendance_id,
        date: att.date, // ✅ must be "YYYY-MM-DD"
        check_in_time: att.check_in_time, // ISO
        check_out_time: att.check_out_time, // ISO or null
        status: att.status,
        updated_by: userDetails?.username || "",
      }));

      setRows(formattedRows);
    } else {
      setRows([]);
    }
  }, [selectedEmployeeId, employees, userDetails, startDate, endDate]);

  const handleAttendanceUpdate = async (attendanceId, dateStr, checkInHHMM, checkOutHHMM) => {
    const payload = {
      attendance_id: attendanceId,
      check_in_time: buildLocalIsoWithOffset(dateStr, checkInHHMM),
      check_out_time: buildLocalIsoWithOffset(dateStr, checkOutHHMM),
    };

    await api.post("/api/attendance/update/", payload);
    await fetchEmployeesForOutlet();
  };

  // Edit dialog
  const handleOpenEdit = (row) => {
    setEditRow(row);
    setEditCheckIn(row?.check_in_time ? isoToHHMM(row.check_in_time) : "");
    setEditCheckOut(row?.check_out_time ? isoToHHMM(row.check_out_time) : "");
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditRow(null);
    setEditCheckIn("");
    setEditCheckOut("");
    setSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editRow) return;

    if (!editCheckIn || !editCheckOut) {
      openToast("Please select both check-in and check-out times.", "warning");
      return;
    }
    if (editCheckOut < editCheckIn) {
      openToast("Check-out time cannot be earlier than check-in time.", "warning");
      return;
    }

    try {
      setSaving(true);
      await handleAttendanceUpdate(editRow.attendance_id, editRow.date, editCheckIn, editCheckOut);
      openToast("Attendance updated successfully.", "success");
      handleCloseEdit();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to update attendance";
      openToast(msg, "error");
      setSaving(false);
    }
  };

  // Bulk add
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
      openToast("Please select employees and fill in all date/time fields.", "warning");
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
      openToast(response.data.message || "Bulk add done.", "success");
      handleCloseBulkDialog();
      await fetchEmployeesForOutlet();
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred during the bulk add.";
      openToast(errorMessage, "error");
    }
  };

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.employee_id === selectedEmployeeId),
    [employees, selectedEmployeeId]
  );

  const columns = [
    {
      field: "date",
      headerName: "Date",
      width: 140,
      renderCell: (params) => <span>{formatDate(params.value)}</span>,
    },
    {
      field: "check_in_time",
      headerName: "Check-in",
      width: 140,
      renderCell: (params) => <span>{isoToHHMM(params.value)}</span>,
    },
    {
      field: "check_out_time",
      headerName: "Check-out",
      width: 140,
      renderCell: (params) => <span>{isoToHHMM(params.value)}</span>,
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => {
        const v = params.value || "";
        const color =
          v === "Present" ? "success" : v === "Absent" ? "error" : v === "Late" ? "warning" : "default";
        return <Chip size="small" label={v || "-"} color={color} variant="outlined" />;
      },
    },
    { field: "updated_by", headerName: "Updated By", width: 160 },
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="Edit times">
          <IconButton onClick={() => handleOpenEdit(params.row)} size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
          Attendance History
        </Typography>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchEmployeesForOutlet} disabled={!selectedOutletId || loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" onClick={handleOpenBulkDialog} disabled={!selectedOutletId}>
            Bulk Add Attendance
          </Button>
        </Stack>
      </Box>

      {/* Selectors + Date Range */}
      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={2}>
        {/* Outlet */}
        <FormControl sx={{ minWidth: 220, height: 48 }}>
          <InputLabel id="outlet-label">Outlet</InputLabel>
          <Select
            labelId="outlet-label"
            value={selectedOutletId}
            onChange={(e) => setSelectedOutletId(e.target.value)}
            label="Outlet"
          >
            {outlets.map((outlet) => (
              <MenuItem key={outlet.id} value={outlet.id}>
                {outlet.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Employee */}
        <FormControl sx={{ minWidth: 320, height: 48 }} disabled={!employees.length}>
          <InputLabel id="employee-label">Employee</InputLabel>
          <Select
            labelId="employee-label"
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            label="Employee"
          >
            {employees.map((emp) => (
              <MenuItem key={emp.employee_id} value={emp.employee_id}>
                {emp.first_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ✅ Start / End date */}
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />

        {selectedEmployee && (
          <Chip
            label={`Selected: ${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
            variant="outlined"
          />
        )}
      </Box>

      {/* Grid */}
      <Box mt={2} sx={{ height: 520, width: "100%" }}>
        {pageLoading ? (
          <CircularProgress />
        ) : loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : rows.length > 0 ? (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f9fafb", fontWeight: 800 },
              "& .MuiDataGrid-row:hover": { backgroundColor: "#fffbe6" },
              "& .MuiDataGrid-cell:focus": { outline: "none" },
            }}
          />
        ) : (
          <Typography p={2}>No attendance records found in this date range.</Typography>
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit Attendance</DialogTitle>
        <DialogContent>
          {editRow && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ mb: 2 }}>
                <strong>Date:</strong> {formatDate(editRow.date)}
              </Typography>

              <TextField
                label="Check-in Time"
                type="time"
                fullWidth
                margin="normal"
                value={editCheckIn}
                onChange={(e) => setEditCheckIn(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Check-out Time"
                type="time"
                fullWidth
                margin="normal"
                value={editCheckOut}
                onChange={(e) => setEditCheckOut(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Add Dialog */}
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
                selected
                  .map((id) => {
                    const emp = employees.find((e) => e.employee_id === id);
                    return emp ? `${emp.first_name} ${emp.last_name}` : id;
                  })
                  .join(", ")
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

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => closeToast()}>
        <Alert onClose={() => closeToast()} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
