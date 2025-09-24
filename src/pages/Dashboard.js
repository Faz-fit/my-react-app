import React, { useEffect, useState, useMemo } from "react";
import {
  Avatar, // --- UI IMPROVEMENT: For styled icons and lists
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
  ListItemAvatar, // --- UI IMPROVEMENT: For lists with icons/avatars
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

// --- UI IMPROVEMENT: Redesigned StatCard for a more modern look ---
const StatCard = ({ title, value, icon, color, onViewClick }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRadius: 4, // Softer corners
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Softer shadow
      height: '100%',
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
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
        sx={{ alignSelf: 'flex-start', mt: 2, fontWeight: 'bold' }}
      >
        View Details
      </Button>
    )}
  </Paper>
);
// --- END UI IMPROVEMENT ---

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
    // --- UI IMPROVEMENT: Add padding and a light background color to the whole page ---
    <Box sx={{ width: "100%", p: 3, backgroundColor: '#f4f6f8' }}>
      {/* --- UI IMPROVEMENT: Header without Paper for a cleaner look --- */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4" fontWeight="bold">
            {outletData.name} Dashboard
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined">
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
      {/* --- END UI IMPROVEMENT --- */}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Employees" value={outletSummary.total} color="#637381"
            icon={<GroupIcon />} onViewClick={() => handleViewDetailsClick("Total")} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Present Today" value={outletSummary.present} color="#22c55e"
            icon={<CheckCircleOutlineIcon />} onViewClick={() => handleViewDetailsClick("Present")} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Absent Today" value={outletSummary.absent} color="#ef4444"
            icon={<HighlightOffIcon />} onViewClick={() => handleViewDetailsClick("Absent")} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="On Approved Leave" value={outletSummary.onLeave} color="#3b82f6"
            icon={<EventBusyIcon />} onViewClick={() => handleViewDetailsClick("On Leave")} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {[
          { title: "Today's Attendance", chart: <PieChart><Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label onClick={handlePieClick}>{pieData.map((entry, index) => (<Cell key={index} fill={COLORS[index]} cursor="pointer" />))}</Pie><Tooltip /><Legend /></PieChart> },
          { title: "Attendance Trend (Last 7 Days)", chart: <BarChart data={barData}><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Bar dataKey="present" name="Present" fill="#4caf50" stackId="a" /><Bar dataKey="onLeave" name="On Leave" fill="#2196f3" stackId="a" /><Bar dataKey="absent" name="Absent" fill="#f44336" stackId="a" /></BarChart> },
        ].map((item, index) => (
          <Grid item xs={12} md={index === 0 ? 4 : 8} key={item.title}>
            <Paper sx={{ p: 2, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>{item.title}</Typography>
              <ResponsiveContainer width="100%" height={250}>{item.chart}</ResponsiveContainer>
            </Paper>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Today's Leave Requests</Typography>
            <Typography>Approved: {outletSummary.leavesApproved}</Typography>
            <Typography>Pending Approval: {outletSummary.leavesPending}</Typography>
            <Typography>Rejected: {outletSummary.leavesRejected}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={drillDownOpen} onClose={() => setDrillDownOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Employees - {drillDownCategory}
          <IconButton aria-label="close" onClick={() => setDrillDownOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers><List>{drillDownEmployees.length > 0 ? drillDownEmployees.map((name, idx) => (<ListItem key={idx}><ListItemText primary={name} /></ListItem>)) : <Typography>No employees in this category.</Typography>}</List></DialogContent>
      </Dialog>
      
      {/* --- UI IMPROVEMENT: Enhanced Dialog List --- */}
      <Dialog open={isListDialogOpen} onClose={() => setListDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogTitle}
          <IconButton aria-label="close" onClick={() => setListDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {dialogEmployees.length > 0 ? (
              dialogEmployees.map((emp) => (
                <ListItem key={emp.emp_code}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#3b82f6' }}>{emp.fullname.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={emp.fullname}
                    secondary={`Name: ${emp.first_name} `}
                  />
                </ListItem>
              ))
            ) : (
              <Typography sx={{ p: 2 }}>No employees to display.</Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
       {/* --- END UI IMPROVEMENT --- */}
    </Box>
  );
}