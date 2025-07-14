import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import '../index.css';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.access);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>LOGIN</h2>
        {error && (
          <div
            style={{
              background: '#fdecea',
              color: '#b71c1c',
              padding: '0.5rem',
              borderRadius: '4px',
              marginBottom: '1rem',
            }}
          >
            {error}
            <button
              onClick={() => setError('')}
              style={{
                float: 'right',
                border: 'none',
                background: 'transparent',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        )}
        <input
          type="email"
          placeholder="Example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <a href="#" className="forgot">Forgot Password?</a>
      </form>
    </div>
  );
}
