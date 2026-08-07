import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';
import { fetchNotifications, fetchUnreadCount } from '../api/notifications';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext(null);

const POLL_INTERVAL_MS = 30 * 1000;

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const [items, count] = await Promise.all([
        fetchNotifications(30),
        fetchUnreadCount(),
      ]);
      setNotifications(items);
      setUnreadCount(count);
    } catch {
      // Ignore polling errors (e.g. network hiccups).
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    refresh();
    timerRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [user, refresh]);

  const markRead = useCallback(
    async (id) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await api.put(`/notifications/${id}/read`);
      } catch {
        refresh();
      }
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.put('/notifications/read-all');
    } catch {
      refresh();
    }
  }, [refresh]);

  const remove = useCallback(
    async (id) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      try {
        await api.delete(`/notifications/${id}`);
      } catch {
        refresh();
      }
    },
    [refresh]
  );

  const toggleOpen = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        open,
        toggleOpen,
        close,
        refresh,
        markRead,
        markAllRead,
        remove,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
