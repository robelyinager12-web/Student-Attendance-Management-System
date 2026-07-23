const { AuditLog } = require('../models');

async function log({
  userId = null,
  userRole = null,
  action,
  entity,
  entityId = null,
  oldValues = null,
  newValues = null,
  description = null,
  req = null,
}) {
  try {
    await AuditLog.create({
      userId,
      userRole,
      action,
      entity,
      entityId: entityId ? String(entityId) : null,
      oldValues,
      newValues,
      description,
      ipAddress: req?.ip || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });
  } catch (err) {
    // Never crash the app due to audit logging failure
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { log };