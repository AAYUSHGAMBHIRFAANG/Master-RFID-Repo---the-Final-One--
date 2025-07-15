import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext.jsx';
import Layout         from '../components/Layout.jsx';
import Login          from '../pages/Login.jsx';
import TeacherDashboard from '../pages/TeacherDashboard.jsx';
import RecordPage     from '../pages/RecordPage.jsx';

function Protected({ children }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* public */}
        <Route path="/login" element={<Login />} />

        {/* the record page must appear before the wildcard */}
        <Route
          path="/dashboard/teacher/record/:subjectInstId"
          element={
            <Protected>
              <RecordPage />
            </Protected>
          }
        />

        {/* teacher dashboard */}
        <Route
          path="/dashboard/teacher"
          element={
            <Protected>
              <TeacherDashboard />
            </Protected>
          }
        />

        {/* catch‑all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Layout>
  );
}
