const { Op, fn, col, literal } = require('sequelize');
const {
  Student, Teacher, Course, Department, Class, Attendance, User,
} = require('../models');

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function getAdminStats() {
  const { start, end } = todayRange();

  const [totalStudents, totalTeachers, totalCourses, totalDepartments, totalClasses] = await Promise.all([
    Student.count(),
    Teacher.count(),
    Course.count(),
    Department.count(),
    Class.count(),
  ]);

  const todayAttendance = await Attendance.findAll({
    where: { date: { [Op.between]: [start, end] } },
  });

  const present = todayAttendance.filter((a) => a.status === 'PRESENT').length;
  const absent = todayAttendance.filter((a) => a.status === 'ABSENT').length;
  const total = todayAttendance.length;
  const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

  return {
    totalStudents,
    totalTeachers,
    totalCourses,
    totalDepartments,
    totalClasses,
    todayAttendanceCount: total,
    presentToday: present,
    absentToday: absent,
    attendancePercentage,
  };
}

async function getMonthlyAttendanceChart() {
  const result = await Attendance.findAll({
    attributes: [
      [fn('DATE_TRUNC', 'month', col('date')), 'month'],
      'status',
      [fn('COUNT', col('id')), 'count'],
    ],
    group: [literal('1'), 'status'],
    order: [[literal('1'), 'ASC']],
    raw: true,
  });

  return result;
}

async function getWeeklyAttendanceChart() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const result = await Attendance.findAll({
    attributes: ['date', 'status', [fn('COUNT', col('id')), 'count']],
    where: { date: { [Op.gte]: sevenDaysAgo } },
    group: ['date', 'status'],
    order: [['date', 'ASC']],
    raw: true,
  });

  return result;
}

async function getStudentGrowthChart() {
  const result = await Student.findAll({
    attributes: [
      [fn('DATE_TRUNC', 'month', col('createdAt')), 'month'],
      [fn('COUNT', col('id')), 'count'],
    ],
    group: [literal('1')],
    order: [[literal('1'), 'ASC']],
    raw: true,
  });

  return result;
}

async function getDepartmentStats() {
  const departments = await Department.findAll({
    attributes: ['id', 'name'],
    include: [{ model: Student, attributes: ['id'] }],
  });

  return departments.map((d) => ({
    department: d.name,
    studentCount: d.Students ? d.Students.length : 0,
  }));
}

async function getTeacherDashboardStats(userId) {
  const teacher = await Teacher.findOne({ where: { userId } });
  if (!teacher) return null;

  const { start, end } = todayRange();

  const assignedClasses = await Class.findAll({ where: { teacherId: teacher.id } });
  const classIds = assignedClasses.map((c) => c.id);

  const todayAttendanceTaken = await Attendance.count({
    where: { classId: { [Op.in]: classIds }, date: { [Op.between]: [start, end] } },
  });

  const recentAttendance = await Attendance.findAll({
    where: { teacherId: teacher.id },
    include: [{ model: Student, include: [{ model: User, attributes: ['name'] }] }],
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  return {
    assignedClasses: assignedClasses.map((c) => ({ id: c.id, name: c.name, section: c.section })),
    todayClassesCount: assignedClasses.length,
    attendanceTakenToday: todayAttendanceTaken,
    pendingAttendance: assignedClasses.length - todayAttendanceTaken,
    recentAttendance,
  };
}

async function getStudentDashboardStats(userId) {
  const student = await Student.findOne({ where: { userId } });
  if (!student) return null;

  const records = await Attendance.findAll({ where: { studentId: student.id } });

  const total = records.length;
  const present = records.filter((r) => r.status === 'PRESENT').length;
  const absent = records.filter((r) => r.status === 'ABSENT').length;
  const late = records.filter((r) => r.status === 'LATE').length;
  const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

  const calendar = records.map((r) => ({ date: r.date, status: r.status }));

  return {
    attendancePercentage: percentage,
    presentDays: present,
    absentDays: absent,
    lateDays: late,
    totalDays: total,
    calendar,
  };
}

module.exports = {
  getAdminStats,
  getMonthlyAttendanceChart,
  getWeeklyAttendanceChart,
  getStudentGrowthChart,
  getDepartmentStats,
  getTeacherDashboardStats,
  getStudentDashboardStats,
};