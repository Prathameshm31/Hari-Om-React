import api from './client';

const buildQuery = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'ALL') qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
};

export const fetchAdminProducts = (params = {}) =>
  api.get(`/admin/products${buildQuery(params)}`).then((r) => r.data);

export const fetchAdminProduct = (id) =>
  api.get(`/admin/products/${id}`).then((r) => r.data);

export const createAdminProduct = (payload) =>
  api.post('/admin/products', payload).then((r) => r.data);

export const updateAdminProduct = (id, payload) =>
  api.put(`/admin/products/${id}`, payload).then((r) => r.data);

export const deleteAdminProduct = (id) =>
  api.delete(`/admin/products/${id}`).then((r) => r.data);

export const fetchAdminProductStats = () =>
  api.get('/admin/products/stats').then((r) => r.data);

export const fetchProductCategories = () =>
  api.get('/admin/products/categories').then((r) => r.data);

export const uploadProductImage = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/admin/products/upload', form).then((r) => r.data);
};
