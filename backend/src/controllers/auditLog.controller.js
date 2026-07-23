const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

const getAuditLogs = asyncHandler(async (req, res) => {
  const { userId, action, entity, from, to, limit = 50 } = req.query;

  const where = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entity) where.entity = entity;
  if (from && to) where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };

  const logs = await AuditLog.findAll({
    where,
    include: [{ model: User, attributes: ['name', 'email', 'role'] }],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
  });

  return success(res, 200, 'Audit logs fetched', logs);
});

const clearOldLogs = asyncHandler(async (req, res) => {
  const { beforeDate } = req.body;
  if (!beforeDate) {
    const { error } = require('../utils/apiResponse');
    return error(res, 400, 'beforeDate is required');
  }

  const deleted = await AuditLog.destroy({
    where: { createdAt: { [Op.lt]: new Date(beforeDate) } },
  });

  return success(res, 200, `${deleted} audit logs deleted`);
});

module.exports = { getAuditLogs, clearOldLogs };