const { createNotification } = require('../services/notification.service');
const { User: UserModel } = require('../models'); // already imported as User above, skip if duplicate
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { getPagination, buildPaginatedResponse } = require('../utils/pagination.utils');
const {
  Student, User, Department, Program,
  Batch, AcademicYear, Semester, Section,
  Course, Class, Attendance,
} = require('../models');
const asyncHandler  = require('../middlewares/asyncHandler.middleware');
const { success, error } = require('../utils/response.util');
const auditLog      = require('../services/auditLog.service');

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
    search, departmentId, sectionId, batchId,
    academicYearId, semesterId, year, status,
    courseId, classId,
    page = 1, limit = 20,
  } = req.query;

  const { Op } = require('sequelize');

  // ── Student-level filters ──────────────────────────────────────────────────
  const studentWhere = {};
  if (departmentId)   studentWhere.departmentId   = departmentId;
  if (sectionId)      studentWhere.sectionId      = sectionId;
  if (batchId)        studentWhere.batchId        = batchId;
  if (academicYearId) studentWhere.academicYearId = academicYearId;
  if (semesterId)     studentWhere.semesterId     = semesterId;
  if (courseId)       studentWhere.courseId       = courseId;
  if (classId)        studentWhere.classId        = classId;
  if (year)           studentWhere.year           = parseInt(year);
  if (status)         studentWhere.status         = status.toUpperCase();

  // Search on studentCode directly
  if (search) {
    studentWhere[Op.or] = [
      { studentCode: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // ── User-level filters ─────────────────────────────────────────────────────
  const userWhere = {};
  if (search) {
    userWhere[Op.or] = [
      { name:  { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  // ── Build includes ─────────────────────────────────────────────────────────
  // User is required — every student has a user account
  const userInclude = {
    model:      User,
    attributes: ['id', 'name', 'email', 'phone'],
    required:   true,
  };

  // If searching by name/email, add where to user include
  if (Object.keys(userWhere).length > 0) {
    // Merge student code OR with user OR
    if (search) {
      // Use a top-level OR combining studentCode and user name/email
      studentWhere[Op.or] = [
        { studentCode: { [Op.iLike]: `%${search}%` } },
        { '$User.name$':  { [Op.iLike]: `%${search}%` } },
        { '$User.email$': { [Op.iLike]: `%${search}%` } },
      ];
    }
  }

  try {
    const { count, rows } = await Student.findAndCountAll({
      where:   studentWhere,
      include: [
        {
          model:      User,
          attributes: ['id', 'name', 'email', 'phone'],
          required:   true,
        },
        {
          model:      Department,
          attributes: ['id', 'name', 'code'],
          required:   false,
        },
        {
          model:      Program,
          attributes: ['id', 'name', 'code'],
          required:   false,
        },
        {
          model:      Batch,
          attributes: ['id', 'name', 'year'],
          required:   false,
        },
        {
          model:      AcademicYear,
          attributes: ['id', 'name', 'year'],
          required:   false,
        },
        {
          model:      Semester,
          attributes: ['id', 'name', 'number'],
          required:   false,
        },
        {
          model:      Section,
          attributes: ['id', 'name'],
          required:   false,
        },
      ],
      order:    [[User, 'name', 'ASC']],
      limit:    parseInt(limit),
      offset,
      distinct: true,
      subQuery: false,   // ← critical: prevents count issues with search
    });

    return success(res, 200, 'Students fetched successfully', {
      items:      rows,
      total:      count,
      page:       parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });

  } catch (err) {
    console.error('getStudents DB error:', err.message);
    console.error(err.stack);
    return error(res, 500, `Failed to fetch students: ${err.message}`);
  }
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