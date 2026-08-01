const express = require('express');
const router = express.Router();
const {
  getCollegeInfo,
  updateCollegeInfo,
  getUsers,
  toggleUserStatus,
  changeUserRole,
  resetUserPassword,
  deleteUser,
  getSystemInfo,
} = require('../controllers/settings.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);
router.use(authorize('ADMIN'));

router.get('/college', getCollegeInfo);
router.put('/college', updateCollegeInfo);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/users/:id/role', changeUserRole);
router.put('/users/:id/reset-password', resetUserPassword);
router.delete('/users/:id', deleteUser);
router.get('/system', getSystemInfo);

module.exports = router;