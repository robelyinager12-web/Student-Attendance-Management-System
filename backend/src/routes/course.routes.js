const express = require('express');
const router = express.Router();

const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require('../controllers/course.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createCourseValidator,
  updateCourseValidator,
} = require('../validators/course.validator');

router.use(authMiddleware);

router.post('/', authorize('ADMIN'), createCourseValidator, validate, createCourse);
router.get('/', getCourses); // supports ?departmentId=<id> filter
router.get('/:id', getCourseById);
router.put('/:id', authorize('ADMIN'), updateCourseValidator, validate, updateCourse);
router.delete('/:id', authorize('ADMIN'), deleteCourse);

module.exports = router;