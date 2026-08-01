const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const {
  Section, Semester, AcademicYear,
  Batch, Department, Teacher, User, Student,
} = require('../models');

const createSection = asyncHandler(async (req, res) => {
  const { name, capacity, semesterId, academicYearId, batchId, departmentId, teacherId, room } = req.body;

  if (!name || !semesterId || !academicYearId || !batchId || !departmentId) {
    return error(res, 400, 'name, semesterId, academicYearId, batchId, departmentId are required');
  }

  const section = await Section.create({
    name,
    capacity: capacity || 50,
    semesterId,
    academicYearId,
    batchId,
    departmentId,
    teacherId,
    room,
  });

  return success(res, 201, 'Section created successfully', section);
});

const getSections = asyncHandler(async (req, res) => {
  const { semesterId, academicYearId, batchId, departmentId } = req.query;
  const where = {};
  if (semesterId) where.semesterId = semesterId;
  if (academicYearId) where.academicYearId = academicYearId;
  if (batchId) where.batchId = batchId;
  if (departmentId) where.departmentId = departmentId;

  const sections = await Section.findAll({
    where,
    include: [
      { model: Department, attributes: ['id', 'name', 'code'] },
      { model: Batch, attributes: ['id', 'name', 'year'] },
      { model: AcademicYear, attributes: ['id', 'name', 'year'] },
      { model: Semester, attributes: ['id', 'name', 'number'] },
      {
        model: Teacher,
        attributes: ['id', 'teacherCode'],
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
      { model: Student, attributes: ['id'] },
    ],
    order: [['name', 'ASC']],
  });

  const result = sections.map((s) => ({
    ...s.toJSON(),
    studentCount: s.Students ? s.Students.length : 0,
  }));

  return success(res, 200, 'Sections fetched successfully', result);
});

const getSectionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const section = await Section.findByPk(id, {
    include: [
      { model: Department },
      { model: Batch },
      { model: AcademicYear },
      { model: Semester },
      {
        model: Teacher,
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
      {
        model: Student,
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
    ],
  });
  if (!section) return error(res, 404, 'Section not found');
  return success(res, 200, 'Section fetched successfully', section);
});

const updateSection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const section = await Section.findByPk(id);
  if (!section) return error(res, 404, 'Section not found');
  await section.update(req.body);
  return success(res, 200, 'Section updated successfully', section);
});

const deleteSection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const section = await Section.findByPk(id);
  if (!section) return error(res, 404, 'Section not found');
  await section.destroy();
  return success(res, 200, 'Section deleted successfully');
});

module.exports = {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
};