const express = require('express');
const router  = express.Router();
const {
  getStudents, getStudentById, createStudent,
  updateStudent, deleteStudent, getMyProfile,
  getStudentsBySection,
} = require('../controllers/student.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize      = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

router.get('/export', authorize('ADMIN'), async (req, res) => {
  try {
    const { Student, User, Department, Section, Batch, AcademicYear, Semester } = require('../models');
    const students = await Student.findAll({
      include: [
        { model: User,        attributes: ['name', 'email'], required: true },
        { model: Department,  attributes: ['name'],          required: false },
        { model: Batch,       attributes: ['name', 'year'], required: false },
        { model: AcademicYear,attributes: ['name'],          required: false },
        { model: Semester,    attributes: ['name'],          required: false },
        { model: Section,     attributes: ['name'],          required: false },
      ],
      order: [[User, 'name', 'ASC']],
    });

    // Build CSV
    const rows = [
      ['Student ID','Full Name','Email','Department','Batch','Year','Semester','Section','Status'],
      ...students.map(s => [
        s.studentCode ?? '',
        s.User?.name ?? '',
        s.User?.email ?? '',
        s.Department?.name ?? '',
        s.Batch?.name ?? '',
        s.AcademicYear?.name ?? '',
        s.Semester?.name ?? '',
        s.Section?.name ?? '',
        s.status ?? '',
      ]),
    ];

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
    return res.send(csv);
  } catch (err) {
    console.error('Export error:', err.message);
    return res.status(500).json({ message: 'Export failed: ' + err.message });
  }
});

router.get('/me',        getMyProfile);
router.get('/section',   getStudentsBySection);
router.get('/',          getStudents);
router.get('/:id',       getStudentById);
router.post('/',         authorize('ADMIN'), createStudent);
router.put('/:id',       authorize('ADMIN'), updateStudent);
router.delete('/:id',    authorize('ADMIN'), deleteStudent);

module.exports = router;