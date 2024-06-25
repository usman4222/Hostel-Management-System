import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const GuestRoute = ({ redirectTo = '/' }) => {
    const userId = localStorage.getItem('adminId');
    return userId ? <Navigate to={redirectTo} /> : <Outlet />;
};

export default GuestRoute;
