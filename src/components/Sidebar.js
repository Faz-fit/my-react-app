import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Divider,
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

  console.log("Sidebar user role normalized:", normalizedRole);

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
      text: "Admin Reports",
      path: "/Admin/reports",
      roles: ["Admin"],
      icon: <ReportIcon />,
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
      text: "Reports",
      path: "/reports",
      roles: ["Manager"],
      icon: <ReportIcon />,
      group: "Reports",
    },
  ];

  // Filter by role + group them
  const groupedItems = navItems
    .filter((item) => item.roles.includes(normalizedRole))
    .reduce((acc, item) => {
      const group = item.group || "Main";
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});

  return (
    <Box
      sx={{
        width: sidebarOpen ? 260 : 0,
        overflowY: "auto",
        pt: 8,
        height: "100vh",
        backgroundColor: "#fff",
        borderRight: sidebarOpen ? "1px solid #ddd" : "none",
        transition: "width 0.3s ease-in-out",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999,
      }}
    >
      <List sx={{ px: 1 }}>
        {Object.entries(groupedItems).map(([group, items], index) => (
          <React.Fragment key={group}>
            {group !== "Main" && (
              <ListSubheader
                sx={{
                  backgroundColor: "inherit",
                  pl: 2,
                  py: 1,
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#555",
                }}
              >
                {group}
              </ListSubheader>
            )}
            {items.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={onClose}
                  sx={{
                    borderRadius: 2,
                    px: 2,
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
                    <Box sx={{ mr: 2, color: "inherit" }}>{item.icon}</Box>
                  )}
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
            {index < Object.entries(groupedItems).length - 1 && (
              <Divider sx={{ my: 1 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}

export default Sidebar;
