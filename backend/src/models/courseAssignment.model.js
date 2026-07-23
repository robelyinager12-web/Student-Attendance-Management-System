const { DataTypes } = require('sequelize');

// Links a Teacher to a Course for a specific Batch + Section + Semester
module.exports = (sequelize) => {
  const CourseAssignment = sequelize.define('CourseAssignment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseId: { type: DataTypes.UUID, allowNull: false },
    teacherId: { type: DataTypes.UUID, allowNull: false },
    batchId: { type: DataTypes.UUID, allowNull: true },
    sectionId: { type: DataTypes.UUID, allowNull: true },
    semesterId: { type: DataTypes.UUID, allowNull: true },
    academicYearId: { type: DataTypes.UUID, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'course_assignments',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['courseId', 'teacherId', 'batchId', 'sectionId'],
        name: 'unique_course_assignment',
      },
    ],
  });

  return CourseAssignment;
};