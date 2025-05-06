// src/components/Layout.js
import React, { useState } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? '240px' : '0px',
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* Page Content */}
        <Box
          sx={{
            mt: '64px', // height of AppBar
            p: 3,
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: '#f9f9f9',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
