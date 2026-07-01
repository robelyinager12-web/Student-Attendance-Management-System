const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReportLog = sequelize.define('ReportLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    generatedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reportType: {
      type: DataTypes.ENUM(
        'DAILY',
        'WEEKLY',
        'MONTHLY',
        'STUDENT',
        'CLASS',
        'DEPARTMENT',
        'SEMESTER',
        'ANNUAL'
      ),
      allowNull: false,
    },
    format: {
      type: DataTypes.ENUM('JSON', 'PDF', 'EXCEL', 'CSV'),
      defaultValue: 'JSON',
    },
    filters: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('SUCCESS', 'FAILED'),
      defaultValue: 'SUCCESS',
    },
  }, {
    tableName: 'report_logs',
    timestamps: true,
  });

  return ReportLog;
};