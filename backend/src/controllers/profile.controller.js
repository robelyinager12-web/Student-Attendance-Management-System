const bcrypt = require('bcrypt');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { User, Student, Teacher } = require('../models');

// GET /api/profile/me
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email', 'role', 'profileImage', 'isActive', 'createdAt'],
  });

  if (!user) return error(res, 404, 'User not found');

  let profile = null;

  if (user.role === 'STUDENT') {
    profile = await Student.findOne({ where: { userId: user.id } });
  } else if (user.role === 'TEACHER') {
    profile = await Teacher.findOne({ where: { userId: user.id } });
  }

  return success(res, 200, 'Profile fetched successfully', { user, profile });
});

// PUT /api/profile/update
const updateMyProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const user = await User.findByPk(req.user.id);
  if (!user) return error(res, 404, 'User not found');

  if (name) await user.update({ name });

  if (user.role === 'STUDENT') {
    const { phone, address, guardianName, guardianPhone } = req.body;
    const student = await Student.findOne({ where: { userId: user.id } });
    if (student) {
      await student.update({ phone, address, guardianName, guardianPhone });
    }
  }

  if (user.role === 'TEACHER') {
    const { phone, qualification, experience } = req.body;
    const teacher = await Teacher.findOne({ where: { userId: user.id } });
    if (teacher) {
      await teacher.update({ phone, qualification, experience });
    }
  }

  return success(res, 200, 'Profile updated successfully');
});

// PUT /api/profile/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return error(res, 400, 'Current password and new password are required');
  }

  if (newPassword.length < 6) {
    return error(res, 400, 'New password must be at least 6 characters');
  }

  const user = await User.findByPk(req.user.id);
  if (!user) return error(res, 404, 'User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return error(res, 401, 'Current password is incorrect');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashedPassword });

  return success(res, 200, 'Password changed successfully');
});

// POST /api/profile/upload-photo
const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) return error(res, 400, 'No image file uploaded');

  const user = await User.findByPk(req.user.id);
  if (!user) return error(res, 404, 'User not found');

  const imagePath = `/uploads/${req.file.filename}`;
  await user.update({ profileImage: imagePath });

  return success(res, 200, 'Profile photo uploaded successfully', {
    profileImage: imagePath,
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword,
  uploadProfilePhoto,
};