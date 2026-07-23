const { DataTypes } = require('sequelize');

// Links a Student to a specific Course + Section + Semester
module.exports = (sequelize) => {
  const StudentEnrollment = sequelize.define('StudentEnrollment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studentId: { type: DataTypes.UUID, allowNull: false },
    courseId: { type: DataTypes.UUID, allowNull: false },
    sectionId: { type: DataTypes.UUID, allowNull: true },
    batchId: { type: DataTypes.UUID, allowNull: true },
    semesterId: { type: DataTypes.UUID, allowNull: true },
    academicYearId: { type: DataTypes.UUID, allowNull: true },
    enrolledAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'DROPPED', 'COMPLETED'),
      defaultValue: 'ACTIVE',
    },
    grade: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'student_enrollments',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'courseId', 'sectionId'],
        name: 'unique_student_enrollment',
      },
    ],
  });

  return StudentEnrollment;
};