import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = sessionStorage.getItem('AUTH_TOKEN');
    if (t) setToken(t);
  }, []);

  function login(newToken) {
    sessionStorage.setItem('AUTH_TOKEN', newToken);
    setToken(newToken);
    navigate('/dashboard/teacher', { replace: true });
  }

  function logout() {
    sessionStorage.removeItem('AUTH_TOKEN');
    setToken(null);
    navigate('/login', { replace: true });
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
