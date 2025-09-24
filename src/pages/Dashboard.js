import React, { useEffect, useState, useMemo } from "react";
import {
  Avatar,
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
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import EventBusyIcon from "@mui/icons-material/EventBusy";
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

// --- StatCard Component ---
const StatCard = ({ title, value, icon, color, onViewClick }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRadius: 4,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      height: '160px', // Fixed height
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
      },
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
      </Box>
      <Avatar sx={{ bgcolor: color, color: '#fff', width: 56, height: 56 }}>
        {icon}
      </Avatar>
    </Box>
    {onViewClick && (
      <Button
        onClick={onViewClick}
        size="small"
        sx={{
          alignSelf: 'flex-start',
          mt: 2,
          fontWeight: 'bold',
          textTransform: 'none',
          color: 'primary.main',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        View Details
      </Button>
    )}
  </Paper>
);

export default function AdminDashboard() {
  const [outletData, setOutletData] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownCategory, setDrillDownCategory] = useState("");
  const [drillDownEmployees, setDrillDownEmployees] = useState([]);

  const [isListDialogOpen, setListDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogEmployees, setDialogEmployees] = useState([]);

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
        empStatus: { present: [], onleave: [], absent: [] },
      };

    let present = 0, onLeave = 0, absent = 0, leavesPending = 0, leavesApproved = 0, leavesRejected = 0;
    let empStatus = { present: [], onleave: [], absent: [] };

    outletData.employees.forEach((emp) => {
      const todayAttendance = emp.attendances.filter((a) => a.date === today);
      const approvedLeaves = emp.leaves.filter((l) => l.status === "approved" && l.leave_date === today);

      if (todayAttendance.length > 0) {
        present++;
        empStatus.present.push(emp);
      } else if (approvedLeaves.length > 0) {
        onLeave++;
        empStatus.onleave.push(emp);
      } else {
        absent++;
        empStatus.absent.push(emp);
      }

      leavesPending += emp.leaves.filter((l) => l.status === "pending" && l.leave_date === today).length;
      leavesApproved += approvedLeaves.length;
      leavesRejected += emp.leaves.filter((l) => l.status === "rejected" && l.leave_date === today).length;
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

  const handlePieClick = (data) => {
    const category = data.name.toLowerCase().replace(" ", "");
    setDrillDownCategory(data.name);
    const employeeNames = (outletSummary.empStatus[category] || []).map(emp => emp.fullname);
    setDrillDownEmployees(employeeNames);
    setDrillDownOpen(true);
  };

  const handleViewDetailsClick = (category) => {
    let employees = [], title = "";
    switch (category) {
      case "Total":
        title = "All Employees";
        employees = outletData.employees;
        break;
      case "Present":
        title = "Present Employees";
        employees = outletSummary.empStatus.present;
        break;
      case "Absent":
        title = "Absent Employees";
        employees = outletSummary.empStatus.absent;
        break;
      case "On Leave":
        title = "Employees On Leave";
        employees = outletSummary.empStatus.onleave;
        break;
      default: return;
    }
    setDialogTitle(title);
    setDialogEmployees(employees);
    setListDialogOpen(true);
  };

  const barData = useMemo(() => {
    if (!outletData) return [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();

    return last7Days.map((date) => {
      let present = 0, onLeave = 0, absent = 0;
      outletData.employees.forEach((emp) => {
        const hasAttendance = emp.attendances.some((a) => a.date === date);
        const onApprovedLeave = emp.leaves.some((l) => l.status === "approved" && l.leave_date === date);
        if (hasAttendance) present++;
        else if (onApprovedLeave) onLeave++;
        else absent++;
      });
      return { date, present, onLeave, absent };
    });
  }, [outletData]);

  if (!outletData) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ width: "100%", p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            {outletData.name} Dashboard
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel id="outlet-select-label">Select Outlet</InputLabel>
            <Select
              labelId="outlet-select-label"
              value={selectedOutletId || ""}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              label="Select Outlet"
              sx={{ backgroundColor: '#fff' }}
            >
              {outlets.map((o) => (
                <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Stat Cards Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={outletSummary.total}
            color="#637381"
            icon={<GroupIcon />}
            onViewClick={() => handleViewDetailsClick("Total")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Present Today"
            value={outletSummary.present}
            color="#22c55e"
            icon={<CheckCircleOutlineIcon />}
            onViewClick={() => handleViewDetailsClick("Present")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Absent Today"
            value={outletSummary.absent}
            color="#ef4444"
            icon={<HighlightOffIcon />}
            onViewClick={() => handleViewDetailsClick("Absent")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="On Approved Leave"
            value={outletSummary.onLeave}
            color="#3b82f6"
            icon={<EventBusyIcon />}
            onViewClick={() => handleViewDetailsClick("On Leave")}
          />
        </Grid>
      </Grid>

      {/* Charts & Leave Requests Row */}
      <Grid container spacing={3}>
        {/* Today's Attendance Pie Chart */}
      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 2,
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            height: 300,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Today's Attendance
          </Typography>

          <Box sx={{ flexGrow: 1, px: 2, pb: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius="80%"
                  label
                  onClick={handlePieClick}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]} // Safe array access
                      cursor="pointer"
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
        {/* Attendance Trend Bar Chart */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              height: '300px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Attendance Trend (Last 7 Days)
            </Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="date" tick={false} />

                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" name="Present" fill="#4caf50" stackId="a" />
                  <Bar dataKey="onLeave" name="On Leave" fill="#2196f3" stackId="a" />
                  <Bar dataKey="absent" name="Absent" fill="#f44336" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Today's Leave Requests */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              height: '300px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Today's Leave Requests
            </Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center' }}>
              <Typography>✅ Approved: {outletSummary.leavesApproved}</Typography>
              <Typography>⏳ Pending Approval: {outletSummary.leavesPending}</Typography>
              <Typography>❌ Rejected: {outletSummary.leavesRejected}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <Dialog open={drillDownOpen} onClose={() => setDrillDownOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Employees - {drillDownCategory}
          <IconButton aria-label="close" onClick={() => setDrillDownOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
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
              <Typography>No employees in this category.</Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={isListDialogOpen} onClose={() => setListDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogTitle}
          <IconButton aria-label="close" onClick={() => setListDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {dialogEmployees.length > 0 ? (
              dialogEmployees.map((emp) => (
                <ListItem key={emp.emp_code} sx={{ py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#3b82f6' }}>{emp.fullname.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={emp.first_name}
                    secondary={`Employee CODE: ${emp.fullname}`}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography sx={{ p: 2, textAlign: 'center' }}>No employees to display.</Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
}