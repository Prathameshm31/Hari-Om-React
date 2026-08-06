import api from './client';

export const fetchMyRetailer = () => api.get('/me/retailer').then((r) => r.data);

export const fetchMyOrders = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'ALL') qs.append(k, v);
  });
  const s = qs.toString();
  return api.get(`/me/orders${s ? `?${s}` : ''}`).then((r) => r.data);
};

export const fetchMyOrderDetail = (orderId) => api.get(`/me/orders/${orderId}`).then((r) => r.data);

export const fetchMyRewardHistory = () => api.get('/me/reward-history').then((r) => r.data);

export const fetchMyTierHistory = () => api.get('/me/tier-history').then((r) => r.data);
