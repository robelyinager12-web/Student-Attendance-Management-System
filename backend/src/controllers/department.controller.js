const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { Department } = require('../models');

const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, headOfDepartment } = req.body;

  const existing = await Department.findOne({ where: { code } });
  if (existing) {
    return error(res, 409, 'A department with this code already exists');
  }

  const department = await Department.create({ name, code, description, headOfDepartment });

  return success(res, 201, 'Department created successfully', department);
});

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.findAll({ order: [['name', 'ASC']] });
  return success(res, 200, 'Departments fetched successfully', departments);
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const department = await Department.findByPk(id);

  if (!department) {
    return error(res, 404, 'Department not found');
  }

  return success(res, 200, 'Department fetched successfully', department);
});

const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const department = await Department.findByPk(id);

  if (!department) {
    return error(res, 404, 'Department not found');
  }

  await department.update(req.body);

  return success(res, 200, 'Department updated successfully', department);
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const department = await Department.findByPk(id);

  if (!department) {
    return error(res, 404, 'Department not found');
  }

  await department.destroy();

  return success(res, 200, 'Department deleted successfully');
});

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};