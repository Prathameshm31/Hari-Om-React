import api from './client';

const buildQuery = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'ALL') qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
};

export const fetchProducts = (params = {}) =>
  api.get(`/products${buildQuery(params)}`).then((r) => r.data);

export const createOrder = (payload) =>
  api.post('/orders', payload).then((r) => r.data);

export const fetchMyOrders = (params = {}) =>
  api.get(`/orders${buildQuery(params)}`).then((r) => r.data);

export const fetchMyOrderDetail = (orderId) =>
  api.get(`/orders/${orderId}`).then((r) => r.data);

export const cancelMyOrder = (orderId) =>
  api.put(`/orders/${orderId}/cancel`).then((r) => r.data);

export const fetchOrderRequests = (params = {}) =>
  api.get(`/admin/orders${buildQuery(params)}`).then((r) => r.data);

export const fetchOrderRequestDetail = (orderId) =>
  api.get(`/admin/orders/${orderId}`).then((r) => r.data);

export const approveOrder = (orderId) =>
  api.put(`/admin/orders/${orderId}/approve`).then((r) => r.data);

export const rejectOrder = (orderId, reason) =>
  api.put(`/admin/orders/${orderId}/reject`, { reason }).then((r) => r.data);

export const updateOrderStatus = (orderId, status) =>
  api.put(`/admin/orders/${orderId}/status`, { status }).then((r) => r.data);

export const fetchRecentOrderRequests = (limit = 10) =>
  api.get(`/admin/dashboard/recent-order-requests${buildQuery({ limit })}`).then((r) => r.data);
