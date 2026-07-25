import api from './api';

export const courseAssignmentService = {
  assign: (data) => api.post('/course-assignments', data),
  getAll: (params) => api.get('/course-assignments', { params }),
  getMyCourses: () => api.get('/course-assignments/my-courses'),
  remove: (id) => api.delete(`/course-assignments/${id}`),
  toggle: (id) => api.put(`/course-assignments/${id}/toggle`),
};