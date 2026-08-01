const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getProfile,
} = require('../controllers/auth.controller');

const validate = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  authLimiter,
  passwordResetLimiter,
} = require('../middlewares/rateLimiter.middleware');

const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/auth.validator');

// Auth limiter applied to login and register
router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);

// Password reset gets its own strict limiter
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPasswordValidator, validate, resetPassword);

router.get('/me', authMiddleware, getProfile);

module.exports = router;