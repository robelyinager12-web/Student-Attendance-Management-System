const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Section = sequelize.define('Section', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, comment: 'e.g. Section A, Group 1' },
    capacity: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 50 },
    semesterId: { type: DataTypes.UUID, allowNull: false },
    academicYearId: { type: DataTypes.UUID, allowNull: false },
    batchId: { type: DataTypes.UUID, allowNull: false },
    departmentId: { type: DataTypes.UUID, allowNull: false },
    teacherId: { type: DataTypes.UUID, allowNull: true, comment: 'Advisor/homeroom teacher' },
    room: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'sections',
    timestamps: true,
  });

  return Section;
};