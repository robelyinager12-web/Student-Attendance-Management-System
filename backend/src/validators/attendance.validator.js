const { body } = require('express-validator');

const markAttendanceValidator = [
  body('studentId').notEmpty().withMessage('Student is required').isUUID().withMessage('Invalid student ID'),
  body('classId').notEmpty().withMessage('Class is required').isUUID().withMessage('Invalid class ID'),
  body('courseId').optional().isUUID().withMessage('Invalid course ID'),
  body('date').optional().isDate().withMessage('Invalid date'),
  body('status').isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).withMessage('Invalid attendance status'),
  body('remark').optional().isString(),
];

const bulkAttendanceValidator = [
  body('classId').notEmpty().withMessage('Class is required').isUUID().withMessage('Invalid class ID'),
  body('courseId').optional().isUUID().withMessage('Invalid course ID'),
  body('date').optional().isDate().withMessage('Invalid date'),
  body('records').isArray({ min: 1 }).withMessage('Records must be a non-empty array'),
  body('records.*.studentId').isUUID().withMessage('Invalid student ID in records'),
  body('records.*.status').isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).withMessage('Invalid status in records'),
];

const updateAttendanceValidator = [
  body('status').optional().isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).withMessage('Invalid attendance status'),
  body('remark').optional().isString(),
];

module.exports = { markAttendanceValidator, bulkAttendanceValidator, updateAttendanceValidator };