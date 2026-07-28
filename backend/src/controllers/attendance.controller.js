const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const {
  Attendance, Student, User, Class, Course,
  Teacher, Section, Batch, Semester,
  CourseAssignment, StudentEnrollment,
  AttendanceSession,
} = require('../models');
const {
  getTeacherIdFromUser,
  normalizeDate,
  markSingleAttendance,
} = require('../services/attendance.service');
const auditLog = require('../services/auditLog.service');

// ── Mark single attendance ───────────────────────────────────────────────────
const markAttendance = asyncHandler(async (req, res) => {
  const { studentId, classId, sectionId, courseId, date, status, remark } = req.body;

  const student = await Student.findByPk(studentId);
  if (!student) return error(res, 404, 'Student not found');

  const classData = classId ? await Class.findByPk(classId) : null;

  let teacherId = await getTeacherIdFromUser(req.user.id);
  if (!teacherId && classData) teacherId = classData.teacherId;
  if (!teacherId) {
    const anyTeacher = await Teacher.findOne();
    teacherId = anyTeacher ? anyTeacher.id : null;
  }

  const attendance = await markSingleAttendance({
    studentId, classId, sectionId, courseId,
    date, status, remark, teacherId,
  });

  const { checkLowAttendanceAndNotify } = require('../services/notification.service');
  checkLowAttendanceAndNotify(studentId).catch(() => {});

  return success(res, 201, 'Attendance marked successfully', attendance);
});

// ── Mark bulk attendance ─────────────────────────────────────────────────────
const markBulkAttendance = asyncHandler(async (req, res) => {
  const {
    classId, sectionId, courseId, batchId,
    semesterId, date, records, topic, notes,
  } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return error(res, 400, 'records[] is required and must not be empty');
  }

  // teacherId is optional — admin can mark without being a teacher
  let teacherId = null;

  try {
    teacherId = await getTeacherIdFromUser(req.user.id);
  } catch (_) {}

  if (!teacherId && classId) {
    try {
      const classData = await Class.findByPk(classId);
      if (classData?.teacherId) teacherId = classData.teacherId;
    } catch (_) {}
  }

  if (!teacherId) {
    try {
      const anyTeacher = await Teacher.findOne();
      if (anyTeacher) teacherId = anyTeacher.id;
    } catch (_) {}
  }

  // teacherId is now allowed to be null — admin marking directly
  const attendanceDate = normalizeDate(date);

  // Create or find AttendanceSession
  let session = null;
  try {
    const sessionWhere = {
      date: attendanceDate,
      courseId: courseId || null,
      sectionId: sectionId || null,
    };
    if (teacherId) sessionWhere.teacherId = teacherId;

    const existing = await AttendanceSession.findOne({ where: sessionWhere });

    if (existing) {
      session = existing;
    } else {
      session = await AttendanceSession.create({
        courseId:      courseId || null,
        teacherId:     teacherId || null,
        sectionId:     sectionId || null,
        batchId:       batchId || null,
        semesterId:    semesterId || null,
        date:          attendanceDate,
        topic:         topic || null,
        notes:         notes || null,
        status:        'COMPLETED',
      });
    }
  } catch (err) {
    console.error('Session create failed:', err.message);
  }

  const results = [];

  for (const record of records) {
    try {
      const existing = await Attendance.findOne({
        where: {
          studentId:  record.studentId,
          courseId:   courseId  || null,
          sectionId:  sectionId || null,
          date:       attendanceDate,
        },
      });

      if (existing) {
        await existing.update({
          status:     record.status,
          remark:     record.remark || null,
          editedById: req.user.id,
          editedAt:   new Date(),
        });
        results.push(existing);
      } else {
        const newRecord = await Attendance.create({
          studentId:   record.studentId,
          teacherId:   teacherId || null,
          classId:     classId   || null,
          sectionId:   sectionId || null,
          courseId:    courseId  || null,
          batchId:     batchId   || null,
          semesterId:  semesterId || null,
          sessionId:   session?.id || null,
          date:        attendanceDate,
          time:        new Date().toTimeString().split(' ')[0],
          status:      record.status,
          remark:      record.remark || null,
          markedById:  req.user.id,
        });
        results.push(newRecord);
      }

      const { checkLowAttendanceAndNotify } = require('../services/notification.service');
      checkLowAttendanceAndNotify(record.studentId).catch(() => {});

    } catch (rowErr) {
      console.error('Row error:', rowErr.message);
    }
  }

  try {
    await auditLog.log({
      userId:      req.user.id,
      userRole:    req.user.role,
      action:      'ATTENDANCE_MARK',
      entity:      'Attendance',
      entityId:    session?.id,
      newValues:   { courseId, sectionId, date, count: results.length },
      description: `Attendance marked for ${results.length} students`,
      req,
    });
  } catch (_) {}

  return success(res, 201, 'Bulk attendance marked successfully', {
    session,
    count: results.length,
  });
});

