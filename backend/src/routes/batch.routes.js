const express = require('express');
const router = express.Router();
const {
  createBatch, getBatches, getBatchById,
  updateBatch, deleteBatch,
} = require('../controllers/batch.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

router.post('/', authorize('ADMIN'), createBatch);
router.get('/', getBatches);
router.get('/:id', getBatchById);
router.put('/:id', authorize('ADMIN'), updateBatch);
router.delete('/:id', authorize('ADMIN'), deleteBatch);

module.exports = router;