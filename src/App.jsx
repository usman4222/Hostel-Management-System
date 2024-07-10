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
import UpdateUser from './components/EmployeesTable/UpdateUser';
import AddBlog from './components/Blogs/AddBlog';
import AllBlogs from './components/Blogs/AllBogs';
import UpdateBlog from './components/Blogs/UpdateBlog';
import GuestRoute from './GuestRoute';
import AddAd from './components/Ad/AddAd';
import AddMining from './components/AddMiningRate/AddMining';

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
          <Route path='/allblogs' element={<AllBlogs />} />
          <Route path='/update-user/:id' element={<UpdateUser />} />
          <Route path='/add-blog' element={<AddBlog />} />
          <Route path='/update-blog/:id' element={<UpdateBlog />} />
          <Route path='/add-ad' element={<AddAd />} />
          <Route path='/add-mining-rate' element={<AddMining />} />
          <Route path='*' element={<NotFound />} />
        </Route>
        <Route element={<GuestRoute />}>
          <Route element={<Signin />} path="/sign-in" />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
