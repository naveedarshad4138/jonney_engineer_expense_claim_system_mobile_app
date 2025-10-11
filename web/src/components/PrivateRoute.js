import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { decodeBase64 } from '../utils/customFunctions';

const PrivateRoute = () => {
  const tokenData = localStorage.getItem('authToken');
  if (!tokenData) {
    // No token found, redirect to login
    return <Navigate to="/login" replace />;
  }
  const decoded = decodeBase64(tokenData);
  const { expiresAt } = JSON.parse(decoded);
  if (new Date().getTime() > expiresAt) {
    // Token is expired, redirect to login
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
