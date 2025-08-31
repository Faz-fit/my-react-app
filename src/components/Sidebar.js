import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

function Sidebar({ sidebarOpen, onClose }) {
  const role = getUserRole() || '';
  // Normalize role casing: Capitalize first letter, lowercase rest
  const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  console.log('Sidebar user role normalized:', normalizedRole);

  const navItems = [
    { text: normalizedRole === 'Admin' ? 'Dashboard' : 'Dashboard', path: normalizedRole === 'Admin' ? '/AdminDashboard' : '/Dashboard', roles: ['Admin', 'Manager'] },
    // Admin section
    { text: 'Employee', path: '/Admin/employee-status', roles: ['Admin'] },
    { text: 'Role', path: '/admin/create', roles: ['Admin'] },
    { text: 'Admin Reports', path: '/Admin/reports', roles: ['Admin'] },
    { text: 'Outlets', path: '/Admin/outlets', roles: ['Admin'] },
    { text: 'Agancy', path: '/Admin/create/agency', roles: ['Admin'] },
    { text: 'Holidays', path: '/Admin/create/manager', roles: ['Admin'] },

    // Manager section
    { text: 'Employees', path: '/empman', roles: ['Manager'] },
    { text: 'Leave Approval', path: '/leave-approval', roles: ['Manager'] },
    { text: 'Reports', path: '/reports', roles: ['Manager'] },


    // Admin section (Leave creation)
    { text: 'Leave', path: '/Admin/create/leave', roles: ['Admin'] },
    { text: 'Change Password', path: '/admin/assign/DeviceMangemnt', roles: ['Admin'] },

    // Admin - Assign Section
    { text: 'Leave Managment', path: '/Admin/assign/leave', roles: ['Admin'], },
    { text: 'Daily Attendance', path: '/admin/assign/AdminATTM', roles: ['Admin'], },
  ];

  // Group items by 'group' or default 'Main'
  const groupedItems = navItems
    .filter((item) => item.roles.includes(normalizedRole))
    .reduce((acc, item) => {
      const group = item.group || 'Main';
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});

  return (
    <Box
      sx={{
        width: sidebarOpen ? 240 : 0,
        overflowY: 'auto',
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
