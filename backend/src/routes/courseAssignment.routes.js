const express = require('express');
const router = express.Router();
const {
  assignCourse,
  getCourseAssignments,
  getMyAssignedCourses,
  removeAssignment,
  toggleAssignment,
} = require('../controllers/courseAssignment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

// Admin only — manage assignments
router.post('/', authorize('ADMIN'), assignCourse);
router.get('/', authorize('ADMIN'), getCourseAssignments);
router.delete('/:id', authorize('ADMIN'), removeAssignment);
router.put('/:id/toggle', authorize('ADMIN'), toggleAssignment);

// Teacher — view own assignments
router.get('/my-courses', authorize('TEACHER'), getMyAssignedCourses);

module.exports = router;