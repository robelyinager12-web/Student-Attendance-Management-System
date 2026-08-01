const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Course = sequelize.define('Course', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    creditHour: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
    semester: { type: DataTypes.STRING, allowNull: true },
    departmentId: { type: DataTypes.UUID, allowNull: false },
  }, {
    tableName: 'courses',
    timestamps: true,
  });

  return Course;
};