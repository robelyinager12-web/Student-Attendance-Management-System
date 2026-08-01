const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const {
  CourseAssignment, Course, Teacher, User,
  Batch, Section, Semester, AcademicYear,
} = require('../models');
const auditLog = require('../services/auditLog.service');

const assignCourse = asyncHandler(async (req, res) => {
  const {
    courseId, teacherId, batchId,
    sectionId, semesterId, academicYearId,
  } = req.body;

  if (!courseId || !teacherId) {
    return error(res, 400, 'courseId and teacherId are required');
  }

  const existing = await CourseAssignment.findOne({
    where: { courseId, teacherId, batchId: batchId || null, sectionId: sectionId || null },
  });

  if (existing) {
    return error(res, 409, 'This course is already assigned to this teacher for this batch/section');
  }

  const assignment = await CourseAssignment.create({
    courseId,
    teacherId,
    batchId: batchId || null,
    sectionId: sectionId || null,
    semesterId: semesterId || null,
    academicYearId: academicYearId || null,
  });

  await auditLog.log({
    userId: req.user.id,
    userRole: req.user.role,
    action: 'CREATE',
    entity: 'CourseAssignment',
    entityId: assignment.id,
    newValues: { courseId, teacherId, batchId, sectionId },
    description: `Course assigned to teacher`,
    req,
  });

  return success(res, 201, 'Course assigned successfully', assignment);
});

const getCourseAssignments = asyncHandler(async (req, res) => {
  const { teacherId, courseId, batchId, sectionId } = req.query;
  const where = {};
  if (teacherId) where.teacherId = teacherId;
  if (courseId) where.courseId = courseId;
  if (batchId) where.batchId = batchId;
  if (sectionId) where.sectionId = sectionId;

  const assignments = await CourseAssignment.findAll({
    where,
    include: [
      { model: Course, attributes: ['id', 'name', 'code', 'creditHour'] },
      {
        model: Teacher,
        attributes: ['id', 'teacherCode'],
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
      { model: Batch, attributes: ['id', 'name', 'year'] },
      { model: Section, attributes: ['id', 'name'] },
      { model: Semester, attributes: ['id', 'name', 'number'] },
      { model: AcademicYear, attributes: ['id', 'name', 'year'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  return success(res, 200, 'Course assignments fetched', assignments);
});

// Get courses assigned to the currently logged-in teacher
const getMyAssignedCourses = asyncHandler(async (req, res) => {
  const { Teacher: TeacherModel } = require('../models');
  const teacher = await TeacherModel.findOne({ where: { userId: req.user.id } });

  if (!teacher) {
    return error(res, 404, 'Teacher profile not found');
  }

  const assignments = await CourseAssignment.findAll({
    where: { teacherId: teacher.id, isActive: true },
    include: [
      { model: Course, attributes: ['id', 'name', 'code', 'creditHour', 'semester'] },
      { model: Batch, attributes: ['id', 'name', 'year'] },
      { model: Section, attributes: ['id', 'name'] },
      { model: Semester, attributes: ['id', 'name', 'number'] },
      { model: AcademicYear, attributes: ['id', 'name', 'year'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  return success(res, 200, 'My assigned courses fetched', assignments);
});

const removeAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const assignment = await CourseAssignment.findByPk(id);

  if (!assignment) return error(res, 404, 'Assignment not found');

  await assignment.destroy();

  await auditLog.log({
    userId: req.user.id,
    userRole: req.user.role,
    action: 'DELETE',
    entity: 'CourseAssignment',
    entityId: id,
    description: 'Course assignment removed',
    req,
  });

  return success(res, 200, 'Assignment removed successfully');
});

const toggleAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const assignment = await CourseAssignment.findByPk(id);

  if (!assignment) return error(res, 404, 'Assignment not found');

  await assignment.update({ isActive: !assignment.isActive });

  return success(res, 200,
    `Assignment ${assignment.isActive ? 'activated' : 'deactivated'}`,
    assignment
  );
});

module.exports = {
  assignCourse,
  getCourseAssignments,
  getMyAssignedCourses,
  removeAssignment,
  toggleAssignment,
};