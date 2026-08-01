const { Op } = require('sequelize');
const { Attendance, Student, User, Class, Course, Department } = require('../models');

async function getAttendanceReportData({ classId, studentId, departmentId, from, to }) {
  const where = {};
  if (classId) where.classId = classId;
  if (studentId) where.studentId = studentId;
  if (from && to) where.date = { [Op.between]: [from, to] };

  const studentInclude = { model: Student, include: [{ model: User, attributes: ['name', 'email'] }] };
  if (departmentId) studentInclude.where = { departmentId };

  const records = await Attendance.findAll({
    where,
    include: [
      studentInclude,
      { model: Class, attributes: ['name', 'section'] },
      { model: Course, attributes: ['name', 'code'] },
    ],
    order: [['date', 'DESC']],
  });

  const headers = ['Date', 'Student Name', 'Student Code', 'Class', 'Course', 'Status', 'Remark'];

  const rows = records.map((r) => [
    r.date,
    r.Student?.User?.name || '',
    r.Student?.studentCode || '',
    r.Class ? `${r.Class.name} ${r.Class.section || ''}`.trim() : '',
    r.Course?.name || '',
    r.status,
    r.remark || '',
  ]);

  return { headers, rows, records };
}

module.exports = { getAttendanceReportData };