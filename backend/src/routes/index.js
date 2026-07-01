const express = require('express');
const router = express.Router();

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

module.exports = router;