import api from './api';

export const attendanceService = {
  mark: (data) => api.post('/attendance', data),
  markBulk: (data) => api.post('/attendance/bulk', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  getByClass: (classId, date) =>
    api.get('/attendance', { params: { classId, date } }),
  getBySection: (sectionId, courseId, date) =>
    api.get('/attendance/section', { params: { sectionId, courseId, date } }),
  getByStudent: (studentId, params) =>
    api.get(`/attendance/student/${studentId}`, { params }),
  getWeekly: (params) => api.get('/attendance/weekly', { params }),
  getMonthly: (params) => api.get('/attendance/monthly', { params }),
  getSummary: (params) => api.get('/attendance/summary', { params }),
};