const sequelize = require('../config/database');

// ── Existing models ─────────────────────────────────────────────────────────
const User = require('./user.model')(sequelize);
const Department = require('./department.model')(sequelize);
const Course = require('./course.model')(sequelize);
const Class = require('./class.model')(sequelize);
const Teacher = require('./teacher.model')(sequelize);
const Student = require('./student.model')(sequelize);
const Enrollment = require('./enrollment.model')(sequelize);
const Attendance = require('./attendance.model')(sequelize);
const Notification = require('./notification.model')(sequelize);
const PasswordReset = require('./passwordReset.model')(sequelize);
const ReportLog = require('./reportLog.model')(sequelize);

// ── Injibara University models ───────────────────────────────────────────────
const College = require('./college.model')(sequelize);
const Program = require('./program.model')(sequelize);
const Batch = require('./batch.model')(sequelize);
const AcademicYear = require('./academicYear.model')(sequelize);
const Semester = require('./semester.model')(sequelize);
const Section = require('./section.model')(sequelize);

// ── New Phase H models ───────────────────────────────────────────────────────
const CourseAssignment = require('./courseAssignment.model')(sequelize);
const StudentEnrollment = require('./studentEnrollment.model')(sequelize);
const AttendanceSession = require('./attendanceSession.model')(sequelize);
const AuditLog = require('./auditLog.model')(sequelize);

// ══════════════════════════════════════════════════════════════
// ASSOCIATIONS
// ══════════════════════════════════════════════════════════════

// ── User associations ────────────────────────────────────────────────────────
User.hasOne(Teacher, { foreignKey: 'userId' });
Teacher.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Student, { foreignKey: 'userId' });
Student.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PasswordReset, { foreignKey: 'userId' });
PasswordReset.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

// ── College associations ─────────────────────────────────────────────────────
College.hasMany(Department, { foreignKey: 'collegeId' });
Department.belongsTo(College, { foreignKey: 'collegeId' });

College.hasMany(Program, { foreignKey: 'collegeId' });
Program.belongsTo(College, { foreignKey: 'collegeId' });

// ── Department associations ──────────────────────────────────────────────────
Department.hasMany(Course, { foreignKey: 'departmentId' });
Course.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Class, { foreignKey: 'departmentId' });
Class.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Teacher, { foreignKey: 'departmentId' });
Teacher.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Student, { foreignKey: 'departmentId' });
Student.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Program, { foreignKey: 'departmentId' });
Program.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Batch, { foreignKey: 'departmentId' });
Batch.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Section, { foreignKey: 'departmentId' });
Section.belongsTo(Department, { foreignKey: 'departmentId' });

// ── Program associations ─────────────────────────────────────────────────────
Program.hasMany(Batch, { foreignKey: 'programId' });
Batch.belongsTo(Program, { foreignKey: 'programId' });

Program.hasMany(Student, { foreignKey: 'programId' });
Student.belongsTo(Program, { foreignKey: 'programId' });

// ── Batch associations ───────────────────────────────────────────────────────
Batch.hasMany(AcademicYear, { foreignKey: 'batchId' });
AcademicYear.belongsTo(Batch, { foreignKey: 'batchId' });

Batch.hasMany(Student, { foreignKey: 'batchId' });
Student.belongsTo(Batch, { foreignKey: 'batchId' });

Batch.hasMany(Section, { foreignKey: 'batchId' });
Section.belongsTo(Batch, { foreignKey: 'batchId' });

Batch.hasMany(CourseAssignment, { foreignKey: 'batchId' });
CourseAssignment.belongsTo(Batch, { foreignKey: 'batchId' });

Batch.hasMany(StudentEnrollment, { foreignKey: 'batchId' });
StudentEnrollment.belongsTo(Batch, { foreignKey: 'batchId' });

Batch.hasMany(AttendanceSession, { foreignKey: 'batchId' });
AttendanceSession.belongsTo(Batch, { foreignKey: 'batchId' });

Batch.hasMany(Attendance, { foreignKey: 'batchId' });
Attendance.belongsTo(Batch, { foreignKey: 'batchId' });

// ── AcademicYear associations ────────────────────────────────────────────────
AcademicYear.hasMany(Semester, { foreignKey: 'academicYearId' });
Semester.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

AcademicYear.hasMany(Section, { foreignKey: 'academicYearId' });
Section.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

AcademicYear.hasMany(Student, { foreignKey: 'academicYearId' });
Student.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

AcademicYear.hasMany(CourseAssignment, { foreignKey: 'academicYearId' });
CourseAssignment.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

AcademicYear.hasMany(StudentEnrollment, { foreignKey: 'academicYearId' });
StudentEnrollment.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

AcademicYear.hasMany(AttendanceSession, { foreignKey: 'academicYearId' });
AttendanceSession.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

