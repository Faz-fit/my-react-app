import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Divider,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import api from 'utils/api'; // Adjust path as needed

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [employees, setEmployees] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInUserData, setLoggedInUserData] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [currentOutletName, setCurrentOutletName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogList, setDialogList] = useState([]);

  const outletId = localStorage.getItem('outlet');

  const fetchAttendanceData = useCallback(async () => {
    if (!outletId) return;
    try {
      const res = await api.get('/api/attendance/all/', {
        params: { outlet_id: outletId },
      });
      setAttendanceData(res.data || []);
    } catch (error) {
      console.error('Attendance fetch error:', error);
    }
  }, [outletId]);

  const fetchLeaveRequests = useCallback(async () => {
    if (!outletId) return;
    try {
      const res = await api.get('/api/attendance/outletleaverequests/', {
        params: { outlet_id: outletId },
      });
      setPendingLeaves(res.data || []);
    } catch (error) {
      console.error('Leave fetch error:', error);
    }
  }, [outletId]);

  const fetchInitialData = async () => {
    try {
      const [empRes, outletRes, userRes] = await Promise.all([
        api.get('/api/getemployees'),
        api.get('/api/outlets/'),
        api.get('/api/user/'),
      ]);
      setEmployees(empRes.data);
      setOutlets(outletRes.data);
      setLoggedInUserData(userRes.data);
    } catch (error) {
      console.error('Initial data fetch error:', error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchInitialData().then(() => {
      fetchAttendanceData();
      fetchLeaveRequests();
      setIsLoading(false);
    });
  }, [fetchAttendanceData, fetchLeaveRequests]);

  useEffect(() => {
    if (employees.length && loggedInUserData) {
      const emp = employees.find((e) => e.user === loggedInUserData.user);
      setCurrentEmployee(emp || null);
    }
  }, [employees, loggedInUserData]);

  useEffect(() => {
    let outletName = '';
    if (loggedInUserData?.outlets?.length) {
      outletName = loggedInUserData.outlets[0].name;
    } else if (currentEmployee && outlets.length) {
      const outlet = outlets.find((o) => o.id === Number(currentEmployee.outlet));
      outletName = outlet ? outlet.name : '';
    }
    setCurrentOutletName(outletName);
  }, [loggedInUserData, currentEmployee, outlets]);

  // Filter employees by current outlet
  const employeesInOutlet = employees.filter(
    (e) => Array.isArray(e.outlets) && e.outlets.includes(Number(outletId))
  );

  // Prepare rows for DataGrid with guaranteed approvedLeaves array
  const combinedRows = employeesInOutlet.map((emp, index) => {
    const attendance = attendanceData.find(
      (a) => a.employee === emp.employee_id && a.date === selectedDate
    );

    const employeeLeaves = pendingLeaves
      .filter(
        (leave) =>
          leave.employee === emp.employee_id && leave.status === 'approved'
      )
      .map((leave) => leave.leave_date.split('T')[0]);

    return {
      id: index, // DataGrid needs id
      employeeId: emp.employee_id,
      fullName: emp.fullname || '',
      firstName: emp.first_name || '',
      outlets: Array.isArray(emp.outlets)
        ? emp.outlets.map((id) => outlets.find((o) => o.id === id)?.name || id).join(', ')
        : '',
      date: selectedDate,
      punchIn: attendance?.check_in_time
        ? new Date(attendance.check_in_time).toLocaleTimeString()
        : '',
      punchOut: attendance?.check_out_time
        ? new Date(attendance.check_out_time).toLocaleTimeString()
        : '',
      verified: attendance?.verified || '',
      approvedLeaves: employeeLeaves || [], // always array, never undefined
    };
  });

  // Summary counts
  const totalEmployees = combinedRows.length;
  const totalPunchIns = combinedRows.filter((row) => row.punchIn).length;
  const totalPunchOuts = combinedRows.filter((row) => row.punchOut).length;
  const totalLeaves = combinedRows.filter((row) =>
    row.approvedLeaves.includes(selectedDate)
  ).length;

  const handleOpenDialog = (title, filterFn) => {
    const list = combinedRows.filter(filterFn).map((row) => row.firstName || '-');
    setDialogTitle(title);
    setDialogList(list);
    setDialogOpen(true);
  };

  // Columns with safe valueGetter
  const columns = [
    { field: 'employeeId', headerName: 'Employee ID', width: 160 },
    { field: 'fullName', headerName: 'EMP_CODE', width: 220 },
    { field: 'firstName', headerName: 'First Name', width: 400 },
    { field: 'date', headerName: 'Date', width: 160 },
    { field: 'punchIn', headerName: 'Punch In', width: 180 },
    { field: 'punchOut', headerName: 'Punch Out', width: 180 },
    { field: 'verified', headerName: 'Verified', width: 120 },
  ];

  return (
    <Box
      sx={{
        padding: { xs: 2, sm: 3, md: 4 },
        maxWidth: '100%',
        margin: '0 auto',
        backgroundColor: '#f9fafa',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
<Typography
  variant="h4"
  fontWeight="600"
  gutterBottom
  color="black"
  sx={{ 
    textAlign: { xs: 'center', md: 'left' },
    textTransform: 'uppercase'  // This makes the text uppercase
  }}
>
  {currentOutletName || 'Loading Outlet...'}
</Typography>


      {/* Date Selector */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'left',
          mb: 4,
        }}
      >
        <TextField
          type="date"
          label="Select Date"
          variant="outlined"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            maxWidth: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* Summary Cards */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: 2,
            padding: { xs: 2, sm: 3 },
          }}
        >
          {[
            { label: 'Total Employees', value: totalEmployees, color: 'black' },
            { label: 'Punch Ins', value: totalPunchIns, color: 'success' },
            { label: 'Punch Outs', value: totalPunchOuts, color: 'info' },
            { label: 'On Leaves', value: totalLeaves, color: 'warning' },
          ].map((item, index) => (
            <Box
              key={index}
              sx={{
                textAlign: 'center',
                minWidth: { xs: '100%', sm: 140 },
                cursor: 'pointer',
                p: 2,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  transform: 'scale(1.03)',
                },
              }}
              onClick={() => {
                if (item.label === 'Total Employees') handleOpenDialog('Total Employees', () => true);
                if (item.label === 'Punch Ins') handleOpenDialog('Employees with Punch In', (row) => row.punchIn);
                if (item.label === 'Punch Outs') handleOpenDialog('Employees with Punch Out', (row) => row.punchOut);
                if (item.label === 'On Leaves')
                  handleOpenDialog('Employees On Leave', (row) =>
                    row.approvedLeaves.includes(selectedDate)
                  );
              }}
            >
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                {item.label}
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                color={item.color}
                sx={{ mt: 0.5 }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Data Grid */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
          <CircularProgress color="primary" size={60} thickness={4} />
        </Box>
      ) : combinedRows.length === 0 ? (
        <Alert
          severity="info"
          sx={{
            borderRadius: 2,
            fontSize: '1.1rem',
            textAlign: 'center',
            py: 3,
            backgroundColor: '#e3f2fd',
          }}
        >
          No attendance data available for the selected date.
        </Alert>
      ) : (
        <Box
          sx={{
            height: { xs: 500, sm: 600 },
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff',
          }}
        >
          <DataGrid
            rows={combinedRows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.grey[50],
                fontSize: '0.95rem',
                fontWeight: 600,
              },
              '& .MuiDataGrid-cell': {
                fontSize: '0.9rem',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: `1px solid ${theme.palette.divider}`,
              },
            }}
          />
        </Box>
      )}

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            textAlign: 'center',
            pb: 1,
          }}
        >
          {dialogTitle}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 1 }}>
          {dialogList.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No data available.
            </Typography>
          ) : (
            <List dense>
              {dialogList.map((name, index) => (
                <ListItem
                  key={index}
                  sx={{
                    py: 0.8,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  {name}
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} FITI. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;