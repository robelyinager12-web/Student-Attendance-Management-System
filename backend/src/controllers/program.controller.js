const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { Program, Department, College } = require('../models');

const createProgram = asyncHandler(async (req, res) => {
  const { name, code, description, duration, departmentId, collegeId } = req.body;

  const existing = await Program.findOne({ where: { code } });
  if (existing) return error(res, 409, 'Program with this code already exists');

  const dept = await Department.findByPk(departmentId);
  if (!dept) return error(res, 404, 'Department not found');

  const program = await Program.create({ name, code, description, duration, departmentId, collegeId });
  return success(res, 201, 'Program created successfully', program);
});

const getPrograms = asyncHandler(async (req, res) => {
  const { departmentId } = req.query;
  const where = departmentId ? { departmentId } : {};

  const programs = await Program.findAll({
    where,
    include: [
      { model: Department, attributes: ['id', 'name', 'code'] },
      { model: College, attributes: ['id', 'name'] },
    ],
    order: [['name', 'ASC']],
  });
  return success(res, 200, 'Programs fetched successfully', programs);
});

const getProgramById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const program = await Program.findByPk(id, {
    include: [
      { model: Department, attributes: ['id', 'name', 'code'] },
      { model: College, attributes: ['id', 'name'] },
    ],
  });
  if (!program) return error(res, 404, 'Program not found');
  return success(res, 200, 'Program fetched successfully', program);
});

const updateProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const program = await Program.findByPk(id);
  if (!program) return error(res, 404, 'Program not found');
  await program.update(req.body);
  return success(res, 200, 'Program updated successfully', program);
});

const deleteProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const program = await Program.findByPk(id);
  if (!program) return error(res, 404, 'Program not found');
  await program.destroy();
  return success(res, 200, 'Program deleted successfully');
});

module.exports = { createProgram, getPrograms, getProgramById, updateProgram, deleteProgram };