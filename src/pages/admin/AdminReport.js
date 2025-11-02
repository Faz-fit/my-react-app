// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   CircularProgress,
//   Paper,
//   Chip,
//   Tooltip,
//   TextField,
// } from "@mui/material";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import api from 'utils/api';

// // Helper function to get the start of the current month
// const getStartOfMonth = () => {
//   const date = new Date();
//   return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
// };

// // Helper function to get today's date
// const getToday = () => {
//   return new Date().toISOString().split("T")[0];
// };

// export default function EmployeeActivityLog() {
//   const [outlets, setOutlets] = useState([]);
//   const [selectedOutletId, setSelectedOutletId] = useState("all");
//   const [activityData, setActivityData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [startDate, setStartDate] = useState(getStartOfMonth());
//   const [endDate, setEndDate] = useState(getToday());

//   useEffect(() => {
//     const fetchOutlets = async () => {
//       try {
//         const response = await api.get("/api/user/");
//         setOutlets(response.data.outlets || []);
//       } catch (err) {
//         setError(err.message);
//       }
//     };
//     fetchOutlets();
//   }, []);

//   useEffect(() => {
//     const fetchActivityData = async () => {
//       setLoading(true);
//       setError(null);
//       setActivityData([]);

//       if ((!startDate || !endDate) || (selectedOutletId === 'all' && outlets.length === 0)) {
//         setLoading(false);
//         return;
//       }

//       try {
//         let combinedData = { employees: [] };

//         if (selectedOutletId === "all") {
//           // --- FETCH FOR ALL OUTLETS ---
//           const allOutletPromises = outlets.map(outlet => {
//             const url = `/outletsalldata/${outlet.id}/`;
//             const params = { start_date: startDate, end_date: endDate };
//             return api.get(url, { params })
//               .then(res => res.data)
//               .catch(err => {
//                 console.error(`Failed to fetch data for outlet: ${outlet.name}`, err);
//                 return null;
//               });
//           });

//           const allResults = await Promise.all(allOutletPromises);
//           const successfulResults = allResults.filter(data => data !== null);
//           const allEmployees = successfulResults.flatMap(data => data.employees || []);

//           const employeeMap = new Map();
//           allEmployees.forEach(emp => {
//             if (employeeMap.has(emp.employee_id)) {
//               const existingEmp = employeeMap.get(emp.employee_id);
//               existingEmp.attendances = [...(existingEmp.attendances || []), ...(emp.attendances || [])];
//               existingEmp.leaves = [...(existingEmp.leaves || []), ...(emp.leaves || [])];
//             } else {
//               employeeMap.set(emp.employee_id, { ...emp });
//             }
//           });

//           combinedData.employees = Array.from(employeeMap.values());

//         } else {
//           // --- FETCH FOR A SINGLE OUTLET ---
//           const url = `/outletsalldata/${selectedOutletId}/`;
//           const params = { start_date: startDate, end_date: endDate };
//           const response = await api.get(url, { params });
//           combinedData = response.data;
//         }

//         const transformedData = transformDataForActivityLog(combinedData);
//         setActivityData(transformedData);
//       } catch (err) {
//         setError(err.message);
//         setActivityData([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (selectedOutletId !== 'all' || (selectedOutletId === 'all' && outlets.length > 0)) {
//       fetchActivityData();
//     }

//   }, [selectedOutletId, startDate, endDate, outlets]);

//   const transformDataForActivityLog = (data) => {
//     if (!data || !data.employees) return [];
//     const activityLog = [];
//     const formatTime = (isoString) => {
//       if (!isoString) return "-";
//       return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     };
//     data.employees.forEach((emp) => {
//       const employeeName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
//       if (emp.attendances) {
//         emp.attendances.forEach((att) => {
//           let verificationNotes = "-";
//           const notes = [];
//           const checkinUpdate = att.verification_notes?.checkin_update;
//           if (checkinUpdate) {
//             const originalTime = formatTime(checkinUpdate.Original_check_in_time);
//             const newTime = formatTime(checkinUpdate.check_in_time);
//             notes.push(`Check-in updated by user ${checkinUpdate.updated_by} (from ${originalTime} to ${newTime})`);
//           }
//           const checkoutUpdate = att.verification_notes?.checkout_update;
//           if (checkoutUpdate) {
//             const originalTime = formatTime(checkoutUpdate.Original_check_out_time);
//             const newTime = formatTime(checkoutUpdate.check_out_time);
//             notes.push(`Check-out updated by user ${checkoutUpdate.updated_by} (from ${originalTime} to ${newTime})`);
//           }
//           if (notes.length > 0) verificationNotes = notes.join('; ');
//           activityLog.push({
//             id: `att-${att.attendance_id}`, employee_id: emp.employee_id, fullname: employeeName,
//             date: new Date(att.date), eventType: "Attendance", status: att.punchin_verification,
//             check_in_time: formatTime(att.check_in_time), check_out_time: formatTime(att.check_out_time),
//             worked_hours: att.worked_hours ? att.worked_hours.toFixed(2) : "-",
//             ot_hours: att.ot_hours ? att.ot_hours.toFixed(2) : "-",
//             details: att.status, verification_notes: verificationNotes,
//           });
//         });
//       }
//       if (emp.leaves) {
//         emp.leaves.forEach((lv) => {
//           activityLog.push({
//             id: `leave-${lv.leave_refno}`, employee_id: emp.employee_id, fullname: employeeName,
//             date: new Date(lv.leave_date), eventType: "Leave", status: lv.status,
//             check_in_time: "-", check_out_time: "-", worked_hours: "-", ot_hours: "-",
//             details: lv.leave_type_name, verification_notes: "-",
//           });
//         });
//       }
//     });
//     return activityLog.sort((a, b) => new Date(b.date) - new Date(a.date));
//   };

