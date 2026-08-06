import api from './client';

const buildQuery = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'ALL') qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
};

export const fetchAdminRewards = (params = {}) =>
  api.get(`/admin/rewards${buildQuery(params)}`).then((r) => r.data);

export const fetchAdminReward = (id) =>
  api.get(`/admin/rewards/${id}`).then((r) => r.data);

export const createAdminReward = (payload) =>
  api.post('/admin/rewards', payload).then((r) => r.data);

export const updateAdminReward = (id, payload) =>
  api.put(`/admin/rewards/${id}`, payload).then((r) => r.data);

export const deleteAdminReward = (id) =>
  api.delete(`/admin/rewards/${id}`).then((r) => r.data);

export const toggleAdminRewardStatus = (id) =>
  api.patch(`/admin/rewards/${id}/toggle`).then((r) => r.data);

export const fetchAdminRewardStats = () =>
  api.get('/admin/rewards/stats').then((r) => r.data);

export const uploadRewardImage = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/admin/rewards/upload', form).then((r) => r.data);
};

export const fetchMyRewards = () =>
  api.get('/rewards').then((r) => r.data);

export const fetchMyReward = (id) =>
  api.get(`/rewards/${id}`).then((r) => r.data);

export const fetchMyRewardSummary = () =>
  api.get('/rewards/summary').then((r) => r.data);

export const claimReward = (id) =>
  api.post(`/rewards/${id}/claim`).then((r) => r.data);
