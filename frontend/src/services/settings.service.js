import api from './api';

export const settingsService = {
  getCollegeInfo: () => api.get('/settings/college'),
  updateCollegeInfo: (data) => api.put('/settings/college', data),
  getUsers: () => api.get('/settings/users'),
  toggleUserStatus: (id) => api.put(`/settings/users/${id}/toggle`),
  changeUserRole: (id, role) => api.put(`/settings/users/${id}/role`, { role }),
  resetUserPassword: (id, newPassword) =>
    api.put(`/settings/users/${id}/reset-password`, { newPassword }),
  deleteUser: (id) => api.delete(`/settings/users/${id}`),
  getSystemInfo: () => api.get('/settings/system'),
};