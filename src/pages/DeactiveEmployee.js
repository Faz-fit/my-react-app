import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from 'utils/api';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/getallemployees/");
      setEmployees(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const deactivateEmployee = async (employee_id) => {
    if (!window.confirm("Are you sure you want to deactivate this employee?")) {
      return;
    }

    try {
      await api.post(`/api/deactivate-employee/${employee_id}/`, {});
      await fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const columns = [
    { field: "fullname", headerName: "User Name", flex: 1.5, minWidth: 150 },
    { field: "first_name", headerName: "Full Name", flex: 1, minWidth: 120 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        const isActive = params.row.is_active;
        const inactiveDate = params.row.inactive_date;
        return isActive ? (
          <Chip label="Active" color="success" size="small" />
        ) : (
          <Chip
            label={inactiveDate ? `Inactive - ${formatDate(inactiveDate)}` : "Inactive"}
            color="error"
            size="small"
          />
        );
      },
    },
    {
      field: "deactivate",
      headerName: "Actions",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        <Button
          variant="contained"
          color={params.row.is_active ? "error" : "inherit"}
          size="small"
          disabled={!params.row.is_active}
          onClick={() => deactivateEmployee(params.row.employee_id)}
        >
          Deactivate
        </Button>
      ),
    },
  ];

return (
  <Box
    sx={{
      p: 4,
      mt: 4,
      
    
      boxShadow: "none",       // 🧱 remove floating/shadow
      
    }}
  >
    {/* Header Section */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        textTransform: 'uppercase',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#333",
          letterSpacing: 0.5,
          
          display: "inline-block",
          pb: 0.5,
        }}
      >
        Employee Deactivation
      </Typography>
    </Box>

    {/* Loading, Error, or DataGrid */}
    {loading ? (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress sx={{ color: "#e6b904" }} />
      </Box>
    ) : error ? (
      <Typography color="error" align="center" sx={{ mt: 4 }}>
        {error}
      </Typography>
    ) : (
<Box
  sx={{
    height: 500,
    width: "100%",
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "#fff",
  }}
>
  <DataGrid
    rows={employees}
    columns={columns}
    pageSize={10}
    rowsPerPageOptions={[10, 20, 50]}
    disableRowSelectionOnClick
    getRowId={(row) => row.employee_id}
    // ❌ Remove autoHeight to restore scrolling
    sx={{
      border: "none",
      "& .MuiDataGrid-columnHeaders": {
        backgroundColor: "#f9fafb",
        fontWeight: 600,
        color: "#333",
        fontSize: "0.95rem",
      },
      "& .MuiDataGrid-row:hover": {
        backgroundColor: "#fffbe6",
      },
      "& .MuiDataGrid-cell:focus": {
        outline: "none",
      },
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "8px",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#ccc",
        borderRadius: "4px",
      },
    }}
  />
</Box>

    )}
  </Box>
);


}
