import api from './api';

export const dashboardService = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getMonthlyChart: () => api.get('/dashboard/admin/chart/monthly'),
  getWeeklyChart: () => api.get('/dashboard/admin/chart/weekly'),
  getStudentGrowth: () => api.get('/dashboard/admin/chart/student-growth'),
  getDepartmentStats: () => api.get('/dashboard/admin/chart/department-stats'),
  getTeacherStats: () => api.get('/dashboard/teacher'),
  getStudentStats: () => api.get('/dashboard/student'),
};