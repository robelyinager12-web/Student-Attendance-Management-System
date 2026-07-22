const { Op, fn, col, literal } = require('sequelize');
const {
  Student, Teacher, Course, Department, Class,
  Attendance, User, College, Program, Batch,
  AcademicYear, Semester, Section,
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

  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    totalDepartments,
    totalClasses,
    totalBatches,
    totalSections,
    totalPrograms,
  ] = await Promise.all([
    Student.count(),
    Teacher.count(),
    Course.count(),
    Department.count(),
    Class.count(),
    Batch.count({ where: { status: 'ACTIVE' } }),
    Section.count(),
    Program.count(),
  ]);

  const todayAttendance = await Attendance.findAll({
    where: { date: { [Op.between]: [start, end] } },
  });

  const present = todayAttendance.filter((a) => a.status === 'PRESENT').length;
  const absent = todayAttendance.filter((a) => a.status === 'ABSENT').length;
  const late = todayAttendance.filter((a) => a.status === 'LATE').length;
  const total = todayAttendance.length;
  const attendancePercentage = total > 0
    ? ((present / total) * 100).toFixed(1) : '0';

  return {
    totalStudents,
    totalTeachers,
    totalCourses,
    totalDepartments,
    totalClasses,
    totalBatches,
    totalSections,
    totalPrograms,
    todayAttendanceCount: total,
    presentToday: present,
    absentToday: absent,
    lateToday: late,
    attendancePercentage,
  };
}

async function getMonthlyAttendanceChart() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const result = await Attendance.findAll({
    attributes: [
      [fn('DATE_TRUNC', 'month', col('date')), 'month'],
      'status',
      [fn('COUNT', col('id')), 'count'],
    ],
    where: { date: { [Op.gte]: sixMonthsAgo } },
    group: [literal('1'), 'status'],
    order: [[literal('1'), 'ASC']],
    raw: true,
  });

  // Group by month
  const grouped = {};
  result.forEach((r) => {
    const month = new Date(r.month).toLocaleString('default', {
      month: 'short', year: 'numeric',
    });
    if (!grouped[month]) {
      grouped[month] = { month, PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
    }
    grouped[month][r.status] = parseInt(r.count);
  });

  return Object.values(grouped);
}

