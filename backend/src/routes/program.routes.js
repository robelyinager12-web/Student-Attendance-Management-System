const express = require('express');
const router = express.Router();
const {
  createProgram, getPrograms, getProgramById,
  updateProgram, deleteProgram,
} = require('../controllers/program.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);

router.post('/', authorize('ADMIN'), createProgram);
router.get('/', getPrograms);
router.get('/:id', getProgramById);
router.put('/:id', authorize('ADMIN'), updateProgram);
router.delete('/:id', authorize('ADMIN'), deleteProgram);

module.exports = router;