//   const columns = [
//     { field: "employee_id", headerName: "Emp ID", width: 90 },
//     { field: "fullname", headerName: "Full Name", flex: 1.5, minWidth: 180 },
//     { field: "date", headerName: "Date", type: "date", minWidth: 120 },
//     {
//       field: "eventType", headerName: "Event Type", minWidth: 130,
//       renderCell: (params) => (<Chip label={params.value} color={params.value === "Attendance" ? "primary" : "warning"} variant="outlined" size="small" />),
//     },
//     { field: "details", headerName: "Details", flex: 1, minWidth: 120 },
//     { field: "check_in_time", headerName: "Check In", flex: 1, minWidth: 100 },
//     { field: "check_out_time", headerName: "Check Out", flex: 1, minWidth: 100 },
//     { field: "worked_hours", headerName: "Worked Hrs", type: "number", flex: 0.8, minWidth: 100 },
//     {
//       field: "verification_notes", headerName: "Verification Notes", flex: 2, minWidth: 250,
//       renderCell: (params) => (
//         <Tooltip title={params.value} placement="top-start">
//           <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
//             {params.value}
//           </Box>
//         </Tooltip>
//       ),
//     },
//     {
//       field: "status", headerName: "Status", minWidth: 120,
//       renderCell: (params) => {
//         const status = params.value || "";
//         let color = "default";
//         if (["approved", "verified"].includes(status.toLowerCase())) color = "success";
//         if (status.toLowerCase() === "pending") color = "warning";
//         if (status.toLowerCase() === "rejected") color = "error";
//         return <Chip label={status} color={color} size="small" />;
//       },
//     },
//   ];

//   return (
//     <Paper sx={{ p: 3, mt: 3, borderRadius: 3, boxShadow: 3 }}>
//       <Box sx={{ display: "flex", justifyContent: "space-between", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", mb: 3, gap: 2, }}>
//         <Typography variant="h4" sx={{ fontWeight: "bold" }}>Detailed Report</Typography>
//         <Box sx={{ display: "flex", gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
//           <TextField label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 200 }} />
//           <TextField label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 200 }} />
//           <FormControl sx={{ minWidth: 250 }}>
//             <InputLabel>Select Outlet</InputLabel>
//             <Select value={selectedOutletId} label="Select Outlet" onChange={(e) => setSelectedOutletId(e.target.value)}>
//               <MenuItem value="all">All Outlets</MenuItem>
//               {outlets.map((outlet) => (<MenuItem key={outlet.id} value={outlet.id}>{outlet.name}</MenuItem>))}
//             </Select>
//           </FormControl>
//         </Box>
//       </Box>
//       {error && <Typography color="error" align="center" sx={{ my: 4 }}>{error}</Typography>}
//       <Box sx={{ height: 650, width: "100%" }}>
//         <DataGrid
//           rows={activityData}
//           columns={columns}
//           loading={loading}
//           slots={{ toolbar: GridToolbar }}
//           slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
//           initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
//           pageSizeOptions={[10, 25, 50, 100]}
//           disableRowSelectionOnClick
//           sx={{ borderRadius: 2, "& .MuiDataGrid-cell:focus": { outline: "none" } }}
//           showToolbar
//         />
//       </Box>
//     </Paper>
//   );
// }
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import axios from "axios";
import EmployeeAttendanceTable from "../../pages/EmployeeAttendanceTable";

