const express = require('express');
const router = express.Router();
const {
  createCollege, getColleges, getCollegeById,
  updateCollege, deleteCollege,
} = require('../controllers/college.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

router.post('/', authorize('ADMIN'), createCollege);
router.get('/', getColleges);
router.get('/:id', getCollegeById);
router.put('/:id', authorize('ADMIN'), updateCollege);
router.delete('/:id', authorize('ADMIN'), deleteCollege);

module.exports = router;