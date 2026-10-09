import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ecohub_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check initial authentication state on mount
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('ecohub_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
        setToken(storedToken);
      } catch (err) {
        console.error('Session restore error:', err);
        localStorage.removeItem('ecohub_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('ecohub_token');
    };

    window.addEventListener('ecohub:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('ecohub:unauthorized', handleUnauthorized);
  }, []);

  // Login handler
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: authToken, user: userData } = res.data;
      
      localStorage.setItem('ecohub_token', authToken);
      setToken(authToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check credentials.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Register handler
  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', userData);
      const { token: authToken, user: newUser } = res.data;

      localStorage.setItem('ecohub_token', authToken);
      setToken(authToken);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('ecohub_token');
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, authError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
