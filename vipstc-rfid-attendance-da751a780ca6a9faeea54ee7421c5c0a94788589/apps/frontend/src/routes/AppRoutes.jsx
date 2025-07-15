import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext.jsx';
import Layout from '../components/Layout.jsx';

// Import all the page components
import Login from '../pages/Login.jsx';
import TeacherDashboard from '../pages/TeacherDashboard.jsx';
import PCoordinatorDashboard from '../pages/PCoordinatorDashboard.jsx';
import FacultyPage from '../pages/FacultyPage.jsx';
import RecordPage from '../pages/RecordPage.jsx';

function Protected({ children }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* --- Protected Routes --- */}
        <Route path="/dashboard/teacher" element={<Protected><TeacherDashboard /></Protected>} />
        <Route path="/dashboard/teacher/record/:subjectInstId" element={<Protected><RecordPage /></Protected>} />
        <Route path="/dashboard/teacher/retrieve/:subjectInstId" element={<Protected><Navigate to="/selecting_date.html" replace /></Protected>} />
        <Route path="/dashboard/pcoord" element={<Protected><PCoordinatorDashboard /></Protected>} />
        <Route path="/dashboard/pcoord/faculty" element={<Protected><FacultyPage /></Protected>} />
        
        {/* --- Default & Catch-all --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Layout>
  );
}