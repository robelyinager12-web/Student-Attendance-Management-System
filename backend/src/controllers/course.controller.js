const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { Course, Department } = require('../models');

const createCourse = asyncHandler(async (req, res) => {
  const { name, code, creditHour, semester, departmentId } = req.body;

  const department = await Department.findByPk(departmentId);
  if (!department) {
    return error(res, 404, 'Department not found');
  }

  const existing = await Course.findOne({ where: { code } });
  if (existing) {
    return error(res, 409, 'A course with this code already exists');
  }

  const course = await Course.create({ name, code, creditHour, semester, departmentId });

  return success(res, 201, 'Course created successfully', course);
});

const getCourses = asyncHandler(async (req, res) => {
  const { departmentId } = req.query;

  const where = departmentId ? { departmentId } : {};

  const courses = await Course.findAll({
    where,
    include: [{ model: Department, attributes: ['id', 'name', 'code'] }],
    order: [['name', 'ASC']],
  });

  return success(res, 200, 'Courses fetched successfully', courses);
});

const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findByPk(id, {
    include: [{ model: Department, attributes: ['id', 'name', 'code'] }],
  });

  if (!course) {
    return error(res, 404, 'Course not found');
  }

  return success(res, 200, 'Course fetched successfully', course);
});

const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await Course.findByPk(id);

  if (!course) {
    return error(res, 404, 'Course not found');
  }

  if (req.body.departmentId) {
    const department = await Department.findByPk(req.body.departmentId);
    if (!department) {
      return error(res, 404, 'Department not found');
    }
  }

  await course.update(req.body);

  return success(res, 200, 'Course updated successfully', course);
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await Course.findByPk(id);

  if (!course) {
    return error(res, 404, 'Course not found');
  }

  await course.destroy();

  return success(res, 200, 'Course deleted successfully');
});

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};