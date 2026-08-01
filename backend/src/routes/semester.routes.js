const express = require('express');
const router = express.Router();
const {
  createSemester, getSemesters, getSemesterById,
  updateSemester, deleteSemester,
} = require('../controllers/semester.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

router.post('/', authorize('ADMIN'), createSemester);
router.get('/', getSemesters);
router.get('/:id', getSemesterById);
router.put('/:id', authorize('ADMIN'), updateSemester);
router.delete('/:id', authorize('ADMIN'), deleteSemester);

module.exports = router;