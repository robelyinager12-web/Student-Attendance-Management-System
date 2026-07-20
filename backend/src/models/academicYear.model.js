const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AcademicYear = sequelize.define('AcademicYear', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, comment: 'e.g. Year I, Year II' },
    year: { type: DataTypes.INTEGER, allowNull: false, comment: '1, 2, 3, 4' },
    batchId: { type: DataTypes.UUID, allowNull: false },
    startDate: { type: DataTypes.DATEONLY, allowNull: true },
    endDate: { type: DataTypes.DATEONLY, allowNull: true },
    isCurrent: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'academic_years',
    timestamps: true,
  });

  return AcademicYear;
};