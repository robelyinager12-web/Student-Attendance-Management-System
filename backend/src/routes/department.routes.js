const express = require('express');
const router = express.Router();

const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/department.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createDepartmentValidator,
  updateDepartmentValidator,
} = require('../validators/department.validator');

router.use(authMiddleware); // all routes below require login

router.post('/', authorize('ADMIN'), createDepartmentValidator, validate, createDepartment);
router.get('/', getDepartments); // any logged-in role can view
router.get('/:id', getDepartmentById);
router.put('/:id', authorize('ADMIN'), updateDepartmentValidator, validate, updateDepartment);
router.delete('/:id', authorize('ADMIN'), deleteDepartment);

module.exports = router;