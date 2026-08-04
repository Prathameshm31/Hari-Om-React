import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export const AuthContext = createContext(null);

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = useCallback(async () => {
    try {
      if (user?.id) {
        await api.post('/auth/logout', { userId: user.id });
      }
    } catch {
      // Ignore logout API errors, always clear session
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const sendHeartbeat = () => {
      api.post('/user/heartbeat', { userId: user.id }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
