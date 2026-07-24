const { sequelize, AttendanceSession, Attendance } = require('../models');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync AttendanceSession first to avoid circular FK issue
    await AttendanceSession.sync({ alter: true });

    // Then sync everything else
    await sequelize.sync({ alter: true });

    console.log('All models synced successfully.');
  } catch (err) {
    console.error('Database sync failed:', err.message);
    process.exit(1);
  }
}

module.exports = syncDatabase;