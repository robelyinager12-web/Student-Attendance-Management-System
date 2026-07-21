const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { Batch, Department, Program, Student, AcademicYear } = require('../models');

const createBatch = asyncHandler(async (req, res) => {
  const { name, year, departmentId, programId, status } = req.body;

  if (!year || !departmentId) {
    return error(res, 400, 'year and departmentId are required');
  }

  const dept = await Department.findByPk(departmentId);
  if (!dept) return error(res, 404, 'Department not found');

  const existing = await Batch.findOne({ where: { year, departmentId } });
  if (existing) return error(res, 409, 'Batch already exists for this year and department');

  const batch = await Batch.create({
    name: name || `Batch ${year}`,
    year,
    departmentId,
    programId,
    status: status || 'ACTIVE',
  });

  return success(res, 201, 'Batch created successfully', batch);
});

const getBatches = asyncHandler(async (req, res) => {
  const { departmentId, status } = req.query;
  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (status) where.status = status;

  const batches = await Batch.findAll({
    where,
    include: [
      { model: Department, attributes: ['id', 'name', 'code'] },
      { model: Program, attributes: ['id', 'name', 'code'] },
      { model: AcademicYear, attributes: ['id', 'name', 'year', 'isCurrent'] },
    ],
    order: [['year', 'DESC']],
  });

  return success(res, 200, 'Batches fetched successfully', batches);
});

const getBatchById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const batch = await Batch.findByPk(id, {
    include: [
      { model: Department, attributes: ['id', 'name', 'code'] },
      { model: Program, attributes: ['id', 'name', 'code'] },
      { model: AcademicYear, include: [{ model: require('../models').Semester }] },
    ],
  });
  if (!batch) return error(res, 404, 'Batch not found');
  return success(res, 200, 'Batch fetched successfully', batch);
});

const updateBatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const batch = await Batch.findByPk(id);
  if (!batch) return error(res, 404, 'Batch not found');
  await batch.update(req.body);
  return success(res, 200, 'Batch updated successfully', batch);
});

const deleteBatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const batch = await Batch.findByPk(id);
  if (!batch) return error(res, 404, 'Batch not found');
  await batch.destroy();
  return success(res, 200, 'Batch deleted successfully');
});

module.exports = { createBatch, getBatches, getBatchById, updateBatch, deleteBatch };