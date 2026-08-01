const express = require('express');
const router = express.Router();
const {
  createSection, getSections, getSectionById,
  updateSection, deleteSection,
} = require('../controllers/section.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

router.post('/', authorize('ADMIN'), createSection);
router.get('/', getSections);
router.get('/:id', getSectionById);
router.put('/:id', authorize('ADMIN'), updateSection);
router.delete('/:id', authorize('ADMIN'), deleteSection);

module.exports = router;