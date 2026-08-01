const { body } = require('express-validator');

const createStudentValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('dateOfBirth').optional().isDate().withMessage('Invalid date of birth'),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('departmentId').optional().isUUID().withMessage('Invalid department ID'),
  body('courseId').optional().isUUID().withMessage('Invalid course ID'),
  body('classId').optional().isUUID().withMessage('Invalid class ID'),
  body('year').optional().isString(),
  body('semester').optional().isString(),
  body('guardianName').optional().isString(),
  body('guardianPhone').optional().isString(),
  body('admissionDate').optional().isDate().withMessage('Invalid admission date'),
];

const updateStudentValidator = [
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('dateOfBirth').optional().isDate().withMessage('Invalid date of birth'),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('departmentId').optional().isUUID().withMessage('Invalid department ID'),
  body('courseId').optional().isUUID().withMessage('Invalid course ID'),
  body('classId').optional().isUUID().withMessage('Invalid class ID'),
  body('year').optional().isString(),
  body('semester').optional().isString(),
  body('guardianName').optional().isString(),
  body('guardianPhone').optional().isString(),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'GRADUATED']).withMessage('Invalid status'),
];

module.exports = { createStudentValidator, updateStudentValidator };