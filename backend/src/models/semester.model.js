const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Semester = sequelize.define('Semester', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, comment: 'e.g. Semester I, Semester II' },
    number: { type: DataTypes.INTEGER, allowNull: false, comment: '1 or 2' },
    academicYearId: { type: DataTypes.UUID, allowNull: false },
    startDate: { type: DataTypes.DATEONLY, allowNull: true },
    endDate: { type: DataTypes.DATEONLY, allowNull: true },
    isCurrent: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'semesters',
    timestamps: true,
  });

  return Semester;
};