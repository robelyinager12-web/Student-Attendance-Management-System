const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { AcademicYear, Batch, Semester, Department } = require('../models');

const createAcademicYear = asyncHandler(async (req, res) => {
  const { name, year, batchId, startDate, endDate, isCurrent } = req.body;

  if (!year || !batchId) {
    return error(res, 400, 'year and batchId are required');
  }

  const batch = await Batch.findByPk(batchId);
  if (!batch) return error(res, 404, 'Batch not found');

  // If setting as current, unset others in this batch
  if (isCurrent) {
    await AcademicYear.update(
      { isCurrent: false },
      { where: { batchId } }
    );
  }

  const academicYear = await AcademicYear.create({
    name: name || `Year ${['I','II','III','IV','V'][year - 1] || year}`,
    year,
    batchId,
    startDate,
    endDate,
    isCurrent: isCurrent || false,
  });

  return success(res, 201, 'Academic year created successfully', academicYear);
});

const getAcademicYears = asyncHandler(async (req, res) => {
  const { batchId } = req.query;
  const where = batchId ? { batchId } : {};

  const years = await AcademicYear.findAll({
    where,
    include: [
      { model: Batch, attributes: ['id', 'name', 'year'] },
      { model: Semester, attributes: ['id', 'name', 'number', 'isCurrent'] },
    ],
    order: [['year', 'ASC']],
  });

  return success(res, 200, 'Academic years fetched successfully', years);
});

const getAcademicYearById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const year = await AcademicYear.findByPk(id, {
    include: [
      { model: Batch },
      { model: Semester },
    ],
  });
  if (!year) return error(res, 404, 'Academic year not found');
  return success(res, 200, 'Academic year fetched successfully', year);
});

const updateAcademicYear = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ay = await AcademicYear.findByPk(id);
  if (!ay) return error(res, 404, 'Academic year not found');

  if (req.body.isCurrent) {
    await AcademicYear.update(
      { isCurrent: false },
      { where: { batchId: ay.batchId } }
    );
  }

  await ay.update(req.body);
  return success(res, 200, 'Academic year updated successfully', ay);
});

const deleteAcademicYear = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ay = await AcademicYear.findByPk(id);
  if (!ay) return error(res, 404, 'Academic year not found');
  await ay.destroy();
  return success(res, 200, 'Academic year deleted successfully');
});

module.exports = {
  createAcademicYear,
  getAcademicYears,
  getAcademicYearById,
  updateAcademicYear,
  deleteAcademicYear,
};