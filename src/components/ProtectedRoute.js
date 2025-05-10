// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const role = getUserRole();

  // Check if user is authenticated and has the required role
  if (!role || role !== requiredRole) {
    return <Navigate to="/" />; // Redirect to login page if not authorized
  }

  return children; // Allow access to the protected route if the user has the required role
};

export default ProtectedRoute;
