import React, { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, ListSubheader} from '@mui/material'; // Add Typography import
import { NavLink } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

function Sidebar({ sidebarOpen, onClose }) {
  const role = getUserRole();
  

  const navItems = [
    // Common or role-specific dashboard
    { text: 'Dashboard', path: role === 'Admin' ? '/Admindashboard' : '/dashboard', roles: ['Admin', 'manager'] },

    // Admin section
    { text: 'Employee Status', path: '/Admin/employee-status', roles: ['Admin']},
    { text: 'Admin Reports', path: '/Admin/reports', roles: ['Admin'] },
    { text: 'Outlets', path: '/Admin/outlets', roles: ['Admin'] },

    // Manager section
    { text: 'Employees', path: '/employees', roles: ['manager'] },
    { text: 'Leave Approval', path: '/leave-approval', roles: ['manager'] },
    { text: 'Reports', path: '/reports', roles: ['manager'] },

    // Admin - Create Section
    { text: 'Create Employee', path: '/Admin/create/employee', roles: ['Admin'], group: 'Create' },
    { text: 'Create Outlet', path: '/Admin/create/outlet', roles: ['Admin'], group: 'Create' },
    { text: 'Create Organization', path: '/Admin/create/agency', roles: ['Admin'], group: 'Create' },
    { text: 'Create Leave', path: '/Admin/create/leave', roles: ['Admin'], group: 'Create' },
  
    

    // Admin - Assign Section
    { text: 'Assign Manager to Outlet', path: '/Admin/assign/manager-outlet', roles: ['Admin'], group: 'Assign' },
    { text: 'Assign Leave to Employee', path: '/Admin/assign/leave', roles: ['Admin'], group: 'Assign' },
  ];

  // Group items by section (default, Create, Assign)
  const groupedItems = navItems
    .filter((item) => item.roles.includes(role))
    .reduce((acc, item) => {
      const group = item.group || 'Main';
      acc[group] = acc[group] || [];
      acc[group].push(item);
      return acc;
    }, {});

  
  return (
    <Box
      sx={{
        width: sidebarOpen ? 240 : 0,
        overflowY: 'auto', // Make the sidebar scrollable
        pt: 8,
        height: '100vh',
        backgroundColor: '#f4f4f4',
        borderRight: sidebarOpen ? '1px solid #ddd' : 'none',
        transition: 'width 0.3s ease-in-out',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999,
      }}
    >
      <List sx={{ px: 1 }}>
        {Object.entries(groupedItems).map(([group, items]) => (
          <React.Fragment key={group}>
            {group !== 'Main' && (
              <ListSubheader sx={{ backgroundColor: 'inherit', pl: 2, py: 1 }}>
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
                    '&.active': {
                      backgroundColor: '#e6b904',
                      color: '#000',
                      fontWeight: 'bold',
                    },
                    '&:hover': {
                      backgroundColor: '#f0e2a1',
                    },
                  }}
                >
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}

export default Sidebar;
