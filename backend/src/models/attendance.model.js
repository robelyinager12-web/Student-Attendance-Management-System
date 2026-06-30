const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attendance = sequelize.define('Attendance', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID, allowNull: false },
    teacherId: { type: DataTypes.UUID, allowNull: false },
    courseId: { type: DataTypes.UUID, allowNull: true },
    classId: { type: DataTypes.UUID, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    time: { type: DataTypes.TIME, allowNull: true },
    status: {
      type: DataTypes.ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED'),
      allowNull: false,
    },
    remark: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'attendance',
    timestamps: true,
    indexes: [{ unique: true, fields: ['studentId', 'classId', 'date'] }],
  });

  return Attendance;
};