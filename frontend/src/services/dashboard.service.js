import api from './api';

export const dashboardService = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getMonthlyChart: () => api.get('/dashboard/admin/chart/monthly'),
  getWeeklyChart: () => api.get('/dashboard/admin/chart/weekly'),
  getStudentGrowth: () => api.get('/dashboard/admin/chart/student-growth'),
  getDepartmentStats: () => api.get('/dashboard/admin/chart/department-stats'),
  getBatchStats: () => api.get('/dashboard/admin/chart/batch-stats'),
  getAttendanceByDept: () => api.get('/dashboard/admin/chart/attendance-by-dept'),
  getLowAttendance: (threshold = 75) =>
    api.get(`/dashboard/admin/low-attendance?threshold=${threshold}`),
  getRecentActivity: () => api.get('/dashboard/admin/recent-activity'),
  getTeacherStats: () => api.get('/dashboard/teacher'),
  getStudentStats: () => api.get('/dashboard/student'),
};