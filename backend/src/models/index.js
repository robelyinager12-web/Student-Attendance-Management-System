const sequelize = require('../config/database');

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

// Department <-> Course
Department.hasMany(Course, { foreignKey: 'departmentId' });
Course.belongsTo(Department, { foreignKey: 'departmentId' });

// Department <-> Class
Department.hasMany(Class, { foreignKey: 'departmentId' });
Class.belongsTo(Department, { foreignKey: 'departmentId' });

// Teacher <-> User
User.hasOne(Teacher, { foreignKey: 'userId' });
Teacher.belongsTo(User, { foreignKey: 'userId' });

// Teacher <-> Department
Department.hasMany(Teacher, { foreignKey: 'departmentId' });
Teacher.belongsTo(Department, { foreignKey: 'departmentId' });

// Teacher <-> Class (assigned teacher)
Teacher.hasMany(Class, { foreignKey: 'teacherId' });
Class.belongsTo(Teacher, { foreignKey: 'teacherId' });

// Student <-> User
User.hasOne(Student, { foreignKey: 'userId' });
Student.belongsTo(User, { foreignKey: 'userId' });

// Student <-> Department / Course / Class
Department.hasMany(Student, { foreignKey: 'departmentId' });
Student.belongsTo(Department, { foreignKey: 'departmentId' });

Course.hasMany(Student, { foreignKey: 'courseId' });
Student.belongsTo(Course, { foreignKey: 'courseId' });

Class.hasMany(Student, { foreignKey: 'classId' });
Student.belongsTo(Class, { foreignKey: 'classId' });

// Enrollment (Student <-> Course)
Student.hasMany(Enrollment, { foreignKey: 'studentId' });
Enrollment.belongsTo(Student, { foreignKey: 'studentId' });
Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

// Attendance relations
Student.hasMany(Attendance, { foreignKey: 'studentId' });
Attendance.belongsTo(Student, { foreignKey: 'studentId' });

Teacher.hasMany(Attendance, { foreignKey: 'teacherId' });
Attendance.belongsTo(Teacher, { foreignKey: 'teacherId' });

Course.hasMany(Attendance, { foreignKey: 'courseId' });
Attendance.belongsTo(Course, { foreignKey: 'courseId' });

Class.hasMany(Attendance, { foreignKey: 'classId' });
Attendance.belongsTo(Class, { foreignKey: 'classId' });

// Notifications belong to a User
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Password resets belong to a User
User.hasMany(PasswordReset, { foreignKey: 'userId' });
PasswordReset.belongsTo(User, { foreignKey: 'userId' });

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
};