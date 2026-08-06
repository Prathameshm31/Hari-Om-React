import api from './client';

const buildQuery = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'ALL') qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
};

const download = async (url, filename) => {
  const res = await api.get(url, { responseType: 'blob' });
  const blobUrl = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
};

export const fetchRetailers = (params = {}) =>
  api.get(`/admin/retailers${buildQuery(params)}`).then((r) => r.data);

export const fetchCities = () =>
  api.get('/admin/retailers/cities').then((r) => r.data);

export const fetchTopRetailers = (params = {}) =>
  api.get(`/admin/dashboard/top-retailers${buildQuery({ limit: 5, ...params })}`).then((r) => r.data);

export const fetchDashboardStats = () =>
  api.get('/admin/dashboard/stats').then((r) => r.data);

export const fetchRecentTransactions = (limit = 8) =>
  api.get(`/admin/dashboard/recent-transactions${buildQuery({ limit })}`).then((r) => r.data);

export const fetchRecentActivities = (limit = 8) =>
  api.get(`/admin/dashboard/recent-activities${buildQuery({ limit })}`).then((r) => r.data);

export const fetchAuditLogs = (limit = 20) =>
  api.get(`/admin/audit-logs${buildQuery({ limit })}`).then((r) => r.data);

export const fetchRetailer = (id) =>
  api.get(`/admin/retailers/${id}`).then((r) => r.data);

export const createRetailer = (payload) =>
  api.post('/admin/retailers', payload).then((r) => r.data);

export const deleteRetailer = (id) =>
  api.delete(`/admin/retailers/${id}`).then((r) => r.data);

export const adjustRewardPoints = (id, payload) =>
  api.post(`/admin/retailers/${id}/reward-points`, payload).then((r) => r.data);

export const updateRetailer = (id, payload) =>
  api.put(`/admin/retailers/${id}`, payload).then((r) => r.data);

export const updateRetailerStatus = (id, isActive) =>
  api.put(`/admin/retailers/${id}/status`, { isActive }).then((r) => r.data);

export const updateRetailerTier = (id, tier, reason) =>
  api.put(`/admin/retailers/${id}/tier`, { tier, reason }).then((r) => r.data);

export const addBonusPoints = (id, points, remarks) =>
  api.post(`/admin/retailers/${id}/rewards/bonus`, { points, remarks }).then((r) => r.data);

export const deductPoints = (id, points, remarks) =>
  api.post(`/admin/retailers/${id}/rewards/deduct`, { points, remarks }).then((r) => r.data);

export const resetRetailerPassword = (id, newPassword) =>
  api.post(`/admin/retailers/${id}/reset-password`, { newPassword }).then((r) => r.data);

export const fetchOrders = (id, params = {}) =>
  api.get(`/admin/retailers/${id}/orders${buildQuery(params)}`).then((r) => r.data);

export const fetchOrderDetail = (orderId) =>
  api.get(`/admin/retailers/orders/${orderId}`).then((r) => r.data);

export const fetchRewardHistory = (id) =>
  api.get(`/admin/retailers/${id}/reward-history`).then((r) => r.data);

export const fetchTierHistory = (id) =>
  api.get(`/admin/retailers/${id}/tier-history`).then((r) => r.data);

export const fetchAnalytics = (id) =>
  api.get(`/admin/retailers/${id}/analytics`).then((r) => r.data);

export const fetchTimeline = (id) =>
  api.get(`/admin/retailers/${id}/timeline`).then((r) => r.data);

export const fetchLoginHistory = (id) =>
  api.get(`/admin/retailers/${id}/login-history`).then((r) => r.data);

export const exportRetailersExcel = () =>
  download('/admin/retailers/export/excel', 'retailers.xlsx');

export const exportRetailersPdf = () =>
  download('/admin/retailers/export/pdf', 'retailers.pdf');

export const exportOrdersExcel = (id, params = {}) =>
  download(`/admin/retailers/${id}/orders/export/excel${buildQuery(params)}`, 'orders.xlsx');

export const exportOrdersPdf = (id, params = {}) =>
  download(`/admin/retailers/${id}/orders/export/pdf${buildQuery(params)}`, 'orders.pdf');
