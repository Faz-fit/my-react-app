import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function LeaveApproval() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Retrieve JWT token from localStorage or sessionStorage
  const token = localStorage.getItem('access_token'); // or sessionStorage.getItem('token')

  // Fetch leave requests and employee data from the API
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get('http://139.59.243.2:8000/api/attendance/allleaverequests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRequests(response.data); // Storing leave requests
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };

    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get('http://139.59.243.2:8000/api/getemployees/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmployees(response.data); // Storing employee data
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    if (token) {
      fetchLeaveRequests();
      fetchEmployeeData();
    } else {
      console.error('No token found for authorization');
    }
  }, [token]);

  // Approve leave request
  const handleApprove = async (id) => {
    try {
      const response = await axios.put(
        `http://139.59.243.2:8000/api/attendance/updateleavestatus/${id}/`,  // Ensure this matches the backend pattern
        { status: 'approved' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setRequests((prev) =>
          prev.map((req) =>
            req.leave_refno === id ? { ...req, status: 'approved' } : req
          )
        );
        alert('Leave Approved');
      } else {
        alert('Error approving leave request!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error approving leave request!');
    }
  };

  // Reject leave request
  const handleReject = async (id) => {
    try {
      const response = await axios.put(
        `http://139.59.243.2:8000/api/attendance/updateleavestatus/${id}/`,  // Ensure this matches the backend pattern
        { status: 'rejected' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setRequests((prev) =>
          prev.map((req) =>
            req.leave_refno === id ? { ...req, status: 'rejected' } : req
          )
        );
        alert('Leave Rejected');
      } else {
        alert('Error rejecting leave request!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error rejecting leave request!');
    }
  };

  // Map employee data to leave requests based on employee_id
  const mapEmployeeData = (requests, employees) => {
    return requests.map(request => {
      const employee = employees.find(emp => emp.employee_id === request.employee); // Match employee ID
      return {
        ...request,
        employeeName: employee ? employee.fullname : 'Unknown', // Map employee fullname
      };
    });
  };

  // Wait for both leave requests and employee data to be available
  useEffect(() => {
    if (requests.length > 0 && employees.length > 0) {
      const mappedRequests = mapEmployeeData(requests, employees);
      setRequests(mappedRequests);
      setLoading(false); // Set loading to false after mapping is done
    }
  }, [requests, employees]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  // Define columns to be displayed in DataGrid
  const columns = [
    { field: 'leave_refno', headerName: 'Leave Ref No', width: 150 },
    { field: 'leave_date', headerName: 'Leave Date', width: 150 },
    { field: 'remarks', headerName: 'Remarks', width: 200 },
    { field: 'add_date', headerName: 'Added On', width: 150 },
    { field: 'employee', headerName: 'Employee ID', width: 150 },
    { field: 'employeeName', headerName: 'Full Name', width: 200 },
    { field: 'leave_type_name', headerName: 'Leave Type', width: 200 },
    {
      field: 'actions',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <>
          {params.row.status === 'pending' ? (
            <>
              <GridActionsCellItem
                icon={<CheckCircleIcon color="success" />}
                label="Approve"
                onClick={() => handleApprove(params.row.leave_refno)}
              />
              <GridActionsCellItem
                icon={<CancelIcon color="error" />}
                label="Reject"
                onClick={() => handleReject(params.row.leave_refno)}
              />
            </>
          ) : (
            <Typography>{params.row.status}</Typography>
          )}
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Typography variant="h4" sx={{ mb: 2 }} fontWeight="bold">
        LEAVE REQUESTS
      </Typography>

      {/* DataGrid displaying leave requests */}
      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={requests}
          columns={columns}
          pageSize={5}
          disableRowSelectionOnClick
          getRowId={(row) => row.leave_refno} // Use 'leave_refno' as the unique id
        />
      </Box>
    </Box>
  );
}
