const express = require('express');
const router = express.Router();
const {
  markAttendance,
  markBulkAttendance,
  updateAttendance,
  deleteAttendance,
  getClassAttendance,
  getSectionAttendance,
  getStudentAttendance,
  getWeeklyAttendance,
  getMonthlyAttendance,
  getStudentsForAttendance,
  checkSessionAttendance,
  getAttendanceHistory,
} = require('../controllers/attendance.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

// Mark attendance
router.post('/', authorize('ADMIN', 'TEACHER'), markAttendance);
router.post('/bulk', authorize('ADMIN', 'TEACHER'), markBulkAttendance);

// Update / Delete
router.put('/:id', authorize('ADMIN', 'TEACHER'), updateAttendance);
router.delete('/:id', authorize('ADMIN', 'TEACHER'), deleteAttendance);

// Query attendance
router.get('/', authorize('ADMIN', 'TEACHER'), getClassAttendance);
router.get('/section', getStudentsForAttendance);
router.get('/session/check', checkSessionAttendance);
router.get('/history', authorize('ADMIN', 'TEACHER'), getAttendanceHistory);
router.get('/weekly', authorize('ADMIN', 'TEACHER'), getWeeklyAttendance);
router.get('/monthly', authorize('ADMIN', 'TEACHER'), getMonthlyAttendance);
router.get('/student/:studentId', getStudentAttendance);

module.exports = router;