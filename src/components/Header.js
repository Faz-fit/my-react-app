import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";

function Header({ onMenuClick, sidebarOpen, isSmall }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  useEffect(() => setIsLoggedIn(isAuthenticated()), []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Sidebar width logic (matches your Sidebar component)
  const sidebarWidth = sidebarOpen && !isSmall ? 240 : 70;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "#fff",
        color: "#000",
        height: 72,
        justifyContent: "center",
        borderBottom: "1px solid #e0e0e0",
        zIndex: 1100,
        left: `${!isSmall ? sidebarWidth : 0}px`, // align with sidebar
        width: `calc(100% - ${!isSmall ? sidebarWidth : 0}px)`, // full remaining width
        transition: "all 0.3s ease-in-out",
        boxShadow: "none", // remove floating look
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 3,
        }}
      >
        {/* Sidebar Toggle */}
        <IconButton onClick={onMenuClick} color="inherit">
          <MenuIcon />
        </IconButton>

        {/* Brand / Title */}
        <Typography variant="h6" fontWeight="bold">
          ARUNALU
        </Typography>

        {/* Logout Icon */}
        {isLoggedIn && (
          <Tooltip title="Logout" arrow>
            <Box
              component="img"
              src="/logout.png"
              alt="Logout"
              onClick={handleLogout}
              sx={{
                width: 42,
                height: 42,
                cursor: "pointer",
                borderRadius: "50%",
                border: "2px solid #e6b904",
                p: 0.5,
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.1)",
                  backgroundColor: "#fffbe6",
                },
              }}
            />
          </Tooltip>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
