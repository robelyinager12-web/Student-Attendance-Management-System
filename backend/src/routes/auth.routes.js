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
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/auth.validator');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);
router.get('/me', authMiddleware, getProfile);

module.exports = router;