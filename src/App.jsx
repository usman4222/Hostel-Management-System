import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dash from './pages/Dashboard/Dash'
import Signin from './Signin'
import ProtectedRoute from './ProtectedRoute';
import { useSelector } from 'react-redux';
import AllEmployees from './components/EmployeesTable/AllEmployees';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import AddEmployee from './components/EmployeesTable/AddEmployee';

function App() {

  const adminId = "adminId";
  const user = localStorage.getItem(adminId);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute user={user} />}>
          <Route path='/' element={<Dash />} />
          <Route path='/allemployees' element={<AllEmployees />} />
          <Route path='/adduser' element={<AddEmployee />} />
          <Route path='/profile/:id' element={<Profile />} />
          <Route path='*' element={<NotFound />} />
        </Route>
        <Route element={<Signin />} path="/sign-in" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
