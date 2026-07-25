import api from './api';

export const studentEnrollmentService = {
  getAll: (params) => api.get('/student-enrollments', { params }),
  enroll: (data) => api.post('/student-enrollments', data),
  bulkEnroll: (data) => api.post('/student-enrollments/bulk', data),
  enrollSection: (data) => api.post('/student-enrollments/enroll-section', data),
  update: (id, data) => api.put(`/student-enrollments/${id}`, data),
  remove: (id) => api.delete(`/student-enrollments/${id}`),
};