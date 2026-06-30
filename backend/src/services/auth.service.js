const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User, PasswordReset } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.utils');

async function registerUser({ name, email, password, role }) {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'STUDENT',
  });

  return user;
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Your account has been disabled. Contact the administrator.');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
}

async function createPasswordResetToken(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error('No account found with that email');
    err.statusCode = 404;
    throw err;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await PasswordReset.create({ userId: user.id, token, expiresAt });

  return { user, token };
}

async function resetPassword(token, newPassword) {
  const resetEntry = await PasswordReset.findOne({ where: { token, used: false } });

  if (!resetEntry || resetEntry.expiresAt < new Date()) {
    const err = new Error('Reset link is invalid or has expired');
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.update({ password: hashedPassword }, { where: { id: resetEntry.userId } });
  await resetEntry.update({ used: true });

  return resetEntry.userId;
}

module.exports = {
  registerUser,
  loginUser,
  createPasswordResetToken,
  resetPassword,
};