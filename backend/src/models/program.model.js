const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Program = sequelize.define('Program', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    duration: { type: DataTypes.INTEGER, allowNull: true, comment: 'Duration in years' },
    departmentId: { type: DataTypes.UUID, allowNull: false },
    collegeId: { type: DataTypes.UUID, allowNull: true },
  }, {
    tableName: 'programs',
    timestamps: true,
  });

  return Program;
};