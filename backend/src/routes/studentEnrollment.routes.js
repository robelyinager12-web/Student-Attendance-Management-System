const express = require('express');
const router = express.Router();
const {
  enrollStudent,
  bulkEnroll,
  getEnrollments,
  updateEnrollment,
  removeEnrollment,
} = require('../controllers/studentEnrollment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);
router.use(authorize('ADMIN'));

router.post('/', enrollStudent);
router.post('/bulk', bulkEnroll);
router.get('/', getEnrollments);
router.put('/:id', updateEnrollment);
router.delete('/:id', removeEnrollment);

module.exports = router;