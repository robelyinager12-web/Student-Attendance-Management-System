const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  getAuditLogById,
  clearOldLogs,
  getAuditStats,
} = require('../controllers/auditLog.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);
router.use(authorize('ADMIN'));

router.get('/', getAuditLogs);
router.get('/stats', getAuditStats);
router.get('/:id', getAuditLogById);
router.delete('/clear', clearOldLogs);

module.exports = router;