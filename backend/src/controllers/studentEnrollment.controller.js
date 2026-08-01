const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { Op } = require('sequelize');
const {
  StudentEnrollment, Student, Course,
  Section, Batch, Semester, User, Department,
  AcademicYear,
} = require('../models');
const auditLog = require('../services/auditLog.service');

const enrollStudent = asyncHandler(async (req, res) => {
  const {
    studentId, courseId, sectionId,
    batchId, semesterId, academicYearId,
  } = req.body;

  if (!studentId || !courseId) {
    return error(res, 400, 'studentId and courseId are required');
  }

  const existing = await StudentEnrollment.findOne({
    where: {
      studentId,
      courseId,
      sectionId: sectionId || null,
    },
  });

  if (existing) {
    return error(res, 409,
      'Student is already enrolled in this course for this section'
    );
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
  const {
    studentIds, courseId, sectionId,
    batchId, semesterId, academicYearId,
  } = req.body;

  if (!Array.isArray(studentIds) || studentIds.length === 0 || !courseId) {
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

  await auditLog.log({
    userId: req.user.id,
    userRole: req.user.role,
    action: 'CREATE',
    entity: 'StudentEnrollment',
    newValues: { courseId, sectionId, count: results.enrolled },
    description: `Bulk enrolled ${results.enrolled} students`,
    req,
  });

  return success(res, 201, 'Bulk enrollment complete', results);
});

const getEnrollments = asyncHandler(async (req, res) => {
  const {
    studentId, courseId, sectionId,
    batchId, semesterId, status,
    page = 1, limit = 20,
  } = req.query;

  const where = {};
  if (studentId) where.studentId = studentId;
  if (courseId) where.courseId = courseId;
  if (sectionId) where.sectionId = sectionId;
  if (batchId) where.batchId = batchId;
  if (semesterId) where.semesterId = semesterId;
  if (status) where.status = status;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await StudentEnrollment.findAndCountAll({
    where,
    include: [
      {
        model: Student,
        include: [
          { model: User, attributes: ['name', 'email'] },
          { model: Department, attributes: ['name', 'code'] },
        ],
      },
      { model: Course, attributes: ['id', 'name', 'code', 'creditHour'] },
      { model: Section, attributes: ['id', 'name'] },
      { model: Batch, attributes: ['id', 'name', 'year'] },
      { model: Semester, attributes: ['id', 'name', 'number'] },
    ],
    order: [['enrolledAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  return success(res, 200, 'Enrollments fetched', {
    enrollments: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
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

  await auditLog.log({
    userId: req.user.id,
    userRole: req.user.role,
    action: 'DELETE',
    entity: 'StudentEnrollment',
    entityId: id,
    description: 'Enrollment removed',
    req,
  });

  return success(res, 200, 'Enrollment removed');
});

// Enroll all students in a section into a course at once
const enrollSectionStudents = asyncHandler(async (req, res) => {
  const { courseId, sectionId, semesterId, batchId, academicYearId } = req.body;

  if (!courseId || !sectionId) {
    return error(res, 400, 'courseId and sectionId are required');
  }

  const students = await Student.findAll({
    where: { sectionId, status: 'ACTIVE' },
  });

  if (students.length === 0) {
    return error(res, 404, 'No active students found in this section');
  }

  const results = { enrolled: 0, skipped: 0, errors: [] };

  for (const student of students) {
    try {
      const existing = await StudentEnrollment.findOne({
        where: { studentId: student.id, courseId, sectionId },
      });

      if (existing) {
        results.skipped++;
        continue;
      }

      await StudentEnrollment.create({
        studentId: student.id,
        courseId,
        sectionId,
        batchId: batchId || student.batchId || null,
        semesterId: semesterId || student.semesterId || null,
        academicYearId: academicYearId || student.academicYearId || null,
        status: 'ACTIVE',
      });

      results.enrolled++;
    } catch (err) {
      results.errors.push(err.message);
    }
  }

  return success(res, 201, 'Section enrollment complete', {
    ...results,
    totalStudents: students.length,
  });
});

module.exports = {
  enrollStudent,
  bulkEnroll,
  getEnrollments,
  updateEnrollment,
  removeEnrollment,
  enrollSectionStudents,
};