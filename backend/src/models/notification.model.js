const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM('ATTENDANCE', 'LOW_ATTENDANCE', 'STUDENT', 'TEACHER', 'PASSWORD', 'SYSTEM'),
      defaultValue: 'SYSTEM',
    },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'notifications',
    timestamps: true,
  });

  return Notification;
};