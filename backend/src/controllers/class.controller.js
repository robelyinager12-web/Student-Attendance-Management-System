const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { Class, Department, Teacher, User, Student } = require('../models');

const createClass = asyncHandler(async (req, res) => {
  const { name, section, academicYear, semester, departmentId, teacherId } = req.body;

  const department = await Department.findByPk(departmentId);
  if (!department) {
    return error(res, 404, 'Department not found');
  }

  if (teacherId) {
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return error(res, 404, 'Teacher not found');
    }
  }

  const newClass = await Class.create({ name, section, academicYear, semester, departmentId, teacherId });

  return success(res, 201, 'Class created successfully', newClass);
});

const getClasses = asyncHandler(async (req, res) => {
  const { departmentId, teacherId } = req.query;

  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (teacherId) where.teacherId = teacherId;

  const classes = await Class.findAll({
    where,
    include: [
      { model: Department, attributes: ['id', 'name', 'code'] },
      {
        model: Teacher,
        attributes: ['id', 'teacherCode'],
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
    ],
    order: [['name', 'ASC']],
  });

  return success(res, 200, 'Classes fetched successfully', classes);
});

const getClassById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const classData = await Class.findByPk(id, {
    include: [
      { model: Department, attributes: ['id', 'name', 'code'] },
      {
        model: Teacher,
        attributes: ['id', 'teacherCode'],
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
      {
        model: Student,
        attributes: ['id', 'studentCode'],
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
    ],
  });

  if (!classData) {
    return error(res, 404, 'Class not found');
  }

  return success(res, 200, 'Class fetched successfully', classData);
});

const updateClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const classData = await Class.findByPk(id);

  if (!classData) {
    return error(res, 404, 'Class not found');
  }

  if (req.body.departmentId) {
    const department = await Department.findByPk(req.body.departmentId);
    if (!department) {
      return error(res, 404, 'Department not found');
    }
  }

  if (req.body.teacherId) {
    const teacher = await Teacher.findByPk(req.body.teacherId);
    if (!teacher) {
      return error(res, 404, 'Teacher not found');
    }
  }

  await classData.update(req.body);

  return success(res, 200, 'Class updated successfully', classData);
});

const deleteClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const classData = await Class.findByPk(id);

  if (!classData) {
    return error(res, 404, 'Class not found');
  }

  await classData.destroy();

  return success(res, 200, 'Class deleted successfully');
});

const assignTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { teacherId } = req.body;

  const classData = await Class.findByPk(id);
  if (!classData) {
    return error(res, 404, 'Class not found');
  }

  const teacher = await Teacher.findByPk(teacherId);
  if (!teacher) {
    return error(res, 404, 'Teacher not found');
  }

  await classData.update({ teacherId });

  return success(res, 200, 'Teacher assigned to class successfully', classData);
});

module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  assignTeacher,
};