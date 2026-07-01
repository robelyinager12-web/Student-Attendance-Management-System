import api from './api';

export const reportService = {
  daily: (params) => api.get('/reports/daily', { params }),
  weekly: (params) => api.get('/reports/weekly', { params }),
  monthly: (params) => api.get('/reports/monthly', { params }),
  student: (params) => api.get('/reports/student', { params }),
  class: (params) => api.get('/reports/class', { params }),
  department: (params) => api.get('/reports/department', { params }),
};