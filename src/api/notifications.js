import api from './client';

export const fetchNotifications = (limit = 30) =>
  api.get(`/notifications?limit=${limit}`).then((r) => r.data);

export const fetchUnreadCount = () =>
  api.get('/notifications/unread-count').then((r) => r.data);

export const markNotificationRead = (id) =>
  api.put(`/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () =>
  api.put('/notifications/read-all').then((r) => r.data);

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`).then((r) => r.data);
