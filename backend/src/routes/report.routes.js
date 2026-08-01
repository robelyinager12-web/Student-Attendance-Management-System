const express = require('express');
const router = express.Router();

const {
  dailyReport,
  weeklyReport,
  monthlyReport,
  studentReport,
  classReport,
  departmentReport,
} = require('../controllers/report.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(authMiddleware);
router.use(authorize('ADMIN', 'TEACHER'));

router.get('/daily', dailyReport);         // ?date=&classId=&format=pdf|excel|csv
router.get('/weekly', weeklyReport);       // ?from=&to=&classId=&format=
router.get('/monthly', monthlyReport);     // ?month=&year=&classId=&format=
router.get('/student', studentReport);     // ?studentId=&from=&to=&format=
router.get('/class', classReport);         // ?classId=&from=&to=&format=
router.get('/department', departmentReport); // ?departmentId=&from=&to=&format=

module.exports = router;