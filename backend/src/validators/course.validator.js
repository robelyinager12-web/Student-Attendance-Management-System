const { body } = require('express-validator');

const createCourseValidator = [
  body('name').trim().notEmpty().withMessage('Course name is required'),
  body('code').trim().notEmpty().withMessage('Course code is required'),
  body('creditHour').optional().isInt({ min: 1, max: 10 }).withMessage('Credit hour must be a number between 1 and 10'),
  body('semester').optional().isString(),
  body('departmentId').notEmpty().withMessage('Department is required').isUUID().withMessage('Invalid department ID'),
];

const updateCourseValidator = [
  body('name').optional().trim().notEmpty().withMessage('Course name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Course code cannot be empty'),
  body('creditHour').optional().isInt({ min: 1, max: 10 }).withMessage('Credit hour must be a number between 1 and 10'),
  body('semester').optional().isString(),
  body('departmentId').optional().isUUID().withMessage('Invalid department ID'),
];

module.exports = { createCourseValidator, updateCourseValidator };