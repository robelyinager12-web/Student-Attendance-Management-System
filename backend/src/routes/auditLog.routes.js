const express = require('express');
const router = express.Router();
const { getAuditLogs, clearOldLogs } = require('../controllers/auditLog.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);
router.use(authorize('ADMIN'));

router.get('/', getAuditLogs);
router.delete('/clear', clearOldLogs);

module.exports = router;