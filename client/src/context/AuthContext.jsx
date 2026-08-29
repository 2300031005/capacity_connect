import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMeApi, loginApi, registerApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [deactivationNotice, setDeactivationNotice] = useState(() => sessionStorage.getItem('deactivationNotice') || null);

  // Restore authenticated user on initial load or refresh
  const restoreSession = useCallback(async () => {
    const savedToken = localStorage.getItem('token');

    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getMeApi();
      if (data && data.success && data.user) {
        setUser(data.user);
        setToken(savedToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setDeactivationNotice(null);
        sessionStorage.removeItem('deactivationNotice');
      } else {
        throw new Error('Failed to validate session profile');
      }
    } catch (error) {
      console.warn('Session restoration check:', error.message);
      if (error.response?.data?.isDeactivated) {
        const msg =
          error.response.data.message ||
          'Your account has been deactivated by an administrator. Please contact your platform administrator.';
        setDeactivationNotice(msg);
        sessionStorage.setItem('deactivationNotice', msg);
        setUser(null);
        // Note: Keep savedToken so if admin reactivates, next refresh or check restores session
      } else if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('deactivationNotice');
        setDeactivationNotice(null);
        setUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Listen for real-time deactivation events from Axios interceptor
  useEffect(() => {
    const handleDeactivated = (e) => {
      const msg =
        e.detail ||
        'Your account has been deactivated by an administrator. Please contact your platform administrator.';
      setDeactivationNotice(msg);
      setUser(null);
    };

    window.addEventListener('auth:deactivated', handleDeactivated);
    return () => window.removeEventListener('auth:deactivated', handleDeactivated);
  }, []);

  // Login handler
  const login = async (credentials) => {
    const data = await loginApi(credentials);
    if (data && data.success && data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setDeactivationNotice(null);
      sessionStorage.removeItem('deactivationNotice');
      return data;
    }
    throw new Error(data?.message || 'Login failed');
  };

  // Register handler
  const register = async (userData) => {
    const data = await registerApi(userData);
    return data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('deactivationNotice');
    setDeactivationNotice(null);
    setUser(null);
    setToken(null);
  };

  // Update authenticated user in state & localStorage without full reload
  const updateUserContext = useCallback((updatedUser) => {
    if (!updatedUser) return;
    setUser((prev) => {
      const merged = { ...(prev || {}), ...updatedUser };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    deactivationNotice,
    restoreSession,
    updateUserContext,
    isAuthenticated: Boolean(token && user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
