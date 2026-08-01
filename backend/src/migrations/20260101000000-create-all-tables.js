'use strict';

/**
 * Migration placeholder for production use.
 *
 * In development, tables are auto-created via
 * sequelize.sync({ alter: true }) in syncDatabase.js
 *
 * For production, generate proper migration files:
 *   npx sequelize-cli migration:generate --name create-users
 * Then fill in the up/down functions below.
 *
 * Tables managed by Sequelize models:
 *   users, departments, courses, classes, teachers,
 *   students, enrollments, attendance, notifications,
 *   password_resets, report_logs
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Migration placeholder - tables managed via sync in development.');
  },

  async down(queryInterface, Sequelize) {
    console.log('Rollback placeholder.');
  },
};