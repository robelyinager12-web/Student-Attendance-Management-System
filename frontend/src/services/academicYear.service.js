import api from './api';

export const academicYearService = {
  getAll: (params) => api.get('/academic-years', { params }),
  getById: (id) => api.get(`/academic-years/${id}`),
  create: (data) => api.post('/academic-years', data),
  update: (id, data) => api.put(`/academic-years/${id}`, data),
  delete: (id) => api.delete(`/academic-years/${id}`),
};