const express = require('express');
const router = express.Router();

// ── Auth ─────────────────────────────────────────────────────────────────────
router.use('/auth', require('./auth.routes'));

// ── Core academic structure ───────────────────────────────────────────────────
router.use('/departments', require('./department.routes'));
router.use('/colleges', require('./college.routes'));
router.use('/programs', require('./program.routes'));
router.use('/batches', require('./batch.routes'));
router.use('/academic-years', require('./academicYear.routes'));
router.use('/semesters', require('./semester.routes'));
router.use('/sections', require('./section.routes'));
router.use('/courses', require('./course.routes'));
router.use('/classes', require('./class.routes'));

// ── People ────────────────────────────────────────────────────────────────────
router.use('/teachers', require('./teacher.routes'));
router.use('/students', require('./student.routes'));

// ── Course & Student assignments ──────────────────────────────────────────────
router.use('/course-assignments', require('./courseAssignment.routes'));
router.use('/student-enrollments', require('./studentEnrollment.routes'));

// ── Attendance ────────────────────────────────────────────────────────────────
router.use('/attendance', require('./attendance.routes'));

// ── Reports & Dashboard ───────────────────────────────────────────────────────
router.use('/reports', require('./report.routes'));
router.use('/dashboard', require('./dashboard.routes'));

// ── Notifications & Profile ───────────────────────────────────────────────────
router.use('/notifications', require('./notification.routes'));
router.use('/profile', require('./profile.routes'));

// ── Import ────────────────────────────────────────────────────────────────────
router.use('/import', require('./import.routes'));

// ── Settings & Audit ─────────────────────────────────────────────────────────
router.use('/settings', require('./settings.routes'));
router.use('/audit-logs', require('./auditLog.routes'));

module.exports = router;