const { createNotification } = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { sendEmail } = require('../config/mailer.config');
const { verifyRefreshToken, generateAccessToken } = require('../utils/jwt.utils');
const { User } = require('../models');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const user = await authService.registerUser({ name, email, password, role });

  return success(res, 201, 'User registered successfully', {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.loginUser({ email, password });
  const auditLog = require('../services/auditLog.service');

// Inside login function, after const token = generateToken(user):
await auditLog.log({
  userId: user.id,
  userRole: user.role,
  action: 'LOGIN',
  entity: 'User',
  entityId: user.id,
  description: `${user.role} logged in`,
  req,
});
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return success(res, 200, 'Login successful', {
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  return success(res, 200, 'Logged out successfully');
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token provided' });
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findByPk(decoded.id);

  if (!user) {
    return res.status(401).json({ success: false, message: 'User no longer exists' });
  }

  const newAccessToken = generateAccessToken(user);

  return success(res, 200, 'Token refreshed', { accessToken: newAccessToken });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const { user, token } = await authService.createPasswordResetToken(email);

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `<p>Hello ${user.name},</p>
           <p>Click the link below to reset your password. This link expires in 1 hour.</p>
           <a href="${resetUrl}">${resetUrl}</a>`,
  });

  return success(res, 200, 'Password reset link sent to your email');
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const userId = await authService.resetPassword(token, newPassword);

  await createNotification({
    userId,
    title: 'Password Reset',
    message: 'Your password was successfully reset. If you did not do this, contact the administrator immediately.',
    type: 'PASSWORD',
  });

  return success(res, 200, 'Password reset successfully');
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email', 'role', 'profileImage', 'createdAt'],
  });

  return success(res, 200, 'Profile fetched', user);
});

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getProfile,
};