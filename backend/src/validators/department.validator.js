const { body } = require('express-validator');

const createDepartmentValidator = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('code').trim().notEmpty().withMessage('Department code is required'),
  body('description').optional().isString(),
  body('headOfDepartment').optional().isString(),
];

const updateDepartmentValidator = [
  body('name').optional().trim().notEmpty().withMessage('Department name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Department code cannot be empty'),
  body('description').optional().isString(),
  body('headOfDepartment').optional().isString(),
];

module.exports = { createDepartmentValidator, updateDepartmentValidator };