AcademicYear.hasMany(Attendance, { foreignKey: 'academicYearId' });
Attendance.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

// ── Semester associations ────────────────────────────────────────────────────
Semester.hasMany(Section, { foreignKey: 'semesterId' });
Section.belongsTo(Semester, { foreignKey: 'semesterId' });

Semester.hasMany(Student, { foreignKey: 'semesterId' });
Student.belongsTo(Semester, { foreignKey: 'semesterId' });

Semester.hasMany(CourseAssignment, { foreignKey: 'semesterId' });
CourseAssignment.belongsTo(Semester, { foreignKey: 'semesterId' });

Semester.hasMany(StudentEnrollment, { foreignKey: 'semesterId' });
StudentEnrollment.belongsTo(Semester, { foreignKey: 'semesterId' });

Semester.hasMany(AttendanceSession, { foreignKey: 'semesterId' });
AttendanceSession.belongsTo(Semester, { foreignKey: 'semesterId' });

Semester.hasMany(Attendance, { foreignKey: 'semesterId' });
Attendance.belongsTo(Semester, { foreignKey: 'semesterId' });

// ── Section associations ─────────────────────────────────────────────────────
Section.hasMany(Student, { foreignKey: 'sectionId' });
Student.belongsTo(Section, { foreignKey: 'sectionId' });

Section.hasMany(Teacher, { foreignKey: 'teacherId' });
Teacher.hasMany(Section, { foreignKey: 'teacherId' });

Section.hasMany(CourseAssignment, { foreignKey: 'sectionId' });
CourseAssignment.belongsTo(Section, { foreignKey: 'sectionId' });

Section.hasMany(StudentEnrollment, { foreignKey: 'sectionId' });
StudentEnrollment.belongsTo(Section, { foreignKey: 'sectionId' });

Section.hasMany(AttendanceSession, { foreignKey: 'sectionId' });
AttendanceSession.belongsTo(Section, { foreignKey: 'sectionId' });

Section.hasMany(Attendance, { foreignKey: 'sectionId' });
Attendance.belongsTo(Section, { foreignKey: 'sectionId' });

// ── Course associations ──────────────────────────────────────────────────────
Course.hasMany(Student, { foreignKey: 'courseId' });
Student.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(Attendance, { foreignKey: 'courseId' });
Attendance.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(CourseAssignment, { foreignKey: 'courseId' });
CourseAssignment.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(StudentEnrollment, { foreignKey: 'courseId' });
StudentEnrollment.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(AttendanceSession, { foreignKey: 'courseId' });
AttendanceSession.belongsTo(Course, { foreignKey: 'courseId' });

// ── Teacher associations ─────────────────────────────────────────────────────
Teacher.hasMany(Class, { foreignKey: 'teacherId' });
Class.belongsTo(Teacher, { foreignKey: 'teacherId' });

Teacher.hasMany(Attendance, { foreignKey: 'teacherId' });
Attendance.belongsTo(Teacher, { foreignKey: 'teacherId' });

Teacher.hasMany(CourseAssignment, { foreignKey: 'teacherId' });
CourseAssignment.belongsTo(Teacher, { foreignKey: 'teacherId' });

Teacher.hasMany(AttendanceSession, { foreignKey: 'teacherId' });
AttendanceSession.belongsTo(Teacher, { foreignKey: 'teacherId' });

// ── Class associations ───────────────────────────────────────────────────────
Class.hasMany(Student, { foreignKey: 'classId' });
Student.belongsTo(Class, { foreignKey: 'classId' });

Class.hasMany(Attendance, { foreignKey: 'classId' });
Attendance.belongsTo(Class, { foreignKey: 'classId' });

// ── Student associations ─────────────────────────────────────────────────────
Student.hasMany(Enrollment, { foreignKey: 'studentId' });
Enrollment.belongsTo(Student, { foreignKey: 'studentId' });

Student.hasMany(Attendance, { foreignKey: 'studentId' });
Attendance.belongsTo(Student, { foreignKey: 'studentId' });

Student.hasMany(StudentEnrollment, { foreignKey: 'studentId' });
StudentEnrollment.belongsTo(Student, { foreignKey: 'studentId' });

// ── AttendanceSession associations ───────────────────────────────────────────
AttendanceSession.hasMany(Attendance, { foreignKey: 'sessionId' });
Attendance.belongsTo(AttendanceSession, { foreignKey: 'sessionId' });

// ══════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════
module.exports = {
  sequelize,
  User,
  Department,
  Course,
  Class,
  Teacher,
  Student,
  Enrollment,
  Attendance,
  Notification,
  PasswordReset,
  ReportLog,
  College,
  Program,
  Batch,
  AcademicYear,
  Semester,
  Section,
  CourseAssignment,
  StudentEnrollment,
  AttendanceSession,
  AuditLog,
};