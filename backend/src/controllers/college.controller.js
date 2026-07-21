const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { College, Department } = require('../models');

const createCollege = asyncHandler(async (req, res) => {
  const { name, code, description, dean, email, phone, address } = req.body;

  const existing = await College.findOne({ where: { code } });
  if (existing) return error(res, 409, 'College with this code already exists');

  const college = await College.create({ name, code, description, dean, email, phone, address });
  return success(res, 201, 'College created successfully', college);
});

const getColleges = asyncHandler(async (req, res) => {
  const colleges = await College.findAll({
    include: [{ model: Department, attributes: ['id', 'name', 'code'] }],
    order: [['name', 'ASC']],
  });
  return success(res, 200, 'Colleges fetched successfully', colleges);
});

const getCollegeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const college = await College.findByPk(id, {
    include: [{ model: Department, attributes: ['id', 'name', 'code'] }],
  });
  if (!college) return error(res, 404, 'College not found');
  return success(res, 200, 'College fetched successfully', college);
});

const updateCollege = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const college = await College.findByPk(id);
  if (!college) return error(res, 404, 'College not found');
  await college.update(req.body);
  return success(res, 200, 'College updated successfully', college);
});

const deleteCollege = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const college = await College.findByPk(id);
  if (!college) return error(res, 404, 'College not found');
  await college.destroy();
  return success(res, 200, 'College deleted successfully');
});

module.exports = { createCollege, getColleges, getCollegeById, updateCollege, deleteCollege };