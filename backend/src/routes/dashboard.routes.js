const express = require('express');
const router = express.Router();

const {
  getAdminDashboard,
  getMonthlyChart,
  getWeeklyChart,
  getStudentGrowthChart,
  getDepartmentStats,
  getBatchStats,
  getAttendanceByDepartment,
  getLowAttendanceStudents,
  getRecentActivity,
  getTeacherDashboard,
  getStudentDashboard,
} = require('../controllers/dashboard.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

router.get('/admin', authorize('ADMIN'), getAdminDashboard);
router.get('/admin/chart/monthly', authorize('ADMIN'), getMonthlyChart);
router.get('/admin/chart/weekly', authorize('ADMIN'), getWeeklyChart);
router.get('/admin/chart/student-growth', authorize('ADMIN'), getStudentGrowthChart);
router.get('/admin/chart/department-stats', authorize('ADMIN'), getDepartmentStats);
router.get('/admin/chart/batch-stats', authorize('ADMIN'), getBatchStats);
router.get('/admin/chart/attendance-by-dept', authorize('ADMIN'), getAttendanceByDepartment);
router.get('/admin/low-attendance', authorize('ADMIN'), getLowAttendanceStudents);
router.get('/admin/recent-activity', authorize('ADMIN'), getRecentActivity);
router.get('/teacher', authorize('TEACHER'), getTeacherDashboard);
router.get('/student', authorize('STUDENT'), getStudentDashboard);

module.exports = router;