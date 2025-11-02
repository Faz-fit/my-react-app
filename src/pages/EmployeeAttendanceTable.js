import React, { useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";

export default function EmployeeAttendanceTable({ data }) {
  // Flatten attendance and leave data for one or multiple employees
  const rows = useMemo(() => {
    if (!data) return [];

    const reports = Array.isArray(data) ? data : [data];

    const allRows = reports.flatMap((empData, empIndex) => {
      const employeeId = empData.employee_details?.employee_id || "";
      const userFirstName = empData.employee_details?.user_first_name || "";
      const empCode = empData.employee_details?.fullname || "";

      // Attendance rows - use unique ID with empIndex
      const attendanceRows = (empData.attendance || []).map((att, index) => {
        // Format verification notes properly
        let formattedNotes = "";
        if (att.verification_notes && Array.isArray(att.verification_notes)) {
          const noteTexts = att.verification_notes
            .map((note) => {
              if (!note || typeof note !== 'object') return "";
              
              const entries = Object.entries(note)
                .filter(([key, val]) => val !== null && val !== undefined && val !== "")
                .map(([key, val]) => {
                  // Format the value nicely
                  let formattedVal = val;
                  if (typeof val === 'object') {
                    formattedVal = JSON.stringify(val);
                  }
                  return `${key}: ${formattedVal}`;
                });
              
              return entries.join("; ");
            })
            .filter(noteText => noteText.length > 0);
          
          formattedNotes = noteTexts.join(" | ");
        }

        return {
          id: `att-${empIndex}-${employeeId}-${index}-${att.work_date}`,
          employeeId,
          userFirstName,
          empCode,
          workDate: att.work_date,
          checkInTime: att.check_in_time || "",
          checkOutTime: att.check_out_time || "",
          workedHours: att.worked_hours || "",
          attendanceStatus: att.attendance_status || "",
          verificationNotes: formattedNotes,
          leaveDate: "",
          leaveRemarks: "",
          leaveTypeId: "",
          attendanceType: "",
          attendanceTypeName: "",
          rowType: "attendance", // Add row type identifier
        };
      });

      // Leave rows - use unique ID with empIndex
      const leaveRows = (empData.leaves || []).map((leave, index) => ({
        id: `leave-${empIndex}-${employeeId}-${index}-${leave.leave_date}`,
        employeeId,
        userFirstName,
        empCode,
        workDate: leave.leave_date || "",
        checkInTime: "",
        checkOutTime: "",
        workedHours: "",
        attendanceStatus: "",
        verificationNotes: "",
        leaveDate: leave.leave_date || "",
        leaveRemarks: leave.leave_remarks || "",
        leaveTypeId: leave.leave_type_id || "",
        attendanceType: leave.att_type || "",
        attendanceTypeName: leave.att_type_name || "",
        rowType: "leave", // Add row type identifier
      }));

      return [...attendanceRows, ...leaveRows];
    });

    return allRows;
  }, [data]);

  const columns = [
    { field: "employeeId", headerName: "Employee ID", width: 120 },
    { field: "userFirstName", headerName: "User First Name", width: 180 },
    { field: "empCode", headerName: "EMP_CODE", width: 100 },
    { field: "workDate", headerName: "Work Date", width: 120 },
    { field: "checkInTime", headerName: "Check-In Time", width: 180 },
    { field: "checkOutTime", headerName: "Check-Out Time", width: 180 },
    { field: "workedHours", headerName: "Worked Hours", width: 130 },
    { field: "attendanceStatus", headerName: "Attendance Status", width: 150 },
    { 
      field: "verificationNotes", 
      headerName: "Verification Notes", 
      width: 300,
      renderCell: (params) => (
        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.5' }}>
          {params.value || "-"}
        </div>
      )
    },
    { field: "leaveDate", headerName: "Leave Date", width: 120 },
    { field: "leaveRemarks", headerName: "Leave Remarks", width: 150 },
    { field: "leaveTypeId", headerName: "Leave Type ID", width: 120 },
    { field: "attendanceType", headerName: "Attendance Type", width: 140 },
    { field: "attendanceTypeName", headerName: "Attendance Type Name", width: 180 },
  ];

  return (
    <div style={{ height: 600, width: "100%", marginTop: 16 }}>
      <DataGrid
        showToolbar
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        autoHeight
        getRowHeight={() => 'auto'}
        getRowClassName={(params) => {
          // Apply different background colors based on row type
          if (params.row.rowType === "leave") {
            return "leave-row";
          }
          return "attendance-row";
        }}
        sx={{
          '& .attendance-row': {
            backgroundColor: '#f0f9ff', // Light blue for attendance
            '&:hover': {
              backgroundColor: '#e0f2fe',
            },
          },
          '& .leave-row': {
            backgroundColor: '#fef3c7', // Light yellow for leave
            '&:hover': {
              backgroundColor: '#fde68a',
            },
          },
        }}
      />
    </div>
  );
}