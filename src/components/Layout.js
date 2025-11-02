import React, { useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isSmall = useMediaQuery("(max-width:900px)");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      {/* Sidebar */}
      <Sidebar sidebarOpen={!isSmall && sidebarOpen} />

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          ml: !isSmall ? (sidebarOpen ? "260px" : "70px") : 0,
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        {/* Sticky Header */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000, // Ensure it's on top of everything else
            backgroundColor: "#fff", // Optional, for better visibility
          }}
        >
          <Header onMenuClick={toggleSidebar} />
        </Box>

        {/* Main Content Below the Header */}
        <Box
          sx={{
            mt: "72px", // Adjust based on your header height
            minHeight: "calc(100vh - 72px)",
            p: 3,
            backgroundColor: "#fafafa",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
