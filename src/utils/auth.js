// utils/auth.js

export const isAuthenticated = () => localStorage.getItem('auth') === 'true';

export const getUserRole = () => localStorage.getItem('role') || '';


export const logout = () => {
  localStorage.removeItem('auth');
  localStorage.removeItem('role');
  localStorage.removeItem('outlet');
  localStorage.removeItem('outletList');
  // add any other keys you want to clear on logout
};
