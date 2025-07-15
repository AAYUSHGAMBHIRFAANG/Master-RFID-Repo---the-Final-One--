// apps/frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react'; // added useContext
import { useNavigate } from 'react-router-dom';
import { decodeJwt } from '../lib/jwt'; //
// Import the new decoder

export const AuthContext = createContext();

// Add a convenience hook
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null); //
// Add state for role
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
      //
// Role-based redirection logic
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
      logout(); // Failsafe if token is invalid
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