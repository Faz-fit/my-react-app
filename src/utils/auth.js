// src/utils/auth.js

// Simulated login function
export const loginUser = async (username, password) => {
  // Simulated user database
  const users = {
    admin: {
      password: 'admin123',
      role: 'admin',
      token: 'fake-admin-jwt-token',
      outlets: [],
    },
    manager1: {
      password: 'manager123',
      role: 'manager',
      token: 'fake-manager-jwt-token',
      outlets: ['Outlet A', 'Outlet B'],
    },
    manager2: {
      password: 'manager123',
      role: 'manager',
      token: 'fake-manager-jwt-token',
      outlets: ['Outlet X'], // Only one outlet
    },
  };

  const user = users[username];

  if (user && user.password === password) {
    // Store token and role
    localStorage.setItem('token', user.token);
    localStorage.setItem('role', user.role);

    return {
      success: true,
      message: 'Login successful',
      token: user.token,
      role: user.role,
      outlets: user.outlets,
    };
  }

  return {
    success: false,
    message: 'Invalid username or password',
  };
};

// Check if the user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Logout function
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('outlet');
  localStorage.removeItem('outletList');
};

// Get user role
export const getUserRole = () => {
  return localStorage.getItem('role');
};

// Get selected outlet (if manager)
export const getSelectedOutlet = () => {
  return localStorage.getItem('outlet');
};
