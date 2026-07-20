const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Batch = sequelize.define('Batch', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, comment: 'e.g. Batch 2022' },
    year: { type: DataTypes.INTEGER, allowNull: false, comment: 'e.g. 2022' },
    departmentId: { type: DataTypes.UUID, allowNull: false },
    programId: { type: DataTypes.UUID, allowNull: true },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'GRADUATED', 'INACTIVE'),
      defaultValue: 'ACTIVE',
    },
  }, {
    tableName: 'batches',
    timestamps: true,
    indexes: [{ unique: true, fields: ['year', 'departmentId'] }],
  });

  return Batch;
};