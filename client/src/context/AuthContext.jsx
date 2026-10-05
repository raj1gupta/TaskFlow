import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('taskflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify existing session
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('taskflow_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('taskflow_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleAuthSuccess = (data) => {
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('taskflow_token', data.token);
      localStorage.setItem('taskflow_user', JSON.stringify(data.user));
    }
  };

  const sendOtp = async (email) => {
    return await authService.sendOtp(email);
  };

  const verifyOtp = async (email, otp) => {
    const data = await authService.verifyOtp(email, otp);
    handleAuthSuccess(data);
    return data;
  };

  const loginWithGoogle = async (googlePayload) => {
    const data = await authService.googleAuth(googlePayload);
    handleAuthSuccess(data);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    sendOtp,
    verifyOtp,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
