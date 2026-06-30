const express = require('express');
const router = express.Router();

const {
  getAdminDashboard,
  getMonthlyChart,
  getWeeklyChart,
  getStudentGrowthChart,
  getDepartmentStats,
  getTeacherDashboard,
  getStudentDashboard,
} = require('../controllers/dashboard.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

// Admin dashboard
router.get('/admin', authorize('ADMIN'), getAdminDashboard);
router.get('/admin/chart/monthly', authorize('ADMIN'), getMonthlyChart);
router.get('/admin/chart/weekly', authorize('ADMIN'), getWeeklyChart);
router.get('/admin/chart/student-growth', authorize('ADMIN'), getStudentGrowthChart);
router.get('/admin/chart/department-stats', authorize('ADMIN'), getDepartmentStats);

// Teacher dashboard
router.get('/teacher', authorize('TEACHER'), getTeacherDashboard);

// Student dashboard
router.get('/student', authorize('STUDENT'), getStudentDashboard);

module.exports = router;