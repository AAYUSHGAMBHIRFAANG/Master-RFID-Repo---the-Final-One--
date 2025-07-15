import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeJwt } from '../lib/jwt.js';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = sessionStorage.getItem('AUTH_TOKEN');
    if (t) {
      setToken(t);
      const payload = decodeJwt(t);
      if (payload) setUserRole(payload.role);
    }
  }, []);

  function login(newToken) {
    sessionStorage.setItem('AUTH_TOKEN', newToken);
    setToken(newToken);
    const payload = decodeJwt(newToken);

    if (payload) {
      setUserRole(payload.role);
      // ✅ CORRECTED LOGIC:
      // Use the role from the token payload directly for navigation,
      // as the 'userRole' state may not have updated yet.
      switch (payload.role) {
        case 'ADMIN':
        case 'PCOORD':
          navigate('/dashboard/pcoord', { replace: true });
          break;
        case 'TEACHER':
          navigate('/dashboard/teacher', { replace: true });
          break;
        default:
          navigate('/login', { replace: true });
      }
    } else {
      logout();
    }
  }

  function logout() {
    sessionStorage.removeItem('AUTH_TOKEN');
    setToken(null);
    setUserRole(null);
    navigate('/login', { replace: true });
  }

  return (
    <AuthContext.Provider value={{ token, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}