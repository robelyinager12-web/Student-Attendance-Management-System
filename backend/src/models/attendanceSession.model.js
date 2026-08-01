const { DataTypes } = require('sequelize');

// Represents a single class session — one attendance event
module.exports = (sequelize) => {
  const AttendanceSession = sequelize.define('AttendanceSession', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseId: { type: DataTypes.UUID, allowNull: false },
    teacherId: { type: DataTypes.UUID, allowNull: false },
    sectionId: { type: DataTypes.UUID, allowNull: true },
    batchId: { type: DataTypes.UUID, allowNull: true },
    semesterId: { type: DataTypes.UUID, allowNull: true },
    academicYearId: { type: DataTypes.UUID, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    startTime: { type: DataTypes.TIME, allowNull: true },
    endTime: { type: DataTypes.TIME, allowNull: true },
    topic: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Topic covered in this session',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'COMPLETED',
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'attendance_sessions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['courseId', 'sectionId', 'date', 'teacherId'],
        name: 'unique_attendance_session',
      },
    ],
  });

  return AttendanceSession;
};