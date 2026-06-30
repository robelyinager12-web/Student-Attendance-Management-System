const express = require('express');
const router = express.Router();

const {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  uploadTeacherPhoto,
} = require('../controllers/teacher.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../config/multer.config');
const {
  createTeacherValidator,
  updateTeacherValidator,
} = require('../validators/teacher.validator');

router.use(authMiddleware);

router.post('/', authorize('ADMIN'), createTeacherValidator, validate, createTeacher);
router.get('/', authorize('ADMIN'), getTeachers); // supports ?departmentId= and ?search=
router.get('/:id', getTeacherById); // teacher can view their own profile too
router.put('/:id', authorize('ADMIN', 'TEACHER'), updateTeacherValidator, validate, updateTeacher);
router.delete('/:id', authorize('ADMIN'), deleteTeacher);
router.post('/:id/photo', authorize('ADMIN', 'TEACHER'), upload.single('image'), uploadTeacherPhoto);

module.exports = router;