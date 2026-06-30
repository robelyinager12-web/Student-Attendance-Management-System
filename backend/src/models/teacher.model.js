const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Teacher = sequelize.define('Teacher', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    teacherCode: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    departmentId: { type: DataTypes.UUID, allowNull: true },
    qualification: { type: DataTypes.STRING, allowNull: true },
    experience: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'teachers',
    timestamps: true,
  });

  return Teacher;
};