import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { getUserRole } from "../utils/auth";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessIcon from "@mui/icons-material/Business";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import ReportIcon from "@mui/icons-material/BarChart";
import LockIcon from "@mui/icons-material/Lock";
import CoPresentIcon from '@mui/icons-material/CoPresent';

function Sidebar({ sidebarOpen, onClose }) {
  const role = getUserRole() || "";
  const normalizedRole =
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  const navItems = [
    // Common / Dashboard
    {
      text: "Dashboard",
      path:
        normalizedRole === "Admin" ? "/AdminDashboard" : "/Dashboard",
      roles: ["Admin", "Manager"],
      icon: <DashboardIcon />,
      group: "Main",
    },
    // Admin Section
    {
      text: "Employee",
      path: "/Admin/employee-status",
      roles: ["Admin"],
      icon: <PeopleIcon />,
      group: "Management",
    },
    {
      text: "Role",
      path: "/admin/create",
      roles: ["Admin"],
      icon: <SettingsIcon />,
      group: "Management",
    },
    {
      text: "Outlets",
      path: "/Admin/outlets",
      roles: ["Admin"],
      icon: <BusinessIcon />,
      group: "Management",
    },
    {
      text: "Agency",
      path: "/Admin/create/agency",
      roles: ["Admin"],
      icon: <BusinessIcon />,
      group: "Management",
    },
    {
      text: "Holidays",
      path: "/Admin/create/manager",
      roles: ["Admin"],
      icon: <EventIcon />,
      group: "Management",
    },
    {
      text: "Leave",
      path: "/Admin/create/leave",
      roles: ["Admin"],
      icon: <EventIcon />,
      group: "Management",
    },
    {
      text: "Change Password",
      path: "/admin/assign/DeviceMangemnt",
      roles: ["Admin"],
      icon: <LockIcon />,
      group: "Settings",
    },
    {
      text: "Deactivate Employee",
      path: "/admin/DeactiveEmployee",
      roles: ["Admin"],
      icon: <LockIcon />,
      group: "Settings",
    },
    {
      text: "Leave Management",
      path: "/Admin/assign/leave",
      roles: ["Admin"],
      icon: <AssignmentIcon />,
      group: "Assignments",
    },
    {
      text: "Daily Attendance",
      path: "/admin/assign/AdminATTM",
      roles: ["Admin"],
      icon: <AssignmentIcon />,
      group: "Assignments",
    },
    {
      text: "Detail Reports",
      path: "/Admin/reports",
      roles: ["Admin"],
      icon: <ReportIcon />,
      group: "Reports",
    },
    {
      text: "Standard Reports",
      path: "/Admin/reports2",
      roles: ["Admin"],
      icon: <ReportIcon />,
      group: "Reports",
    },
    {
      text: "Agency",
      path: "/Admin/create/agency",
      roles: ["Admin"],
      icon: <BusinessIcon />,
      group: "Reports",
    },
    // Manager Section
    {
      text: "Employees",
      path: "/empman",
      roles: ["Manager"],
      icon: <PeopleIcon />,
      group: "Management",
    },
    {
      text: "Leave Approval",
      path: "/leave-approval",
      roles: ["Manager"],
      icon: <AssignmentIcon />,
      group: "Management",
    },
    {
      text: "Outlet Log",
      path: "/manager/DAO",
      roles: ["Manager"],
      icon: <CoPresentIcon />,
      group: "Management",
    },
    {
      text: "Outlet Leave Summary",
      path: "/manager/OLS",
      roles: ["Manager"],
      icon: <CoPresentIcon />,
      group: "Management",
    },
    {
      text: "Attendance",
      path: "/Attandancemodify",
      roles: ["Manager"],
      icon: <ReportIcon />,
      group: "Modifications",
    },
    {
      text: "Leave",
      path: "/Leavemodify",
      roles: ["Manager"],
      icon: <ReportIcon />,
      group: "Modifications",
    },
    {
      text: "Reports",
      path: "/Manager/Reports",
      roles: ["Manager"],
      icon: <ReportIcon />,
      group: "Modifications",
    },
  ];

  return (
    <Box
      sx={{
        width: sidebarOpen ? 240 : 70, // Make it responsive
        overflowY: "auto", // Allow scrolling if content overflows
        pt: 10,
        height: "100vh",
        backgroundColor: "#fff",
        borderRight: sidebarOpen ? "1px solid #ddd" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999,
        transition: "width 0.3s ease-in-out",
        overflowX: "hidden",
      }}
    >
      <List sx={{ px: 1 }}>
        {navItems
          .filter((item) => item.roles.includes(normalizedRole))
          .map((item) => (
            <ListItem
              key={item.text}
              disablePadding
              sx={{
                mb: 0, // Remove margin between items
                padding: 0, // Ensure no padding around items
              }}
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
                    backgroundColor: "#f9e27a",
                  },
                }}
              >
                {item.icon && (
                  <Box sx={{ color: "inherit", minWidth: 0 }}>
                    {item.icon}
                  </Box>
                )}
                {sidebarOpen && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      ml: 2,
                      whiteSpace: "nowrap",
                      opacity: sidebarOpen ? 1 : 0,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Box>
  );
}

export default Sidebar;
