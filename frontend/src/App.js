import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import StudentRegistration from './pages/StudentRegistration';
import AttendanceLogin from './pages/AttendanceLogin';
import AttendanceReports from './pages/AttendanceReports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AttendanceLogin />} />
        <Route path="/register" element={<StudentRegistration />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/reports" element={<AttendanceReports />} />
      </Routes>
    </Router>
  );
}

export default App;
