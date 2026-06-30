const express = require('express');
const router = express.Router();

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadStudentPhoto,
} = require('../controllers/student.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../config/multer.config');
const {
  createStudentValidator,
  updateStudentValidator,
} = require('../validators/student.validator');

router.use(authMiddleware);

router.post('/', authorize('ADMIN'), createStudentValidator, validate, createStudent);
router.get('/', authorize('ADMIN', 'TEACHER'), getStudents); // ?page=&limit=&search=&departmentId=&courseId=&classId=&status=
router.get('/:id', getStudentById); // student can view their own profile
router.put('/:id', authorize('ADMIN'), updateStudentValidator, validate, updateStudent);
router.delete('/:id', authorize('ADMIN'), deleteStudent);
router.post('/:id/photo', authorize('ADMIN', 'STUDENT'), upload.single('image'), uploadStudentPhoto);

module.exports = router;