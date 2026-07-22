const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { Attendance, Student, User, Class, Course, Teacher } = require('../models');
const { getTeacherIdFromUser, normalizeDate, markSingleAttendance } = require('../services/attendance.service');

const markAttendance = asyncHandler(async (req, res) => {
  const { studentId, classId, courseId, date, status, remark } = req.body;

  const student = await Student.findByPk(studentId);
  if (!student) return error(res, 404, 'Student not found');

  const classData = await Class.findByPk(classId);
  if (!classData) return error(res, 404, 'Class not found');

  // Get teacherId — works for both TEACHER and ADMIN roles
  let teacherId = await getTeacherIdFromUser(req.user.id);

  if (!teacherId) {
    // Admin marking attendance — use the class assigned teacher
    teacherId = classData.teacherId;
  }

  if (!teacherId) {
    // No teacher assigned to class — find any teacher as fallback
    const anyTeacher = await Teacher.findOne();
    teacherId = anyTeacher ? anyTeacher.id : null;
  }

  if (!teacherId) {
    return error(res, 400, 'No teacher found. Please assign a teacher to this class first.');
  }

  const attendance = await markSingleAttendance({
    studentId,
    classId,
    courseId,
    date,
    status,
    remark,
    teacherId,
  });

  const { checkLowAttendanceAndNotify } = require('../services/notification.service');
  checkLowAttendanceAndNotify(studentId).catch((err) =>
    console.error('Low attendance check failed:', err)
  );

  return success(res, 201, 'Attendance marked successfully', attendance);
});

const markBulkAttendance = asyncHandler(async (req, res) => {
  const { classId, sectionId, courseId, date, records } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return error(res, 400, 'records[] is required and must not be empty');
  }

  if (!classId && !sectionId) {
    return error(res, 400, 'classId or sectionId is required');
  }

  let teacherId = await getTeacherIdFromUser(req.user.id);

  if (!teacherId && classId) {
    const classData = await Class.findByPk(classId);
    if (classData) teacherId = classData.teacherId;
  }

  if (!teacherId) {
    const anyTeacher = await Teacher.findOne();
    teacherId = anyTeacher ? anyTeacher.id : null;
  }

  if (!teacherId) {
    return error(res, 400, 'No teacher found. Please create a teacher account first.');
  }

  const results = [];
  for (const record of records) {
    const attendanceDate = normalizeDate(date);

    // Build unique key — use sectionId+courseId if provided
    const whereClause = {
      studentId: record.studentId,
      date: attendanceDate,
    };

    if (courseId) whereClause.courseId = courseId;
    else if (classId) whereClause.classId = classId;

    const [attendance] = await Attendance.findOrCreate({
      where: whereClause,
      defaults: {
        studentId: record.studentId,
        teacherId,
        classId: classId || null,
        sectionId: sectionId || null,
        courseId: courseId || null,
        date: attendanceDate,
        time: new Date().toTimeString().split(' ')[0],
        status: record.status,
        remark: record.remark || null,
      },
    });

    await attendance.update({ status: record.status, remark: record.remark || null });
    results.push(attendance);

    const { checkLowAttendanceAndNotify } = require('../services/notification.service');
    checkLowAttendanceAndNotify(record.studentId).catch(() => {});
  }

  return success(res, 201, 'Bulk attendance marked successfully', {
    count: results.length,
  });
});

const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const attendance = await Attendance.findByPk(id);
  if (!attendance) return error(res, 404, 'Attendance record not found');
  await attendance.update(req.body);
  return success(res, 200, 'Attendance updated successfully', attendance);
});

const deleteAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const attendance = await Attendance.findByPk(id);
  if (!attendance) return error(res, 404, 'Attendance record not found');
  await attendance.destroy();
  return success(res, 200, 'Attendance record deleted successfully');
});

const getClassAttendance = asyncHandler(async (req, res) => {
  const { classId, date } = req.query;
  if (!classId) return error(res, 400, 'classId query parameter is required');

  const attendanceDate = normalizeDate(date);

  const records = await Attendance.findAll({
    where: { classId, date: attendanceDate },
    include: [
      { model: Student, include: [{ model: User, attributes: ['name', 'email'] }] },
      { model: Teacher, include: [{ model: User, attributes: ['name'] }] },
      { model: Course, attributes: ['name', 'code'] },
    ],
    order: [['createdAt', 'ASC']],
  });

  return success(res, 200, 'Class attendance fetched successfully', records);
});

const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { from, to } = req.query;

  const where = { studentId };
  if (from && to) {
    where.date = { [Op.between]: [from, to] };
  }

  const records = await Attendance.findAll({
    where,
    include: [
      { model: Class, attributes: ['name', 'section'] },
      { model: Course, attributes: ['name', 'code'] },
    ],
    order: [['date', 'DESC']],
  });

  const total = records.length;
  const present = records.filter((r) => r.status === 'PRESENT').length;
  const absent = records.filter((r) => r.status === 'ABSENT').length;
  const late = records.filter((r) => r.status === 'LATE').length;
  const excused = records.filter((r) => r.status === 'EXCUSED').length;
  const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

  return success(res, 200, 'Student attendance fetched successfully', {
    records,
    summary: { total, present, absent, late, excused, percentage },
  });
});

const getWeeklyAttendance = asyncHandler(async (req, res) => {
  const { classId, startDate } = req.query;
  if (!classId || !startDate) return error(res, 400, 'classId and startDate are required');

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const records = await Attendance.findAll({
    where: { classId, date: { [Op.between]: [start, end] } },
    include: [{ model: Student, include: [{ model: User, attributes: ['name'] }] }],
    order: [['date', 'ASC']],
  });

  return success(res, 200, 'Weekly attendance fetched successfully', records);
});

const getMonthlyAttendance = asyncHandler(async (req, res) => {
  const { classId, month, year } = req.query;
  if (!classId || !month || !year) {
    return error(res, 400, 'classId, month, and year are required');
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  const records = await Attendance.findAll({
    where: { classId, date: { [Op.between]: [start, end] } },
    include: [{ model: Student, include: [{ model: User, attributes: ['name'] }] }],
    order: [['date', 'ASC']],
  });

  return success(res, 200, 'Monthly attendance fetched successfully', records);
});
// GET /api/attendance/section?sectionId=&courseId=&date=
const getSectionAttendance = asyncHandler(async (req, res) => {
  const { sectionId, courseId, date } = req.query;
  if (!sectionId) return error(res, 400, 'sectionId is required');

  const attendanceDate = normalizeDate(date);
  const where = { sectionId, date: attendanceDate };
  if (courseId) where.courseId = courseId;

  const records = await Attendance.findAll({
    where,
    include: [
      {
        model: Student,
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
      { model: Course, attributes: ['name', 'code'] },
    ],
    order: [['createdAt', 'ASC']],
  });

  return success(res, 200, 'Section attendance fetched', records);
});

module.exports = {
  markAttendance,
  markBulkAttendance,
  updateAttendance,
  deleteAttendance,
  getClassAttendance,
  getSectionAttendance,
  getStudentAttendance,
  getWeeklyAttendance,
  getMonthlyAttendance,
};