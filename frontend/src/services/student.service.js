import api from './api';

export const studentService = {
  getAll: (params = {}) => {
    // Remove empty values to avoid bad query params
    const clean = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) clean[k] = v;
    });
    return api.get('/students', { params: clean });
  },
  getById:     (id)        => api.get(`/students/${id}`),
  create:      (data)      => api.post('/students', data),
  update:      (id, data)  => api.put(`/students/${id}`, data),
  delete:      (id)        => api.delete(`/students/${id}`),
  uploadPhoto: (id, formData) =>
    api.post(`/students/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};