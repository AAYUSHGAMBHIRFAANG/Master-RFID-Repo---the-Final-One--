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

/**
 * A component to protect routes that require authentication.
 * It checks for a token in the AuthContext and redirects to the
 * login page if the token is not present.
 */
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

        {/* Teacher Routes */}
        <Route
          path="/dashboard/teacher"
          element={
            <Protected>
              <TeacherDashboard />
            </Protected>
          }
        />
        <Route
          path="/dashboard/teacher/record/:subjectInstId"
          element={
            <Protected>
              <RecordPage />
            </Protected>
          }
        />

        {/* Program Coordinator Routes */}
        <Route
          path="/dashboard/pcoord"
          element={
            <Protected>
              <PCoordinatorDashboard />
            </Protected>
          }
        />
        <Route
          path="/dashboard/pcoord/faculty"
          element={
            <Protected>
              <FacultyPage />
            </Protected>
          }
        />
        
        {/* --- Default & Catch-all --- */}

        {/* Redirect root path to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all for any other path, redirects to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Layout>
  );
}