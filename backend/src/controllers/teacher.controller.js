const bcrypt = require('bcrypt');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { Teacher, User, Department, Class } = require('../models');

// Generates a simple sequential teacher code, e.g. TCH-0001
async function generateTeacherCode() {
  const count = await Teacher.count();
  return `TCH-${String(count + 1).padStart(4, '0')}`;
}

const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, phone, departmentId, qualification, experience } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return error(res, 409, 'Email already in use');
  }

  if (departmentId) {
    const department = await Department.findByPk(departmentId);
    if (!department) {
      return error(res, 404, 'Department not found');
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, password: hashedPassword, role: 'TEACHER' });

  const teacherCode = await generateTeacherCode();

  const teacher = await Teacher.create({
    userId: user.id,
    teacherCode,
    phone,
    departmentId,
    qualification,
    experience,
  });

  return success(res, 201, 'Teacher created successfully', {
    id: teacher.id,
    teacherCode: teacher.teacherCode,
    name: user.name,
    email: user.email,
  });
});

const getTeachers = asyncHandler(async (req, res) => {
  const { departmentId, search } = req.query;

  const where = {};
  if (departmentId) where.departmentId = departmentId;

  const userWhere = {};
  if (search) {
    const { Op } = require('sequelize');
    userWhere.name = { [Op.iLike]: `%${search}%` };
  }

  const teachers = await Teacher.findAll({
    where,
    include: [
      { model: User, attributes: ['id', 'name', 'email', 'profileImage', 'isActive'], where: userWhere },
      { model: Department, attributes: ['id', 'name', 'code'] },
      { model: Class, attributes: ['id', 'name', 'section'] },
    ],
    order: [['teacherCode', 'ASC']],
  });

  return success(res, 200, 'Teachers fetched successfully', teachers);
});

const getTeacherById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const teacher = await Teacher.findByPk(id, {
    include: [
      { model: User, attributes: ['id', 'name', 'email', 'profileImage', 'isActive'] },
      { model: Department, attributes: ['id', 'name', 'code'] },
      { model: Class, attributes: ['id', 'name', 'section'] },
    ],
  });

  if (!teacher) {
    return error(res, 404, 'Teacher not found');
  }

  return success(res, 200, 'Teacher fetched successfully', teacher);
});

const updateTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { phone, departmentId, qualification, experience } = req.body;

  const teacher = await Teacher.findByPk(id);
  if (!teacher) {
    return error(res, 404, 'Teacher not found');
  }

  if (departmentId) {
    const department = await Department.findByPk(departmentId);
    if (!department) {
      return error(res, 404, 'Department not found');
    }
  }

  await teacher.update({ phone, departmentId, qualification, experience });

  return success(res, 200, 'Teacher updated successfully', teacher);
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const teacher = await Teacher.findByPk(id);
  if (!teacher) {
    return error(res, 404, 'Teacher not found');
  }

  await User.destroy({ where: { id: teacher.userId } }); // cascades to teacher via FK if configured, but we remove both explicitly
  await teacher.destroy();

  return success(res, 200, 'Teacher deleted successfully');
});

const uploadTeacherPhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return error(res, 400, 'No image file uploaded');
  }

  const teacher = await Teacher.findByPk(id);
  if (!teacher) {
    return error(res, 404, 'Teacher not found');
  }

  const imagePath = `/uploads/${req.file.filename}`;
  await User.update({ profileImage: imagePath }, { where: { id: teacher.userId } });

  return success(res, 200, 'Profile image uploaded successfully', { profileImage: imagePath });
});

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  uploadTeacherPhoto,
};