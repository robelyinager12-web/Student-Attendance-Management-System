const express = require('express');
const router = express.Router();

const {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  assignTeacher,
} = require('../controllers/class.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createClassValidator,
  updateClassValidator,
} = require('../validators/class.validator');

router.use(authMiddleware);

router.post('/', authorize('ADMIN'), createClassValidator, validate, createClass);
router.get('/', getClasses); // supports ?departmentId= and ?teacherId= filters
router.get('/:id', getClassById);
router.put('/:id', authorize('ADMIN'), updateClassValidator, validate, updateClass);
router.delete('/:id', authorize('ADMIN'), deleteClass);
router.put('/:id/assign-teacher', authorize('ADMIN'), assignTeacher);

module.exports = router;