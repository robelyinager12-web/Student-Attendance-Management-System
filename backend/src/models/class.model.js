const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Class = sequelize.define('Class', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    section: { type: DataTypes.STRING, allowNull: true },
    academicYear: { type: DataTypes.STRING, allowNull: false },
    semester: { type: DataTypes.STRING, allowNull: true },
    departmentId: { type: DataTypes.UUID, allowNull: false },
    teacherId: { type: DataTypes.UUID, allowNull: true },
  }, {
    tableName: 'classes',
    timestamps: true,
  });

  return Class;
};