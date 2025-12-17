// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('auth', JSON.stringify(data.user));
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setUser(null);
      localStorage.removeItem('auth');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // try to restore session on first load
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // REAL login using backend
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    // backend should return { user, token }
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('auth', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('auth', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, fetchProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
