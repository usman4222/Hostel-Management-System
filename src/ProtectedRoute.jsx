import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children, redirect = "/sign-in", adminId = "adminId" }) => {
  const userId = localStorage.getItem(adminId); // Get admin ID from localStorage

  // **Security Consideration:** Refrain from relying solely on localStorage
  // Consider implementing server-side validation for robust authentication.
  // This example demonstrates client-side protection for illustration purposes.

  if (!userId) return <Navigate to={redirect} />; // Redirect if no admin ID

  return children ? children : <Outlet />; // Render children or Outlet
};

export default ProtectedRoute;
