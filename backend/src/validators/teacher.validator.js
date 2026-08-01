const { body } = require('express-validator');

const createTeacherValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isString(),
  body('departmentId').optional().isUUID().withMessage('Invalid department ID'),
  body('qualification').optional().isString(),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
];

const updateTeacherValidator = [
  body('phone').optional().isString(),
  body('departmentId').optional().isUUID().withMessage('Invalid department ID'),
  body('qualification').optional().isString(),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
];

module.exports = { createTeacherValidator, updateTeacherValidator };