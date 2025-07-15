import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext }   from '../context/AuthContext.jsx';
import Login             from '../pages/Login.jsx';
import TeacherDashboard from "../pages/TeacherDashboard.jsx";
import RecordPage from "../pages/RecordPage";
function Protected({ children }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <Protected>
            <TeacherDashboard />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route
  path="/dashboard/teacher/record/:subjectInstId"
  element={<RecordPage />}
/>
    </Routes>
  );
}