async function getWeeklyAttendanceChart() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const result = await Attendance.findAll({
    attributes: [
      'date',
      'status',
      [fn('COUNT', col('id')), 'count'],
    ],
    where: { date: { [Op.gte]: sevenDaysAgo } },
    group: ['date', 'status'],
    order: [['date', 'ASC']],
    raw: true,
  });

  // Group by date
  const grouped = {};
  result.forEach((r) => {
    const dateStr = new Date(r.date).toLocaleDateString('default', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
    if (!grouped[dateStr]) {
      grouped[dateStr] = { date: dateStr, PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
    }
    grouped[dateStr][r.status] = parseInt(r.count);
  });

  return Object.values(grouped);
}

async function getStudentGrowthChart() {
  const result = await Student.findAll({
    attributes: [
      [fn('DATE_TRUNC', 'month', col('Student.createdAt')), 'month'],
      [fn('COUNT', col('Student.id')), 'count'],
    ],
    group: [literal('1')],
    order: [[literal('1'), 'ASC']],
    raw: true,
  });

  return result.map((r) => ({
    month: new Date(r.month).toLocaleString('default', {
      month: 'short', year: 'numeric',
    }),
    count: parseInt(r.count),
  }));
}

async function getDepartmentStats() {
  const departments = await Department.findAll({
    attributes: ['id', 'name', 'code'],
    include: [
      { model: Student, attributes: ['id'] },
      { model: Teacher, attributes: ['id'] },
      { model: Course, attributes: ['id'] },
    ],
  });

  return departments.map((d) => ({
    department: d.name,
    code: d.code,
    studentCount: d.Students ? d.Students.length : 0,
    teacherCount: d.Teachers ? d.Teachers.length : 0,
    courseCount: d.Courses ? d.Courses.length : 0,
  }));
}

async function getBatchStats() {
  const batches = await Batch.findAll({
    where: { status: 'ACTIVE' },
    include: [
      { model: Department, attributes: ['name', 'code'] },
      { model: Student, attributes: ['id'] },
      { model: AcademicYear, attributes: ['id', 'name', 'isCurrent'] },
    ],
    order: [['year', 'DESC']],
  });

  return batches.map((b) => ({
    id: b.id,
    name: b.name,
    year: b.year,
    department: b.Department?.name,
    studentCount: b.Students ? b.Students.length : 0,
    currentYear: b.AcademicYears?.find((ay) => ay.isCurrent)?.name || 'N/A',
  }));
}

async function getAttendanceByDepartment() {
  const departments = await Department.findAll({
    attributes: ['id', 'name'],
  });

  const stats = [];
  for (const dept of departments) {
    const students = await Student.findAll({
      where: { departmentId: dept.id },
      attributes: ['id'],
    });

    if (students.length === 0) continue;

    const studentIds = students.map((s) => s.id);

    const total = await Attendance.count({
      where: { studentId: { [Op.in]: studentIds } },
    });

    const present = await Attendance.count({
      where: {
        studentId: { [Op.in]: studentIds },
        status: 'PRESENT',
      },
    });

    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

    stats.push({
      department: dept.name,
      total,
      present,
      percentage: parseFloat(percentage),
    });
  }

  return stats;
}

async function getLowAttendanceStudents(threshold = 75) {
  const students = await Student.findAll({
    include: [
      { model: User, attributes: ['name', 'email'] },
      { model: Department, attributes: ['name'] },
      { model: Section, attributes: ['name'] },
    ],
    where: { status: 'ACTIVE' },
  });

  const atRisk = [];

  for (const student of students) {
    const records = await Attendance.findAll({
      where: { studentId: student.id },
    });

    if (records.length === 0) continue;

    const present = records.filter((r) => r.status === 'PRESENT').length;
    const percentage = (present / records.length) * 100;

    if (percentage < threshold) {
      atRisk.push({
        id: student.id,
        name: student.User?.name,
        studentCode: student.studentCode,
        department: student.Department?.name,
        section: student.Section?.name,
        attendancePercentage: percentage.toFixed(1),
        totalDays: records.length,
        presentDays: present,
      });
    }
  }

  return atRisk.sort((a, b) =>
    parseFloat(a.attendancePercentage) - parseFloat(b.attendancePercentage)
  );
}

async function getRecentAttendanceActivity() {
  const records = await Attendance.findAll({
    order: [['createdAt', 'DESC']],
    limit: 10,
    include: [
      {
        model: Student,
        include: [{ model: User, attributes: ['name'] }],
      },
      { model: Course, attributes: ['name', 'code'] },
    ],
  });

  return records.map((r) => ({
    id: r.id,
    studentName: r.Student?.User?.name,
    studentCode: r.Student?.studentCode,
    course: r.Course?.name,
    date: r.date,
    status: r.status,
    markedAt: r.createdAt,
  }));
}

async function getTeacherDashboardStats(userId) {
  const teacher = await Teacher.findOne({ where: { userId } });
  if (!teacher) return null;

  const { start, end } = todayRange();

  const assignedClasses = await Class.findAll({
    where: { teacherId: teacher.id },
  });

  const assignedSections = await Section.findAll({
    where: { teacherId: teacher.id },
    include: [
      { model: Department, attributes: ['name'] },
      { model: AcademicYear, attributes: ['name'] },
      { model: Semester, attributes: ['name'] },
      { model: Student, attributes: ['id'] },
    ],
  });

  const todayAttendanceTaken = await Attendance.count({
    where: {
      teacherId: teacher.id,
      date: { [Op.between]: [start, end] },
    },
  });

  const recentAttendance = await Attendance.findAll({
    where: { teacherId: teacher.id },
    include: [
      {
        model: Student,
        include: [{ model: User, attributes: ['name'] }],
      },
      { model: Course, attributes: ['name'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  return {
    assignedClasses: assignedClasses.map((c) => ({
      id: c.id, name: c.name, section: c.section,
    })),
    assignedSections: assignedSections.map((s) => ({
      id: s.id,
      name: s.name,
      department: s.Department?.name,
      academicYear: s.AcademicYear?.name,
      semester: s.Semester?.name,
      studentCount: s.Students?.length || 0,
    })),
    todayClassesCount: assignedClasses.length + assignedSections.length,
    attendanceTakenToday: todayAttendanceTaken,
    recentAttendance,
  };
}

async function getStudentDashboardStats(userId) {
  const student = await Student.findOne({
    where: { userId },
    include: [
      { model: Department, attributes: ['name'] },
      { model: Section, attributes: ['name'] },
      { model: Batch, attributes: ['name', 'year'] },
      { model: AcademicYear, attributes: ['name'] },
      { model: Semester, attributes: ['name'] },
    ],
  });
  if (!student) return null;

  const records = await Attendance.findAll({
    where: { studentId: student.id },
    include: [{ model: Course, attributes: ['name', 'code'] }],
    order: [['date', 'DESC']],
  });

  const total = records.length;
  const present = records.filter((r) => r.status === 'PRESENT').length;
  const absent = records.filter((r) => r.status === 'ABSENT').length;
  const late = records.filter((r) => r.status === 'LATE').length;
  const excused = records.filter((r) => r.status === 'EXCUSED').length;
  const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

  const calendar = records.map((r) => ({
    date: r.date,
    status: r.status,
    course: r.Course?.name,
  }));

  return {
    studentCode: student.studentCode,
    department: student.Department?.name,
    section: student.Section?.name,
    batch: student.Batch?.name,
    academicYear: student.AcademicYear?.name,
    semester: student.Semester?.name,
    attendancePercentage: percentage,
    presentDays: present,
    absentDays: absent,
    lateDays: late,
    excusedDays: excused,
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
  getBatchStats,
  getAttendanceByDepartment,
  getLowAttendanceStudents,
  getRecentAttendanceActivity,
  getTeacherDashboardStats,
  getStudentDashboardStats,
};