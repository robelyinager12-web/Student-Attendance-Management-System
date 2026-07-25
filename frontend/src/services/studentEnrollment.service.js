import api from './api';

export const studentEnrollmentService = {
  enroll: (data) => api.post('/student-enrollments', data),
  bulkEnroll: (data) => api.post('/student-enrollments/bulk', data),
  getAll: (params) => api.get('/student-enrollments', { params }),
  update: (id, data) => api.put(`/student-enrollments/${id}`, data),
  remove: (id) => api.delete(`/student-enrollments/${id}`),
};