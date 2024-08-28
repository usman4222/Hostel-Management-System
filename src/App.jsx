import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dash from './pages/Dashboard/Dash'
import Signin from './Signin'
import ProtectedRoute from './ProtectedRoute';
import AllEmployees from './components/StudentsTable/AllStudents';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import AddEmployee from './components/StudentsTable/AddStudent';
import UpdateUser from './components/StudentsTable/UpdateStudent';
import GuestRoute from './GuestRoute';
import AddExam from './components/Exam/AddExam';
import MarkAttendance from './components/Attendance/MarkAttendance';
import AddClass from './components/Class/AddClass';
import AttendanceDetails from './components/Attendance/AttendanceDetails';
import StudentAttendanceDetails from './components/Attendance/StudentAttendanceDetails';
import AllClasses from './components/Class/AllClasses';
import UpdateClass from './components/Class/UpdateClass';
import AllExams from './components/Exam/AllExams';
import UpdateExam from './components/Exam/UpdateExam';
import CurrentMonthAttendanceList from './components/Attendance/CurrentMonthAttendanceList';
import AttendanceSearchTable from './components/Attendance/AttendanceSearchTable';

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
          <Route path='/view/:id' element={<Profile />} />
          <Route path='/markattendance' element={<MarkAttendance />} />
          <Route path='/attendance-detail' element={<AttendanceDetails />} />
          <Route path='/attendance/view/:userId' element={<StudentAttendanceDetails />} />
          <Route path='/attendancelist/:userId' element={<CurrentMonthAttendanceList />} />
          <Route path='/searchattendance/:userId' element={<AttendanceSearchTable />} />
          <Route path='/update-user/:id' element={<UpdateUser />} />
          <Route path='/add-class' element={<AddClass />} />
          <Route path='/all-class' element={<AllClasses />} />
          <Route path='/update-class/:id' element={<UpdateClass />} />
          <Route path='/add-exam' element={<AddExam />} />
          <Route path='/all-exams' element={<AllExams />} />
          <Route path='/edit-exam/:id' element={<UpdateExam />} />
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