// ── Update attendance ────────────────────────────────────────────────────────
const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const attendance = await Attendance.findByPk(id);
  if (!attendance) return error(res, 404, 'Attendance record not found');

  const old = { status: attendance.status, remark: attendance.remark };
  await attendance.update({
    ...req.body,
    editedById: req.user.id,
    editedAt: new Date(),
  });

  await auditLog.log({
    userId: req.user.id,
    userRole: req.user.role,
    action: 'ATTENDANCE_EDIT',
    entity: 'Attendance',
    entityId: id,
    oldValues: old,
    newValues: { status: req.body.status, remark: req.body.remark },
    description: 'Attendance record edited',
    req,
  });

  return success(res, 200, 'Attendance updated successfully', attendance);
});

// ── Delete attendance ────────────────────────────────────────────────────────
const deleteAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const attendance = await Attendance.findByPk(id);
  if (!attendance) return error(res, 404, 'Attendance record not found');
  await attendance.destroy();
  return success(res, 200, 'Attendance record deleted successfully');
});

// ── Get class attendance ─────────────────────────────────────────────────────
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

// ── Get section attendance ───────────────────────────────────────────────────
const getSectionAttendance = asyncHandler(async (req, res) => {
  const { sectionId, courseId, date } = req.query;
  if (!sectionId) return error(res, 400, 'sectionId is required');

  const attendanceDate = normalizeDate(date);
  const where = { sectionId, date: attendanceDate };
  if (courseId) where.courseId = courseId;

  const records = await Attendance.findAll({
    where,
    include: [
      { model: Student, include: [{ model: User, attributes: ['name', 'email'] }] },
      { model: Course, attributes: ['name', 'code'] },
    ],
    order: [['createdAt', 'ASC']],
  });

  return success(res, 200, 'Section attendance fetched', records);
});

