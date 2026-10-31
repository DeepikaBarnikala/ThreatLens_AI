import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('threatlens_user');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Saved user session could not be read:', error);
    localStorage.removeItem('threatlens_user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);
  const [token, setToken] = useState(() => localStorage.getItem('threatlens_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const clearSession = () => {
      localStorage.removeItem('threatlens_token');
      localStorage.removeItem('threatlens_user');
      if (active) {
        setUser(null);
        setToken(null);
      }
    };

    window.addEventListener('threatlens:unauthorized', clearSession);

    const checkAuth = async () => {
      const storedToken = localStorage.getItem('threatlens_token');
      if (!storedToken) {
        if (active) setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (active) {
          setUser(res.data);
          localStorage.setItem('threatlens_user', JSON.stringify(res.data));
        }
      } catch (err) {
        if (err.response?.status !== 401 && err.response?.status !== 403) {
          console.error('Auth check failed:', err);
        } else {
          clearSession();
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      active = false;
      window.removeEventListener('threatlens:unauthorized', clearSession);
    };
  }, []);

  const saveSession = (res) => {
    const { access_token, user: loggedUser } = res.data;
    setToken(access_token);
    setUser(loggedUser);
    localStorage.setItem('threatlens_token', access_token);
    localStorage.setItem('threatlens_user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    return saveSession(res);
  };

  const register = async (registration) => {
    const res = await authApi.register(registration);
    return saveSession(res);
  };

  const quickLogin = async (roleKey) => {
    const roleCredentials = {
      admin: { username: 'admin', password: 'Admin@123' },
      secmanager: { username: 'secmanager', password: 'Admin@123' },
      itadmin: { username: 'itadmin', password: 'Admin@123' },
      employee: { username: 'employee', password: 'Admin@123' }
    };
    const creds = roleCredentials[roleKey] || roleCredentials.admin;
    return await login(creds.username, creds.password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('threatlens_token');
    localStorage.removeItem('threatlens_user');
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (user.role === 'Admin') return true; // Admin has superuser access
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      quickLogin,
      logout,
      hasRole,
      isAuthenticated: !!user && !!token,
      role: user?.role
    }}>
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
