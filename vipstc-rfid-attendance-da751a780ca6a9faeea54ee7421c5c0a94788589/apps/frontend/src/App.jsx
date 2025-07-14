import React from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </AuthProvider>
  );
}
