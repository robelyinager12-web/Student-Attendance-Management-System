const express = require('express');
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
  uploadProfilePhoto,
} = require('../controllers/profile.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');

router.use(authMiddleware);

router.get('/me', getMyProfile);
router.put('/update', updateMyProfile);
router.put('/change-password', changePassword);
router.post('/upload-photo', uploadSingle('image'), uploadProfilePhoto);

module.exports = router;