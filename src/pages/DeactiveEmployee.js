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
import axios from "axios";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(
        "http://139.59.243.2:8000/api/getallemployees/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    if (!window.confirm("Are you sure you want to deactivate this employee?")) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `http://139.59.243.2:8000/api/deactivate-employee/${employee_id}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3, boxShadow: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
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
          EMPLOYEE DEACTIVATION
        </Typography>
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
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={employees}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            disableRowSelectionOnClick
            getRowId={(row) => row.employee_id}
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
