const express = require('express');
const router = express.Router();
const {
  createAcademicYear, getAcademicYears, getAcademicYearById,
  updateAcademicYear, deleteAcademicYear,
} = require('../controllers/academicYear.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

router.post('/', authorize('ADMIN'), createAcademicYear);
router.get('/', getAcademicYears);
router.get('/:id', getAcademicYearById);
router.put('/:id', authorize('ADMIN'), updateAcademicYear);
router.delete('/:id', authorize('ADMIN'), deleteAcademicYear);

module.exports = router;