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
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from "utils/api";

export default function DailyOutletAttendance() {
  const theme = useTheme();

  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [outletData, setOutletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const response = await api.get("/api/user/");
        const userOutlets = response.data.outlets || [];
        setOutlets(userOutlets);
        if (userOutlets.length > 0) setSelectedOutletId(userOutlets[0].id);
      } catch (err) {
        setError(err.message || "Failed to fetch outlets");
      }
    };
    fetchOutlets();
  }, []);

  useEffect(() => {
    if (!selectedOutletId) return;

    const fetchOutletData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/outletsalldata/${selectedOutletId}/`);
        setOutletData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch attendance data");
        setOutletData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOutletData();
  }, [selectedOutletId, selectedDate]);

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const rows = outletData
    ? outletData.employees.map((emp) => {
        const todaysAttendance = emp.attendances.find(
          (att) => att.date === selectedDate
        );
        const todaysLeave = emp.leaves.find(
          (lv) => lv.leave_date === selectedDate && lv.status === "approved"
        );

        let status = "Absent";
        let checkIn = "-";
        let checkOut = "-";

        if (todaysAttendance) {
          status = "Present";
          checkIn = formatTime(todaysAttendance.check_in_time);
          checkOut = formatTime(todaysAttendance.check_out_time);
        } else if (todaysLeave) {
          status = `On Leave (${todaysLeave.leave_type_name})`;
        }

        return {
          id: emp.employee_id,
          employee_id: emp.employee_id,
          fullname: emp.first_name + (emp.last_name ? ` ${emp.last_name}` : ""),
          check_in_time: checkIn,
          check_out_time: checkOut,
          status,
        };
      })
    : [];

  const columns = [
    {
      field: "employee_id",
      headerName: "ID",
      width: 90,
      headerAlign: "center",
      align: "center",
      sortable: false,
    },
    {
      field: "fullname",
      headerName: "Full Name",
      flex: 1.8,
      minWidth: 180,
      sortable: false,
    },
    {
      field: "check_in_time",
      headerName: "Check In",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
      sortable: false,
    },
    {
      field: "check_out_time",
      headerName: "Check Out",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
      sortable: false,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1.3,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        let color = theme.palette.error.main; // Red for Absent
        if (params.value.startsWith("On Leave")) color = theme.palette.warning.main;
        if (params.value === "Present") color = theme.palette.success.main;

        return (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color,
              whiteSpace: "nowrap",
            }}
          >
            {params.value}
          </Typography>
        );
      },
    },
  ];

  return (
    <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mt: 4,
            maxWidth: 1200,
            mx: 'auto',
            bgcolor: 'transparent',
            boxSizing: 'border-box',
          }}
        >
      {/* Header and Filters */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            textTransform:'uppercase',
            pb: 0.5,
            userSelect: "none",
          }}
        >
          Outlet Attendance Log
        </Typography>

<Box
  sx={{
    display: "flex",
    gap: 3,
    flexWrap: "wrap",
    width: { xs: "100%", sm: "auto" },
    alignItems: "center",
  }}
>
  {outlets.length > 1 && (
    <FormControl
      size="medium"
      variant="outlined"
      sx={{
        minWidth: 220,
        maxWidth: 300,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: "0 2px 6px rgb(0 0 0 / 0.1)",
        height: 48,           // Fix height
        "& .MuiOutlinedInput-root": {
          height: "100%",    // Make inner input take full height
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
            height: "100%",  // make select input fill container height
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            fontWeight: 600,
            fontSize: "1rem",
          },
        },
      }}
    >
      <InputLabel id="outlet-select-label">Select Outlet</InputLabel>
      <Select
        labelId="outlet-select-label"
        value={selectedOutletId}
        onChange={(e) => setSelectedOutletId(e.target.value)}
        label="Select Outlet"
        MenuProps={{
          PaperProps: {
            sx: { borderRadius: 2 },
          },
        }}
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
    label="Select Date"
    type="date"
    size="medium"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    sx={{
      minWidth: 180,
      maxWidth: 220,
      bgcolor: "background.paper",
      borderRadius: 2,
      boxShadow: "0 2px 6px rgb(0 0 0 / 0.1)",
      height: 48,            // Fix height
      "& .MuiOutlinedInput-root": {
        height: "100%",     // Fill height
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
        "& input": {
          height: "100%",   // Make input fill height
          padding: "12.5px 14px", // match MUI default vertical padding for inputs
          fontWeight: 600,
          fontSize: "1rem",
          boxSizing: "border-box",
        },
      },
    }}
  />
</Box>


      </Box>

      {/* Content */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 360,
          }}
        >
          <CircularProgress size={36} />
        </Box>
      ) : error ? (
        <Typography
          color="error"
          align="center"
          sx={{ mt: 4, fontWeight: 600, fontSize: 16 }}
        >
          {error}
        </Typography>
      ) : (
        <Box sx={{ height: 520, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={7}
            rowsPerPageOptions={[5, 7, 10, 20]}
            disableSelectionOnClick
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              fontSize: 14,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: theme.palette.action.hover,
                fontWeight: 600,
                color: theme.palette.text.primary,
                minHeight: 40,
                maxHeight: 40,
                userSelect: "none",
              },
              "& .MuiDataGrid-cell": {
                py: 1,
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: theme.palette.action.selected,
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.action.hover,
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
}
