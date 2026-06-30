const { Attendance, Student, User, Class } = require('../models');

async function getTeacherIdFromUser(userId) {
  const { Teacher } = require('../models');
  const teacher = await Teacher.findOne({ where: { userId } });
  return teacher ? teacher.id : null;
}

function normalizeDate(date) {
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function markSingleAttendance({ studentId, classId, courseId, date, status, remark, teacherId }) {
  const attendanceDate = normalizeDate(date);

  const [attendance] = await Attendance.findOrCreate({
    where: { studentId, classId, date: attendanceDate },
    defaults: { courseId, status, remark, teacherId, time: new Date().toTimeString().split(' ')[0] },
  });

  // If it already existed, update it
  await attendance.update({ status, remark, courseId, teacherId });

  return attendance;
}

module.exports = { getTeacherIdFromUser, normalizeDate, markSingleAttendance };