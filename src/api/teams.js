import api from './client';

const buildQuery = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'ALL') qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
};

// Admin Team endpoints
export const fetchTeams = (params = {}) => api.get(`/admin/teams${buildQuery(params)}`).then((r) => r.data);
export const fetchTeam = (id) => api.get(`/admin/teams/${id}`).then((r) => r.data);
export const createTeam = (payload) => api.post('/admin/teams', payload).then((r) => r.data);
export const updateTeam = (id, payload) => api.put(`/admin/teams/${id}`, payload).then((r) => r.data);
export const deleteTeam = (id) => api.delete(`/admin/teams/${id}`).then((r) => r.data);

export const addTeamMember = (teamId, retailerIds) => api.post(`/admin/teams/${teamId}/members`, { retailerIds }).then((r) => r.data);
export const removeTeamMember = (teamId, retailerId) => api.delete(`/admin/teams/${teamId}/members/${retailerId}`).then((r) => r.data);

export const fetchUnassignedRetailers = () => api.get('/admin/teams/unassigned-retailers').then((r) => r.data);

export const addTeamPoints = (teamId, payload) => api.post(`/admin/teams/${teamId}/points`, payload).then((r) => r.data);

export const fetchTeamDashboardStats = () => api.get('/admin/teams/stats').then((r) => r.data);
export const fetchTeamLeaderboard = () => api.get('/admin/teams/leaderboard').then((r) => r.data);
export const fetchRecentTeamActivities = () => api.get('/admin/teams/recent-activities').then((r) => r.data);

// Retailer Team endpoints
export const fetchMyTeam = () => api.get('/retailer/my-team').then((r) => r.data);