export default function MANReports() {
  // Default date range: last month to today
  const today = new Date();
  const priorMonth = new Date();
  priorMonth.setMonth(today.getMonth() - 1);

  const [userInfo, setUserInfo] = useState(null);
  const [userReport, setUserReport] = useState(null);
  const [selectedOutlet, setSelectedOutlet] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [employeeList, setEmployeeList] = useState([]);
  const [employeeReport, setEmployeeReport] = useState(null);
  const [startDate, setStartDate] = useState(
    priorMonth.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch logged-in user info first
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("No access token found. Please log in first.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://139.59.243.2:8000/api/user/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserInfo(response.data);
      fetchUserReport(response.data.id, token);
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError(err.response?.data?.detail || err.message);
      setLoading(false);
    }
  };

  const fetchUserReport = async (userId, token) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://139.59.243.2:8000/report/employees/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserReport(response.data);
    } catch (err) {
      console.error("Error fetching user report:", err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  // When outlet changes, load employees of that outlet
  const handleOutletChange = (event) => {
    const outletId = event.target.value;
    setSelectedOutlet(outletId);
    setSelectedEmployee("all");
    setEmployeeReport(null); // Clear previous report
    setError(null); // Clear previous error

    if (outletId === "all") {
      setEmployeeList(
        Object.values(userReport.employees_by_outlet).flatMap((o) => o.employees)
      );
    } else if (userReport?.employees_by_outlet[outletId]) {
      setEmployeeList(userReport.employees_by_outlet[outletId].employees);
    } else {
      setEmployeeList([]);
    }
  };

  // Fetch employee report(s)
  const handleFetchEmployee = async () => {
    setLoading(true);
    setError(null);
    setEmployeeReport(null);

    try {
      const token = localStorage.getItem("access_token");
      let employeesToFetch = [];

      if (selectedEmployee === "all") {
        if (selectedOutlet === "all") {
          employeesToFetch = Object.values(userReport.employees_by_outlet)
            .flatMap((o) => o.employees)
            .map((e) => e.employee_id);
        } else {
          employeesToFetch =
            userReport.employees_by_outlet[selectedOutlet]?.employees.map(
              (e) => e.employee_id
            ) || [];
        }
      } else {
        employeesToFetch = [selectedEmployee];
      }

      if (employeesToFetch.length === 0) {
        setError("No employees found for selected outlet.");
        setLoading(false);
        return;
      }

      const allReports = [];

      for (const empId of employeesToFetch) {
        let url = `http://139.59.243.2:8000/report/employee/${empId}`;
        const params = [];
        if (startDate) params.push(`start_date=${startDate}`);
        if (endDate) params.push(`end_date=${endDate}`);
        if (params.length > 0) url += `?${params.join("&")}`;

        try {
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          allReports.push(response.data);
        } catch (err) {
          console.error(`Error fetching report for employee ${empId}:`, err);
          // Continue fetching other employees even if one fails
        }
      }

      console.log("Fetched Reports:", allReports); // Debug log

      if (allReports.length === 0) {
        setError("No report data found for selected employee(s).");
      } else {
        setEmployeeReport(allReports.length === 1 ? allReports[0] : allReports);
        setError(null); // Clear error if data is found
      }
    } catch (err) {
      console.error("Error fetching employee report:", err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Employee Reports
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {userReport && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {/* Outlet Dropdown */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Outlet</InputLabel>
            <Select
              value={selectedOutlet}
              onChange={handleOutletChange}
              label="Outlet"
            >
              <MenuItem value="all">All Outlets</MenuItem>
              {Object.entries(userReport.employees_by_outlet).map(
                ([outletId, outletData]) => (
                  <MenuItem key={outletId} value={outletId}>
                    {outletData.outlet_name}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>

          {/* Employee Dropdown */}
          <FormControl sx={{ minWidth: 250 }} disabled={!selectedOutlet}>
            <InputLabel>Employee</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => {
                setSelectedEmployee(e.target.value);
                setEmployeeReport(null); // Clear previous report
                setError(null); // Clear previous error
              }}
              label="Employee"
            >
              <MenuItem value="all">All Employees</MenuItem>
              {employeeList.map((emp) => (
                <MenuItem key={emp.employee_id} value={emp.employee_id}>
                  {emp.user_first_name} ({emp.fullname})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Range Inputs */}
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ minWidth: 160 }}
          />
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={{ minWidth: 160 }}
          />

          {/* Fetch Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleFetchEmployee}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Fetch Data"}
          </Button>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {employeeReport && !loading && (
        <>
          <Typography variant="h6" sx={{ mt: 3 }}>
            Employee Report
            {startDate && endDate ? ` | ${startDate} → ${endDate}` : ""}
          </Typography>
          <EmployeeAttendanceTable data={employeeReport} />
        </>
      )}
    </Paper>
  );
}