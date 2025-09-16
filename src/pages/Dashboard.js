import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

export default function AdminDashboard() {
  const [outletData, setOutletData] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownCategory, setDrillDownCategory] = useState("");
  const [drillDownEmployees, setDrillDownEmployees] = useState([]);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchUserOutlets = async () => {
      try {
        const res = await fetch("http://139.59.243.2:8000/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOutlets(data.outlets);
        if (data.outlets.length > 0) setSelectedOutletId(data.outlets[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserOutlets();
  }, [token]);

  useEffect(() => {
    if (!selectedOutletId) return;
    const fetchOutletData = async () => {
      try {
        const res = await fetch(
          `http://139.59.243.2:8000/outletsalldata/${selectedOutletId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setOutletData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOutletData();
  }, [selectedOutletId, token]);

  const today = new Date().toISOString().slice(0, 10);

  const outletSummary = useMemo(() => {
    if (!outletData)
      return {
        total: 0,
        present: 0,
        onLeave: 0,
        absent: 0,
        leavesPending: 0,
        leavesApproved: 0,
        leavesRejected: 0,
        empStatus: {},
      };

    let present = 0,
      onLeave = 0,
      absent = 0,
      leavesPending = 0,
      leavesApproved = 0,
      leavesRejected = 0;
    let empStatus = { present: [], onLeave: [], absent: [] };

    outletData.employees.forEach((emp) => {
      const todayAttendance = emp.attendances.filter((a) => a.date === today);
      const approvedLeaves = emp.leaves.filter(
        (l) => l.status === "approved" && l.leave_date === today
      );

      if (todayAttendance.length > 0) {
        present++;
        empStatus.present.push(emp.fullname);
      } else if (approvedLeaves.length > 0) {
        onLeave++;
        empStatus.onLeave.push(emp.fullname);
      } else {
        absent++;
        empStatus.absent.push(emp.fullname);
      }

      leavesPending += emp.leaves.filter(
        (l) => l.status === "pending" && l.leave_date === today
      ).length;
      leavesApproved += approvedLeaves.length;
      leavesRejected += emp.leaves.filter(
        (l) => l.status === "rejected" && l.leave_date === today
      ).length;
    });

    return {
      total: outletData.employees.length,
      present,
      onLeave,
      absent,
      leavesPending,
      leavesApproved,
      leavesRejected,
      empStatus,
    };
  }, [outletData, today]);

  const pieData = [
    { name: "Present", value: outletSummary.present },
    { name: "On Leave", value: outletSummary.onLeave },
    { name: "Absent", value: outletSummary.absent },
  ];
  const COLORS = ["#4caf50", "#2196f3", "#f44336"];

  const handlePieClick = (data, index) => {
    const category = data.name.toLowerCase().replace(" ", "");
    setDrillDownCategory(data.name);
    setDrillDownEmployees(outletSummary.empStatus[category]);
    setDrillDownOpen(true);
  };

  const barData = useMemo(() => {
    if (!outletData) return [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();

    return last7Days.map((date) => {
      let present = 0,
        onLeave = 0,
        absent = 0;
      outletData.employees.forEach((emp) => {
        const todayAttendance = emp.attendances.filter(
          (a) => a.date === date
        );
        const approvedLeaves = emp.leaves.filter(
          (l) => l.status === "approved" && l.leave_date === date
        );
        if (todayAttendance.length > 0) present++;
        else if (approvedLeaves.length > 0) onLeave++;
        else absent++;
      });
      return { date, present, onLeave, absent };
    });
  }, [outletData]);

  if (!outletData) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Outlet Selector */}
      <Paper
        sx={{
          padding: 2,
          marginBottom: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h5" fontWeight="bold">
              {outletData.name} Dashboard
            </Typography>
            <Typography variant="subtitle1">
              Total Employees: {outletSummary.total}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="outlet-select-label">Select Outlet</InputLabel>
              <Select
                labelId="outlet-select-label"
                value={selectedOutletId || ""}
                onChange={(e) => setSelectedOutletId(e.target.value)}
              >
                {outlets.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts Row */}
      <Grid container spacing={3}>
        {/* Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 2, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Today's Attendance
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                  onClick={handlePieClick}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index]}
                      cursor="pointer"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ padding: 2, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Attendance Trend (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#4caf50" />
                <Bar dataKey="onLeave" fill="#2196f3" />
                <Bar dataKey="absent" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Leave Summary */}
        <Grid item xs={12}>
          <Paper sx={{ padding: 2, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Leave Summary
            </Typography>
            <Typography>Approved Leaves Today: {outletSummary.leavesApproved}</Typography>
            <Typography>Pending Leaves Today: {outletSummary.leavesPending}</Typography>
            <Typography>Rejected Leaves Today: {outletSummary.leavesRejected}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Drill Down Dialog */}
      <Dialog open={drillDownOpen} onClose={() => setDrillDownOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Employees - {drillDownCategory}
          <IconButton
            aria-label="close"
            onClick={() => setDrillDownOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {drillDownEmployees.length > 0 ? (
              drillDownEmployees.map((name, idx) => (
                <ListItem key={idx}>
                  <ListItemText primary={name} />
                </ListItem>
              ))
            ) : (
              <Typography>No employees in this category today.</Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