// ── Get students for attendance (teacher flow) ───────────────────────────────
const getStudentsForAttendance = asyncHandler(async (req, res) => {
  const { courseId, sectionId, batchId } = req.query;

  if (!courseId) return error(res, 400, 'courseId is required');

  const teacher = await Teacher.findOne({ where: { userId: req.user.id } });

  // Verify teacher assignment if teacher role
  if (req.user.role === 'TEACHER') {
    if (!teacher) return error(res, 404, 'Teacher profile not found');

    const assignment = await CourseAssignment.findOne({
      where: {
        teacherId: teacher.id,
        courseId,
        isActive: true,
        ...(sectionId && { sectionId }),
        ...(batchId && { batchId }),
      },
    });

    if (!assignment) {
      return error(res, 403, 'You are not assigned to this course');
    }
  }

  // Build student query
  const where = { status: 'ACTIVE' };
  if (sectionId) where.sectionId = sectionId;
  if (batchId) where.batchId = batchId;

  // First try enrolled students
  const enrollments = await StudentEnrollment.findAll({
    where: {
      courseId,
      status: 'ACTIVE',
      ...(sectionId && { sectionId }),
      ...(batchId && { batchId }),
    },
    include: [
      {
        model: Student,
        where: { status: 'ACTIVE' },
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
    ],
  });

  let students = enrollments.map((e) => e.Student).filter(Boolean);

  // Fall back to students by section/batch if no enrollments
  if (students.length === 0) {
    students = await Student.findAll({
      where,
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [[User, 'name', 'ASC']],
    });
  }

  return success(res, 200, 'Students fetched for attendance', students);
});

// ── Check if session already exists ─────────────────────────────────────────
const checkSessionAttendance = asyncHandler(async (req, res) => {
  const { courseId, sectionId, date } = req.query;

  if (!courseId || !date) {
    return error(res, 400, 'courseId and date are required');
  }

  const attendanceDate = normalizeDate(date);

  const existingSession = await AttendanceSession.findOne({
    where: {
      courseId,
      date: attendanceDate,
      ...(sectionId && { sectionId }),
    },
  });

  const existingRecords = await Attendance.findAll({
    where: {
      courseId,
      date: attendanceDate,
      ...(sectionId && { sectionId }),
    },
    include: [
      { model: Student, include: [{ model: User, attributes: ['name'] }] },
    ],
  });

  return success(res, 200, 'Session check complete', {
    sessionExists: !!existingSession,
    session: existingSession,
    records: existingRecords,
    recordCount: existingRecords.length,
  });
});

// ── Get student attendance history ───────────────────────────────────────────
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
      { model: Section, attributes: ['name'] },
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

// ── Weekly attendance ────────────────────────────────────────────────────────
const getWeeklyAttendance = asyncHandler(async (req, res) => {
  const { classId, startDate } = req.query;
  if (!classId || !startDate) {
    return error(res, 400, 'classId and startDate are required');
  }

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

// ── Monthly attendance ───────────────────────────────────────────────────────
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
// GET /api/attendance/history
const getAttendanceHistory = asyncHandler(async (req, res) => {
  const {
    courseId, sectionId, batchId, semesterId,
    studentId, status, from, to,
    page = 1, limit = 20,
  } = req.query;

  const where = {};
  if (courseId) where.courseId = courseId;
  if (sectionId) where.sectionId = sectionId;
  if (batchId) where.batchId = batchId;
  if (semesterId) where.semesterId = semesterId;
  if (studentId) where.studentId = studentId;
  if (status) where.status = status;
  if (from && to) {
    where.date = { [Op.between]: [from, to] };
  } else if (from) {
    where.date = { [Op.gte]: from };
  } else if (to) {
    where.date = { [Op.lte]: to };
  }

  // Teacher can only see their own records
  if (req.user.role === 'TEACHER') {
    const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
    if (teacher) where.teacherId = teacher.id;
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await Attendance.findAndCountAll({
    where,
    include: [
      {
        model: Student,
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
      { model: Course, attributes: ['name', 'code'] },
      { model: Section, attributes: ['name'] },
      { model: Batch, attributes: ['name', 'year'] },
      { model: Teacher, include: [{ model: User, attributes: ['name'] }] },
    ],
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  // Summary stats for the filtered result
  const allRecords = await Attendance.findAll({ where });
  const total = allRecords.length;
  const present = allRecords.filter((r) => r.status === 'PRESENT').length;
  const absent = allRecords.filter((r) => r.status === 'ABSENT').length;
  const late = allRecords.filter((r) => r.status === 'LATE').length;
  const excused = allRecords.filter((r) => r.status === 'EXCUSED').length;
  const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

  return success(res, 200, 'Attendance history fetched', {
    records: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
    summary: { total, present, absent, late, excused, percentage },
  });
});

// ── Exports ──────────────────────────────────────────────────────────────────
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
  getStudentsForAttendance,
  checkSessionAttendance,
  getAttendanceHistory,
};