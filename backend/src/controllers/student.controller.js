const { createNotification } = require('../services/notification.service');
const { User: UserModel } = require('../models'); // already imported as User above, skip if duplicate
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { getPagination, buildPaginatedResponse } = require('../utils/pagination.utils');
const { Student, User, Department, Course, Class, Enrollment, Attendance } = require('../models');

async function generateStudentCode() {
  const count = await Student.count();
  return `STU-${String(count + 1).padStart(4, '0')}`;
}

const createStudent = asyncHandler(async (req, res) => {
  const {
    name, email, password, gender, dateOfBirth, phone, address,
    departmentId, courseId, classId, year, semester,
    guardianName, guardianPhone, admissionDate,
  } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return error(res, 409, 'Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role: 'STUDENT' });

  const studentCode = await generateStudentCode();

  const student = await Student.create({
    userId: user.id,
    studentCode,
    gender,
    dateOfBirth,
    phone,
    address,
    departmentId,
    courseId,
    classId,
    year,
    semester,
    guardianName,
    guardianPhone,
    admissionDate,
  });

  // Auto-enroll in the course if provided
  if (courseId) {
    await Enrollment.create({ studentId: student.id, courseId });
  }
  // Notify all admins about the new student
  const admins = await User.findAll({ where: { role: 'ADMIN' } });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        title: 'New Student Added',
        message: `${user.name} (${studentCode}) was just registered as a new student.`,
        type: 'STUDENT',
      })
    )
  );

  return success(res, 201, 'Student created successfully', {
    id: student.id,
    studentCode: student.studentCode,
    name: user.name,
    email: user.email,
  });
});

const getStudents = asyncHandler(async (req, res) => {
  const {
    search, departmentId, courseId, classId,
    sectionId, batchId, academicYearId, semesterId,
    year, status, page = 1, limit = 20,
  } = req.query;

  const where = {};
  if (departmentId)   where.departmentId   = departmentId;
  if (courseId)       where.courseId       = courseId;
  if (classId)        where.classId        = classId;
  if (sectionId)      where.sectionId      = sectionId;
  if (batchId)        where.batchId        = batchId;
  if (academicYearId) where.academicYearId = academicYearId;
  if (semesterId)     where.semesterId     = semesterId;
  if (year)           where.year           = year;
  if (status)         where.status         = status;

  const userWhere = {};
  if (search) {
    const { Op } = require('sequelize');
    userWhere[Op.or] = [
      { name:  { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
    where[Op.or] = [
      { studentCode: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await Student.findAndCountAll({
    where,
    include: [
      { model: User,         where: Object.keys(userWhere).length ? userWhere : undefined, attributes: ['name', 'email'] },
      { model: Department,   attributes: ['id', 'name', 'code'] },
      { model: Course,       attributes: ['id', 'name', 'code'] },
      { model: Class,        attributes: ['id', 'name'] },
      { model: Section,      attributes: ['id', 'name'] },
      { model: Batch,        attributes: ['id', 'name', 'year'] },
      { model: AcademicYear, attributes: ['id', 'name', 'year'] },
      { model: Semester,     attributes: ['id', 'name', 'number'] },
    ],
    order: [[User, 'name', 'ASC']],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  return success(res, 200, 'Students fetched successfully', {
    items: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / parseInt(limit)),
  });
});

const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findByPk(id, {
    include: [
      { model: User, attributes: ['id', 'name', 'email', 'profileImage', 'isActive'] },
      { model: Department, attributes: ['id', 'name', 'code'] },
      { model: Course, attributes: ['id', 'name', 'code'] },
      { model: Class, attributes: ['id', 'name', 'section'] },
      { model: Attendance, limit: 10, order: [['date', 'DESC']] },
    ],
  });

  if (!student) {
    return error(res, 404, 'Student not found');
  }

  return success(res, 200, 'Student fetched successfully', student);
});

const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await Student.findByPk(id);

  if (!student) {
    return error(res, 404, 'Student not found');
  }

  await student.update(req.body);

  // If course changed, ensure enrollment exists
  if (req.body.courseId) {
    const existingEnrollment = await Enrollment.findOne({
      where: { studentId: student.id, courseId: req.body.courseId },
    });
    if (!existingEnrollment) {
      await Enrollment.create({ studentId: student.id, courseId: req.body.courseId });
    }
  }

  return success(res, 200, 'Student updated successfully', student);
});

const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findByPk(id);
  if (!student) {
    return error(res, 404, 'Student not found');
  }

  await User.destroy({ where: { id: student.userId } });
  await student.destroy();

  return success(res, 200, 'Student deleted successfully');
});

const uploadStudentPhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return error(res, 400, 'No image file uploaded');
  }

  const student = await Student.findByPk(id);
  if (!student) {
    return error(res, 404, 'Student not found');
  }

  const imagePath = `/uploads/${req.file.filename}`;
  await User.update({ profileImage: imagePath }, { where: { id: student.userId } });

  return success(res, 200, 'Profile image uploaded successfully', { profileImage: imagePath });
});

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadStudentPhoto,
};