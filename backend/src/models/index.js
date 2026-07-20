const sequelize = require('../config/database');

// Existing models
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

// New Injibara University models
const College = require('./college.model')(sequelize);
const Program = require('./program.model')(sequelize);
const Batch = require('./batch.model')(sequelize);
const AcademicYear = require('./academicYear.model')(sequelize);
const Semester = require('./semester.model')(sequelize);
const Section = require('./section.model')(sequelize);

// ==========================================
// EXISTING ASSOCIATIONS (keep all of these)
// ==========================================

Department.hasMany(Course, { foreignKey: 'departmentId' });
Course.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Class, { foreignKey: 'departmentId' });
Class.belongsTo(Department, { foreignKey: 'departmentId' });

User.hasOne(Teacher, { foreignKey: 'userId' });
Teacher.belongsTo(User, { foreignKey: 'userId' });

Department.hasMany(Teacher, { foreignKey: 'departmentId' });
Teacher.belongsTo(Department, { foreignKey: 'departmentId' });

Teacher.hasMany(Class, { foreignKey: 'teacherId' });
Class.belongsTo(Teacher, { foreignKey: 'teacherId' });

User.hasOne(Student, { foreignKey: 'userId' });
Student.belongsTo(User, { foreignKey: 'userId' });

Department.hasMany(Student, { foreignKey: 'departmentId' });
Student.belongsTo(Department, { foreignKey: 'departmentId' });

Course.hasMany(Student, { foreignKey: 'courseId' });
Student.belongsTo(Course, { foreignKey: 'courseId' });

Class.hasMany(Student, { foreignKey: 'classId' });
Student.belongsTo(Class, { foreignKey: 'classId' });

Student.hasMany(Enrollment, { foreignKey: 'studentId' });
Enrollment.belongsTo(Student, { foreignKey: 'studentId' });
Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

Student.hasMany(Attendance, { foreignKey: 'studentId' });
Attendance.belongsTo(Student, { foreignKey: 'studentId' });

Teacher.hasMany(Attendance, { foreignKey: 'teacherId' });
Attendance.belongsTo(Teacher, { foreignKey: 'teacherId' });

Course.hasMany(Attendance, { foreignKey: 'courseId' });
Attendance.belongsTo(Course, { foreignKey: 'courseId' });

Class.hasMany(Attendance, { foreignKey: 'classId' });
Attendance.belongsTo(Class, { foreignKey: 'classId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PasswordReset, { foreignKey: 'userId' });
PasswordReset.belongsTo(User, { foreignKey: 'userId' });

// ==========================================
// NEW INJIBARA ASSOCIATIONS
// ==========================================

// College <-> Department
College.hasMany(Department, { foreignKey: 'collegeId' });
Department.belongsTo(College, { foreignKey: 'collegeId' });

// College <-> Program
College.hasMany(Program, { foreignKey: 'collegeId' });
Program.belongsTo(College, { foreignKey: 'collegeId' });

// Department <-> Program
Department.hasMany(Program, { foreignKey: 'departmentId' });
Program.belongsTo(Department, { foreignKey: 'departmentId' });

// Department <-> Batch
Department.hasMany(Batch, { foreignKey: 'departmentId' });
Batch.belongsTo(Department, { foreignKey: 'departmentId' });

// Program <-> Batch
Program.hasMany(Batch, { foreignKey: 'programId' });
Batch.belongsTo(Program, { foreignKey: 'programId' });

// Batch <-> AcademicYear
Batch.hasMany(AcademicYear, { foreignKey: 'batchId' });
AcademicYear.belongsTo(Batch, { foreignKey: 'batchId' });

// AcademicYear <-> Semester
AcademicYear.hasMany(Semester, { foreignKey: 'academicYearId' });
Semester.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

// Semester <-> Section
Semester.hasMany(Section, { foreignKey: 'semesterId' });
Section.belongsTo(Semester, { foreignKey: 'semesterId' });

// AcademicYear <-> Section
AcademicYear.hasMany(Section, { foreignKey: 'academicYearId' });
Section.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

// Batch <-> Section
Batch.hasMany(Section, { foreignKey: 'batchId' });
Section.belongsTo(Batch, { foreignKey: 'batchId' });

// Department <-> Section
Department.hasMany(Section, { foreignKey: 'departmentId' });
Section.belongsTo(Department, { foreignKey: 'departmentId' });

// Teacher (Advisor) <-> Section
Teacher.hasMany(Section, { foreignKey: 'teacherId' });
Section.belongsTo(Teacher, { foreignKey: 'teacherId' });

// Student new associations
College.hasMany(Student, { foreignKey: 'collegeId' });
Student.belongsTo(College, { foreignKey: 'collegeId' });

Program.hasMany(Student, { foreignKey: 'programId' });
Student.belongsTo(Program, { foreignKey: 'programId' });

Batch.hasMany(Student, { foreignKey: 'batchId' });
Student.belongsTo(Batch, { foreignKey: 'batchId' });

AcademicYear.hasMany(Student, { foreignKey: 'academicYearId' });
Student.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

Semester.hasMany(Student, { foreignKey: 'semesterId' });
Student.belongsTo(Semester, { foreignKey: 'semesterId' });

Section.hasMany(Student, { foreignKey: 'sectionId' });
Student.belongsTo(Section, { foreignKey: 'sectionId' });

// Attendance new associations
Section.hasMany(Attendance, { foreignKey: 'sectionId' });
Attendance.belongsTo(Section, { foreignKey: 'sectionId' });

Semester.hasMany(Attendance, { foreignKey: 'semesterId' });
Attendance.belongsTo(Semester, { foreignKey: 'semesterId' });

Batch.hasMany(Attendance, { foreignKey: 'batchId' });
Attendance.belongsTo(Batch, { foreignKey: 'batchId' });

AcademicYear.hasMany(Attendance, { foreignKey: 'academicYearId' });
Attendance.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });

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
};