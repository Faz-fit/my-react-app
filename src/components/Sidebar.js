import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Tooltip,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { getUserRole } from "../utils/auth";

// Updated Icons (unique, modern)
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import StoreIcon from "@mui/icons-material/Store";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import LockResetIcon from "@mui/icons-material/LockReset";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import TaskIcon from "@mui/icons-material/Task";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import SummarizeIcon from "@mui/icons-material/Summarize";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";

function Sidebar({ sidebarOpen, onClose }) {
  const role = getUserRole() || "";
  const normalizedRole =
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
const navItems = [
  // Common
  {
    text: "DASHBOARD",
    path: normalizedRole === "Admin" ? "/AdminDashboard" : "/Dashboard",
    roles: ["Admin", "Manager"],
    icon: <DashboardIcon />,
    group: "MAIN",
  },

  // Admin Section
  { text: "EMPLOYEE", path: "/Admin/employee-status", roles: ["Admin"], icon: <GroupIcon />, group: "MANAGEMENT" },
  { text: "OUTLETS", path: "/Admin/outlets", roles: ["Admin"], icon: <StoreIcon />, group: "MANAGEMENT" },
  { text: "HOLIDAYS", path: "/Admin/create/holidays", roles: ["Admin"], icon: <CalendarMonthIcon />, group: "MANAGEMENT" },
  { text: "LEAVE", path: "/Admin/create/leave", roles: ["Admin"], icon: <EditCalendarIcon />, group: "MANAGEMENT" },

  // Admin - Settings
  { text: "CHANGE PASSWORD", path: "/admin/Employee/PasswordChange", roles: ["Admin"], icon: <LockResetIcon />, group: "SETTINGS" },
  { text: "DEACTIVATE EMPLOYEE", path: "/admin/DeactiveEmployee", roles: ["Admin"], icon: <PersonOffIcon />, group: "SETTINGS" },

  // Admin - Assignments
  { text: "LEAVE MANAGEMENT", path: "/Admin/assign/leave", roles: ["Admin"], icon: <WorkHistoryIcon />, group: "ASSIGNMENTS" },
  { text: "DAILY ATTENDANCE", path: "/admin/assign/AdminATTM", roles: ["Admin"], icon: <TaskIcon />, group: "ASSIGNMENTS" },

  // Admin - Reports
  { text: "DETAIL REPORTS", path: "/Admin/reports", roles: ["Admin"], icon: <QueryStatsIcon />, group: "REPORTS" },
 // { text: "STANDARD REPORTS", path: "/Admin/reports2", roles: ["Admin"], icon: <AnalyticsIcon />, group: "REPORTS" },

  // Manager Section
  { text: "EMPLOYEES", path: "/empman", roles: ["Manager"], icon: <ManageAccountsIcon />, group: "MANAGEMENT" },
  { text: "LEAVE APPROVAL", path: "/leave-approval", roles: ["Manager"], icon: <FactCheckIcon />, group: "MANAGEMENT" },
  { text: "OUTLET LOG", path: "/manager/DAO", roles: ["Manager"], icon: <StoreIcon />, group: "MANAGEMENT" },
  { text: "OUTLET LEAVE SUMMARY", path: "/manager/OLS", roles: ["Manager"], icon: <SummarizeIcon />, group: "MANAGEMENT" },

  // Manager - Modifications
  { text: "ATTENDANCE", path: "/Attandancemodify", roles: ["Manager"], icon: <TaskIcon />, group: "MODIFICATIONS" },
  { text: "LEAVE", path: "/Leavemodify", roles: ["Manager"], icon: <EditCalendarIcon />, group: "MODIFICATIONS" },
  { text: "REPORTS", path: "/Manager/Reports", roles: ["Manager"], icon: <QueryStatsIcon />, group: "MODIFICATIONS" },
];


  // Group items by category
  const groupedNav = navItems.reduce((acc, item) => {
    if (item.roles.includes(normalizedRole)) {
      acc[item.group] = acc[item.group] || [];
      acc[item.group].push(item);
    }
    return acc;
  }, {});

  return (
    <Box
      sx={{
        width: sidebarOpen ? 240 : 72,
        height: "100vh",
        pt: 9,
        backgroundColor: "#fff",
        borderRight: "1px solid #e0e0e0",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999,
        transition: "width 0.3s ease-in-out",
        overflowY: "auto",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar
      }}
    >
      {Object.entries(groupedNav).map(([group, items]) => (
        <Box key={group}>
          {sidebarOpen && (
            <Typography
              variant="caption"
              sx={{
                pl: 2,
                pt: 1,
                pb: 0.5,
                color: "#777",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {group}
            </Typography>
          )}

          <List sx={{ px: 1 }}>
            {items.map((item) => (
              <ListItem key={item.text} disablePadding>
                <Tooltip
                  title={!sidebarOpen ? item.text : ""}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    onClick={onClose}
                    sx={{
                      borderRadius: 2,
                      px: sidebarOpen ? 2 : 1.5,
                      justifyContent: sidebarOpen ? "flex-start" : "center",
                      "&.active": {
                        backgroundColor: "#e6b904",
                        color: "#000",
                        fontWeight: "bold",
                      },
                      "&:hover": {
                        backgroundColor: "#fff8dc",
                      },
                    }}
                  >
                    <Box sx={{ color: "inherit", minWidth: 0 }}>
                      {item.icon}
                    </Box>
                    {sidebarOpen && (
                      <ListItemText
                        primary={item.text}
                        sx={{ ml: 2, whiteSpace: "nowrap" }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 1 }} />
        </Box>
      ))}
    </Box>
  );
}

export default Sidebar;
