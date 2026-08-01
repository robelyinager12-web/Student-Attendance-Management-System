const { DataTypes } = require('sequelize');

// Tracks all important changes in the system
module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'User who performed the action',
    },
    userRole: { type: DataTypes.STRING, allowNull: true },
    action: {
      type: DataTypes.ENUM(
        'CREATE', 'UPDATE', 'DELETE',
        'LOGIN', 'LOGOUT',
        'IMPORT', 'EXPORT',
        'ATTENDANCE_MARK', 'ATTENDANCE_EDIT'
      ),
      allowNull: false,
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Which model/table was affected',
    },
    entityId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'ID of the record that was affected',
    },
    oldValues: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Values before the change',
    },
    newValues: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Values after the change',
    },
    description: { type: DataTypes.STRING, allowNull: true },
    ipAddress: { type: DataTypes.STRING, allowNull: true },
    userAgent: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
  });

  return AuditLog;
};