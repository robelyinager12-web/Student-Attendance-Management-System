const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attendance = sequelize.define('Attendance', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID, allowNull: false },
    teacherId: { type: DataTypes.UUID, allowNull: false },
    courseId: { type: DataTypes.UUID, allowNull: true },
    classId: { type: DataTypes.UUID, allowNull: true },
    sectionId: { type: DataTypes.UUID, allowNull: true },
    semesterId: { type: DataTypes.UUID, allowNull: true },
    batchId: { type: DataTypes.UUID, allowNull: true },
    academicYearId: { type: DataTypes.UUID, allowNull: true },

    // Link to AttendanceSession
    sessionId: { type: DataTypes.UUID, allowNull: true },

    date: { type: DataTypes.DATEONLY, allowNull: false },
    time: { type: DataTypes.TIME, allowNull: true },
    status: {
      type: DataTypes.ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED'),
      allowNull: false,
    },
    remark: { type: DataTypes.STRING, allowNull: true },

    // Audit fields
    markedById: { type: DataTypes.UUID, allowNull: true },
    editedById: { type: DataTypes.UUID, allowNull: true },
    editedAt: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'attendance',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['studentId', 'courseId', 'date', 'sectionId'] },
    ],
  });

  return Attendance;
};