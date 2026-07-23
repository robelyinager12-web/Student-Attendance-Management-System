const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const {
  StudentEnrollment, Student, Course,
  Section, Batch, Semester, User,
} = require('../models');
const auditLog = require('../services/auditLog.service');

const enrollStudent = asyncHandler(async (req, res) => {
  const { studentId, courseId, sectionId, batchId, semesterId, academicYearId } = req.body;

  if (!studentId || !courseId) {
    return error(res, 400, 'studentId and courseId are required');
  }

  const existing = await StudentEnrollment.findOne({
    where: { studentId, courseId, sectionId: sectionId || null },
  });

  if (existing) {
    return error(res, 409, 'Student is already enrolled in this course for this section');
  }

  const enrollment = await StudentEnrollment.create({
    studentId,
    courseId,
    sectionId: sectionId || null,
    batchId: batchId || null,
    semesterId: semesterId || null,
    academicYearId: academicYearId || null,
    status: 'ACTIVE',
  });

  await auditLog.log({
    userId: req.user.id,
    userRole: req.user.role,
    action: 'CREATE',
    entity: 'StudentEnrollment',
    entityId: enrollment.id,
    newValues: { studentId, courseId, sectionId },
    description: 'Student enrolled in course',
    req,
  });

  return success(res, 201, 'Student enrolled successfully', enrollment);
});

const bulkEnroll = asyncHandler(async (req, res) => {
  const { studentIds, courseId, sectionId, batchId, semesterId, academicYearId } = req.body;

  if (!Array.isArray(studentIds) || !courseId) {
    return error(res, 400, 'studentIds[] and courseId are required');
  }

  const results = { enrolled: 0, skipped: 0, errors: [] };

  for (const studentId of studentIds) {
    try {
      const existing = await StudentEnrollment.findOne({
        where: { studentId, courseId, sectionId: sectionId || null },
      });

      if (existing) {
        results.skipped++;
        continue;
      }

      await StudentEnrollment.create({
        studentId,
        courseId,
        sectionId: sectionId || null,
        batchId: batchId || null,
        semesterId: semesterId || null,
        academicYearId: academicYearId || null,
        status: 'ACTIVE',
      });

      results.enrolled++;
    } catch (err) {
      results.errors.push(`Student ${studentId}: ${err.message}`);
    }
  }

  return success(res, 201, 'Bulk enrollment complete', results);
});

const getEnrollments = asyncHandler(async (req, res) => {
  const { studentId, courseId, sectionId, batchId, status } = req.query;
  const where = {};
  if (studentId) where.studentId = studentId;
  if (courseId) where.courseId = courseId;
  if (sectionId) where.sectionId = sectionId;
  if (batchId) where.batchId = batchId;
  if (status) where.status = status;

  const enrollments = await StudentEnrollment.findAll({
    where,
    include: [
      {
        model: Student,
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
      { model: Course, attributes: ['id', 'name', 'code'] },
      { model: Section, attributes: ['id', 'name'] },
      { model: Batch, attributes: ['id', 'name', 'year'] },
    ],
    order: [['enrolledAt', 'DESC']],
  });

  return success(res, 200, 'Enrollments fetched', enrollments);
});

const updateEnrollment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, grade } = req.body;

  const enrollment = await StudentEnrollment.findByPk(id);
  if (!enrollment) return error(res, 404, 'Enrollment not found');

  const old = { status: enrollment.status, grade: enrollment.grade };
  await enrollment.update({ status, grade });

  await auditLog.log({
    userId: req.user.id,
    userRole: req.user.role,
    action: 'UPDATE',
    entity: 'StudentEnrollment',
    entityId: id,
    oldValues: old,
    newValues: { status, grade },
    description: 'Enrollment updated',
    req,
  });

  return success(res, 200, 'Enrollment updated', enrollment);
});

const removeEnrollment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const enrollment = await StudentEnrollment.findByPk(id);
  if (!enrollment) return error(res, 404, 'Enrollment not found');

  await enrollment.destroy();
  return success(res, 200, 'Enrollment removed');
});

module.exports = {
  enrollStudent,
  bulkEnroll,
  getEnrollments,
  updateEnrollment,
  removeEnrollment,
};