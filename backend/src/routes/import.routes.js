const express = require('express');
const router = express.Router();
const {
  previewImport,
  importStudents,
  downloadTemplate,
} = require('../controllers/import.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const importUpload = require('../middlewares/importUpload.middleware');

router.use(authMiddleware);
router.use(authorize('ADMIN'));

// Download the Excel template
router.get('/template', downloadTemplate);

// Preview file before importing
router.post('/preview', importUpload.single('file'), previewImport);

// Actually import students
router.post('/students', importUpload.single('file'), importStudents);

module.exports = router;