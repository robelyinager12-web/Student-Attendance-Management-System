import api from './api';

export const auditLogService = {
  getAll: (params) => api.get('/audit-logs', { params }),
  getById: (id) => api.get(`/audit-logs/${id}`),
  getStats: () => api.get('/audit-logs/stats'),
  clearOld: (beforeDate) =>
    api.delete('/audit-logs/clear', { data: { beforeDate } }),
};