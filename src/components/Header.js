import React, { useState, useEffect } from 'react';
import { AppBar, Box, Toolbar, IconButton, Typography, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../utils/auth';

function Header({ onMenuClick }) {
  const navigate = useNavigate(); // This is where we use `navigate`
  
  // Track authentication state locally
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  // Update authentication state on login/logout
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);  // Empty dependency array to run once when the component mounts
  
  const handleLogout = () => {
    logout(); // Clear session data (like tokens)
    navigate('/'); // Use `navigate` to redirect to the homepage or login page
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderRadius: '0 0 16px 16px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        backgroundColor: '#ffffff',
        color: '#000',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 3 }}>
        {/* Sidebar Toggle */}
        <IconButton color="inherit" onClick={onMenuClick} edge="start" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} fontWeight="bold"> 
          ARUNALU
        </Typography>

        {/* Logout */}
        {isLoggedIn && (
          <Tooltip title="Logout" arrow>
            <Box
              component="img"
              src="/logout.png"
              alt="Logout"
              onClick={handleLogout}
              sx={{
                width: 36,
                height: 36,
                cursor: 'pointer',
                borderRadius: '50%',
                border: '2px solid #e6b904',
                p: 0.5,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: '#fffbe6',
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
