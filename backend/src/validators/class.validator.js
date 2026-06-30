const { body } = require('express-validator');

const createClassValidator = [
  body('name').trim().notEmpty().withMessage('Class name is required'),
  body('section').optional().isString(),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('semester').optional().isString(),
  body('departmentId').notEmpty().withMessage('Department is required').isUUID().withMessage('Invalid department ID'),
  body('teacherId').optional().isUUID().withMessage('Invalid teacher ID'),
];

const updateClassValidator = [
  body('name').optional().trim().notEmpty().withMessage('Class name cannot be empty'),
  body('section').optional().isString(),
  body('academicYear').optional().trim().notEmpty().withMessage('Academic year cannot be empty'),
  body('semester').optional().isString(),
  body('departmentId').optional().isUUID().withMessage('Invalid department ID'),
  body('teacherId').optional().isUUID().withMessage('Invalid teacher ID'),
];

module.exports = { createClassValidator, updateClassValidator };