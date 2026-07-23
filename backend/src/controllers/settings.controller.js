const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { College, User, Department } = require('../models');
const bcrypt = require('bcrypt');

// GET /api/settings/college — get college info
const getCollegeInfo = asyncHandler(async (req, res) => {
  const college = await College.findOne({
    include: [{ model: Department, attributes: ['id', 'name', 'code'] }],
  });
  return success(res, 200, 'College info fetched', college);
});

// PUT /api/settings/college — update college info
const updateCollegeInfo = asyncHandler(async (req, res) => {
  const { name, code, description, dean, email, phone, address } = req.body;

  let college = await College.findOne();
  if (!college) {
    college = await College.create({ name, code, description, dean, email, phone, address });
  } else {
    await college.update({ name, code, description, dean, email, phone, address });
  }

  return success(res, 200, 'College info updated successfully', college);
});

// GET /api/settings/users — get all system users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });
  return success(res, 200, 'Users fetched', users);
});

// PUT /api/settings/users/:id/toggle — enable or disable a user
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return error(res, 404, 'User not found');

  if (user.id === req.user.id) {
    return error(res, 400, 'You cannot disable your own account');
  }

  await user.update({ isActive: !user.isActive });
  return success(res, 200,
    `User ${user.isActive ? 'enabled' : 'disabled'} successfully`,
    { isActive: user.isActive }
  );
});

// PUT /api/settings/users/:id/role — change user role
const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['ADMIN', 'TEACHER', 'STUDENT'].includes(role)) {
    return error(res, 400, 'Invalid role');
  }

  const user = await User.findByPk(id);
  if (!user) return error(res, 404, 'User not found');

  if (user.id === req.user.id) {
    return error(res, 400, 'You cannot change your own role');
  }

  await user.update({ role });
  return success(res, 200, 'User role updated successfully', { role: user.role });
});

// PUT /api/settings/users/:id/reset-password — admin resets a user password
const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return error(res, 400, 'Password must be at least 6 characters');
  }

  const user = await User.findByPk(id);
  if (!user) return error(res, 404, 'User not found');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashedPassword });

  return success(res, 200, 'Password reset successfully');
});

// DELETE /api/settings/users/:id — delete a user account
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return error(res, 404, 'User not found');

  if (user.id === req.user.id) {
    return error(res, 400, 'You cannot delete your own account');
  }

  await user.destroy();
  return success(res, 200, 'User deleted successfully');
});

// GET /api/settings/system — get system overview stats
const getSystemInfo = asyncHandler(async (req, res) => {
  const [totalUsers, totalAdmins, totalTeachers, totalStudents] = await Promise.all([
    User.count(),
    User.count({ where: { role: 'ADMIN' } }),
    User.count({ where: { role: 'TEACHER' } }),
    User.count({ where: { role: 'STUDENT' } }),
  ]);

  return success(res, 200, 'System info fetched', {
    totalUsers,
    totalAdmins,
    totalTeachers,
    totalStudents,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    serverTime: new Date().toISOString(),
  });
});

module.exports = {
  getCollegeInfo,
  updateCollegeInfo,
  getUsers,
  toggleUserStatus,
  changeUserRole,
  resetUserPassword,
  deleteUser,
  getSystemInfo,
};