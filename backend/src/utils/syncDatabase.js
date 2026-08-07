const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync everything in one pass (Sequelize handles FK ordering internally).
    // Running AttendanceSession.sync({alter:true}) separately here AND then
    // sequelize.sync({alter:true}) re-syncs it twice, causing "Unknown constraint error".
    await sequelize.sync({ alter: true });

    console.log('All models synced successfully.');
  } catch (err) {
    console.error('Database sync failed:', err.message);
    process.exit(1);
  }
}

module.exports = syncDatabase;