const express = require('express');
const router = express.Router();

// Existing routes
router.use('/auth', require('./auth.routes'));
router.use('/departments', require('./department.routes'));
router.use('/courses', require('./course.routes'));
router.use('/classes', require('./class.routes'));
router.use('/teachers', require('./teacher.routes'));
router.use('/students', require('./student.routes'));
router.use('/attendance', require('./attendance.routes'));
router.use('/reports', require('./report.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/profile', require('./profile.routes'));

// New Injibara University routes
router.use('/colleges', require('./college.routes'));
router.use('/programs', require('./program.routes'));
router.use('/batches', require('./batch.routes'));
router.use('/academic-years', require('./academicYear.routes'));
router.use('/semesters', require('./semester.routes'));
router.use('/sections', require('./section.routes'));
router.use('/import', require('./import.routes'));

module.exports = router;