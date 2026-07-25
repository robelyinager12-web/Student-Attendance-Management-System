const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

const getAuditLogs = asyncHandler(async (req, res) => {
  const {
    userId, action, entity,
    from, to, search,
    page = 1, limit = 20,
  } = req.query;

  const where = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entity) where.entity = entity;
  if (from && to) {
    where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };
  } else if (from) {
    where.createdAt = { [Op.gte]: new Date(from) };
  } else if (to) {
    where.createdAt = { [Op.lte]: new Date(to) };
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await AuditLog.findAndCountAll({
    where,
    include: [
      {
        model: User,
        attributes: ['name', 'email', 'role'],
        required: false,
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  // Get counts by action type for summary
  const actionCounts = await AuditLog.findAll({
    attributes: [
      'action',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
    ],
    where: from || to ? { createdAt: where.createdAt } : {},
    group: ['action'],
    raw: true,
  });

  return success(res, 200, 'Audit logs fetched', {
    logs: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
    actionCounts,
  });
});

const getAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await AuditLog.findByPk(id, {
    include: [{ model: User, attributes: ['name', 'email', 'role'] }],
  });
  if (!log) return error(res, 404, 'Audit log not found');
  return success(res, 200, 'Audit log fetched', log);
});

const clearOldLogs = asyncHandler(async (req, res) => {
  const { beforeDate } = req.body;
  if (!beforeDate) {
    return error(res, 400, 'beforeDate is required');
  }

  const deleted = await AuditLog.destroy({
    where: { createdAt: { [Op.lt]: new Date(beforeDate) } },
  });

  return success(res, 200, `${deleted} audit logs deleted`);
});

const getAuditStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [total, todayCount, users, recentActivity] = await Promise.all([
    AuditLog.count(),
    AuditLog.count({ where: { createdAt: { [Op.gte]: today } } }),
    AuditLog.count({ where: { action: 'LOGIN' } }),
    AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{ model: User, attributes: ['name', 'role'] }],
    }),
  ]);

  return success(res, 200, 'Audit stats fetched', {
    total,
    todayCount,
    totalLogins: users,
    recentActivity,
  });
});

module.exports = {
  getAuditLogs,
  getAuditLogById,
  clearOldLogs,
  getAuditStats,
};