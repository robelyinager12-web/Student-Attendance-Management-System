const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { Semester, AcademicYear, Batch, Section } = require('../models');

const createSemester = asyncHandler(async (req, res) => {
  const { name, number, academicYearId, startDate, endDate, isCurrent } = req.body;

  if (!number || !academicYearId) {
    return error(res, 400, 'number and academicYearId are required');
  }

  const ay = await AcademicYear.findByPk(academicYearId);
  if (!ay) return error(res, 404, 'Academic year not found');

  if (isCurrent) {
    await Semester.update(
      { isCurrent: false },
      { where: { academicYearId } }
    );
  }

  const semester = await Semester.create({
    name: name || `Semester ${number}`,
    number,
    academicYearId,
    startDate,
    endDate,
    isCurrent: isCurrent || false,
  });

  return success(res, 201, 'Semester created successfully', semester);
});

const getSemesters = asyncHandler(async (req, res) => {
  const { academicYearId } = req.query;
  const where = academicYearId ? { academicYearId } : {};

  const semesters = await Semester.findAll({
    where,
    include: [
      { model: AcademicYear, attributes: ['id', 'name', 'year'] },
    ],
    order: [['number', 'ASC']],
  });

  return success(res, 200, 'Semesters fetched successfully', semesters);
});

const getSemesterById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const semester = await Semester.findByPk(id, {
    include: [{ model: AcademicYear, include: [{ model: Batch }] }],
  });
  if (!semester) return error(res, 404, 'Semester not found');
  return success(res, 200, 'Semester fetched successfully', semester);
});

const updateSemester = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const semester = await Semester.findByPk(id);
  if (!semester) return error(res, 404, 'Semester not found');

  if (req.body.isCurrent) {
    await Semester.update(
      { isCurrent: false },
      { where: { academicYearId: semester.academicYearId } }
    );
  }

  await semester.update(req.body);
  return success(res, 200, 'Semester updated successfully', semester);
});

const deleteSemester = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const semester = await Semester.findByPk(id);
  if (!semester) return error(res, 404, 'Semester not found');
  await semester.destroy();
  return success(res, 200, 'Semester deleted successfully');
});

module.exports = {
  createSemester,
  getSemesters,
  getSemesterById,
  updateSemester,
  deleteSemester,
};