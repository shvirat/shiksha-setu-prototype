import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMe() {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiRequest('/auth/me');
        setUser(res.data.user);
        setProfile(res.data.profile);
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, []);

  const login = async (email, password) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(res.data.token);
    setUser(res.data.user);
    setProfile(res.data.profile);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setAuthToken(res.data.token);
    setUser(res.data.user);
    setProfile(res.data.profile);
    return res.data.user;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshUser = async () => {
    try {
      const res = await apiRequest('/auth/me');
      setUser(res.data.user);
      setProfile(res.data.profile);
    } catch (_) {}
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
