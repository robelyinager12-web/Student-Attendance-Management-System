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
} = require('../controllers/attendance.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  markAttendanceValidator,
  bulkAttendanceValidator,
  updateAttendanceValidator,
} = require('../validators/attendance.validator');

router.use(authMiddleware);

router.post('/', authorize('ADMIN', 'TEACHER'), markAttendanceValidator, validate, markAttendance);
router.post('/bulk', authorize('ADMIN', 'TEACHER'), bulkAttendanceValidator, validate, markBulkAttendance);
router.put('/:id', authorize('ADMIN', 'TEACHER'), updateAttendanceValidator, validate, updateAttendance);
router.delete('/:id', authorize('ADMIN', 'TEACHER'), deleteAttendance);

router.get('/', authorize('ADMIN', 'TEACHER'), getClassAttendance); // ?classId=&date=
router.get('/weekly', authorize('ADMIN', 'TEACHER'), getWeeklyAttendance); // ?classId=&startDate=
router.get('/monthly', authorize('ADMIN', 'TEACHER'), getMonthlyAttendance); // ?classId=&month=&year=
router.get('/section', getSectionAttendance);
router.get('/student/:studentId', getStudentAttendance); // student can view their own; ?from=&to=

module.exports = router;