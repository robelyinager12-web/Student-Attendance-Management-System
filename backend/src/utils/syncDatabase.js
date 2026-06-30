const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('All models synced successfully.');
  } catch (err) {
    console.error('Database sync failed:', err);
    process.exit(1);
  }
}

module.exports = syncDatabase;