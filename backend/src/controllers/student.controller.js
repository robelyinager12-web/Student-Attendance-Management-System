const {
  Student, User, Department, Program,
  Batch, AcademicYear, Semester, Section,
  Course, Class, Attendance,
} = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const auditLog = require('../services/auditLog.service');

// ── GET all students ─────────────────────────────────────────────────────────
const getStudents = asyncHandler(async (req, res) => {
  const {
    search, departmentId, sectionId, batchId,
    academicYearId, semesterId, year, status,
    courseId, classId,
    page = 1, limit = 20,
  } = req.query;

  const { Op } = require('sequelize');

  const studentWhere = {};
  if (departmentId) studentWhere.departmentId = departmentId;
  if (sectionId) studentWhere.sectionId = sectionId;
  if (batchId) studentWhere.batchId = batchId;
  if (academicYearId) studentWhere.academicYearId = academicYearId;
  if (semesterId) studentWhere.semesterId = semesterId;
  if (courseId) studentWhere.courseId = courseId;
  if (classId) studentWhere.classId = classId;
  if (year) studentWhere.year = parseInt(year);
  if (status) studentWhere.status = status.toUpperCase();
  if (search) {
    studentWhere[Op.or] = [
      { studentCode: { [Op.iLike]: `%${search}%` } },
      { '$User.name$': { [Op.iLike]: `%${search}%` } },
      { '$User.email$': { [Op.iLike]: `%${search}%` } },
    ];
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const { count, rows } = await Student.findAndCountAll({
      where: studentWhere,
      include: [
        {
          model: User,
          // ✅ ONLY columns that actually exist on users table
          attributes: ['id', 'name', 'email'],
          required: true,
        },
        {
          model: Department,
          attributes: ['id', 'name', 'code'],
          required: false,
        },
        {
          model: Program,
          attributes: ['id', 'name', 'code'],
          required: false,
        },
        {
          model: Batch,
          attributes: ['id', 'name', 'year'],
          required: false,
        },
        {
          model: AcademicYear,
          attributes: ['id', 'name'],
          required: false,
        },
        {
          model: Semester,
          attributes: ['id', 'name'],
          required: false,
        },
        {
          model: Section,
          attributes: ['id', 'name'],
          required: false,
        },
      ],
      order: [[User, 'name', 'ASC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
      subQuery: false,
    });

    return success(res, 200, 'Students fetched successfully', {
      items: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });

  } catch (err) {
    console.error('getStudents error:', err.message);
    return error(res, 500, 'Failed to fetch students: ' + err.message);
  }
});

// ── GET single student ───────────────────────────────────────────────────────
const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findByPk(id, {
      include: [
        { model: User,        attributes: ['id', 'name', 'email'], required: false },
        { model: Department,  attributes: ['id', 'name', 'code'], required: false },
        { model: Program,     attributes: ['id', 'name', 'code'], required: false },
        { model: Batch,       attributes: ['id', 'name', 'year'], required: false },
        { model: AcademicYear,attributes: ['id', 'name'],         required: false },
        { model: Semester,    attributes: ['id', 'name'],         required: false },
        { model: Section,     attributes: ['id', 'name'],         required: false },
      ],
    });
    if (!student) return error(res, 404, 'Student not found');
    return success(res, 200, 'Student fetched successfully', student);
  } catch (err) {
    console.error('getStudentById error:', err.message);
    return error(res, 500, 'Failed to fetch student: ' + err.message);
  }
});

// ── CREATE student ───────────────────────────────────────────────────────────
const createStudent = asyncHandler(async (req, res) => {
  const {
    userId, studentCode, departmentId, programId,
    batchId, academicYearId, semesterId, sectionId,
    courseId, classId, gender, year, status,
  } = req.body;

  if (!userId) return error(res, 400, 'userId is required');

  try {
    const exists = await Student.findOne({ where: { userId } });
    if (exists) return error(res, 409, 'Student profile already exists for this user');

    const student = await Student.create({
      userId,
      studentCode: studentCode || null,
      departmentId: departmentId || null,
      programId: programId || null,
      batchId: batchId || null,
      academicYearId: academicYearId || null,
      semesterId: semesterId || null,
      sectionId: sectionId || null,
      courseId: courseId || null,
      classId: classId || null,
      gender: gender || null,
      year: year ? parseInt(year) : null,
      status: status || 'ACTIVE',
    });

    await auditLog.log({
      userId: req.user?.id,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'Student',
      entityId: student.id,
      newValues: student.toJSON(),
      description: `Created student: ${studentCode}`,
      req,
    });

    return success(res, 201, 'Student created successfully', student);
  } catch (err) {
    console.error('createStudent error:', err.message);
    return error(res, 500, 'Failed to create student: ' + err.message);
  }
});

// ── UPDATE student ───────────────────────────────────────────────────────────
const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    studentCode, departmentId, programId,
    batchId, academicYearId, semesterId, sectionId,
    courseId, classId, gender, year, status,
  } = req.body;

  try {
    const student = await Student.findByPk(id);
    if (!student) return error(res, 404, 'Student not found');

    const old = student.toJSON();
    await student.update({
      ...(studentCode !== undefined && { studentCode }),
      ...(departmentId !== undefined && { departmentId }),
      ...(programId !== undefined && { programId }),
      ...(batchId !== undefined && { batchId }),
      ...(academicYearId !== undefined && { academicYearId }),
      ...(semesterId !== undefined && { semesterId }),
      ...(sectionId !== undefined && { sectionId }),
      ...(courseId !== undefined && { courseId }),
      ...(classId !== undefined && { classId }),
      ...(gender !== undefined && { gender }),
      ...(year !== undefined && { year: parseInt(year) }),
      ...(status !== undefined && { status }),
    });

    await auditLog.log({
      userId: req.user?.id,
      userRole: req.user?.role,
      action: 'UPDATE',
      entity: 'Student',
      entityId: student.id,
      oldValues: old,
      newValues: student.toJSON(),
      description: `Updated student: ${student.studentCode}`,
      req,
    });

    return success(res, 200, 'Student updated successfully', student);
  } catch (err) {
    console.error('updateStudent error:', err.message);
    return error(res, 500, 'Failed to update student: ' + err.message);
  }
});

// ── DELETE student ───────────────────────────────────────────────────────────
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findByPk(id);
    if (!student) return error(res, 404, 'Student not found');

    await auditLog.log({
      userId: req.user?.id,
      userRole: req.user?.role,
      action: 'DELETE',
      entity: 'Student',
      entityId: student.id,
      oldValues: student.toJSON(),
      description: `Deleted student: ${student.studentCode}`,
      req,
    });

    await student.destroy();
    return success(res, 200, 'Student deleted successfully');
  } catch (err) {
    console.error('deleteStudent error:', err.message);
    return error(res, 500, 'Failed to delete student: ' + err.message);
  }
});

// ── GET student's own profile (for STUDENT role) ─────────────────────────────
const getMyProfile = asyncHandler(async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [
        { model: User, attributes: ['id', 'name', 'email'], required: false },
        { model: Department, attributes: ['id', 'name', 'code'], required: false },
        { model: Program, attributes: ['id', 'name', 'code'], required: false },
        { model: Batch, attributes: ['id', 'name', 'year'], required: false },
        { model: AcademicYear, attributes: ['id', 'name'], required: false },
        { model: Semester, attributes: ['id', 'name'], required: false },
        { model: Section, attributes: ['id', 'name'], required: false },
      ],
    });
    if (!student) return error(res, 404, 'Student profile not found');
    return success(res, 200, 'Profile fetched successfully', student);
  } catch (err) {
    console.error('getMyProfile error:', err.message);
    return error(res, 500, 'Failed to fetch profile: ' + err.message);
  }
});

// ── GET attendance for section check (used in TakeAttendance) ───────────────
const getStudentsBySection = asyncHandler(async (req, res) => {
  const { courseId, sectionId, batchId } = req.query;
  const where = { status: 'ACTIVE' };
  if (sectionId) where.sectionId = sectionId;
  if (batchId) where.batchId = batchId;

  try {
    const students = await Student.findAll({
      where,
      include: [
        { model: User, attributes: ['id', 'name', 'email'], required: true },
        { model: Section, attributes: ['id', 'name'], required: false },
        { model: Batch, attributes: ['id', 'name'], required: false },
        { model: Department, attributes: ['id', 'name'], required: false },
      ],
      order: [[User, 'name', 'ASC']],
    });
    return success(res, 200, 'Students fetched successfully', students);
  } catch (err) {
    console.error('getStudentsBySection error:', err.message);
    return error(res, 500, 'Failed to fetch students: ' + err.message);
  }
});

// ── Upload student profile photo ────────────────────────────────────────────
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
const exportStudents = asyncHandler(async (req, res) => {
  const { Op } = require('sequelize');
  const XLSX = require('xlsx');
  const { departmentId, sectionId, batchId, status, search } = req.query;

  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (sectionId) where.sectionId = sectionId;
  if (batchId) where.batchId = batchId;
  if (status) where.status = status.toUpperCase();
  if (search) where[Op.or] = [{ studentCode: { [Op.iLike]: `%${search}%` } }];

  const students = await Student.findAll({
    where,
    include: [
      { model: User, attributes: ['name', 'email'], required: true },
      { model: Department, attributes: ['name'], required: false },
      { model: Program, attributes: ['name'], required: false },
      { model: Batch, attributes: ['name'], required: false },
      { model: AcademicYear, attributes: ['name'], required: false },
      { model: Semester, attributes: ['name'], required: false },
      { model: Section, attributes: ['name'], required: false },
    ],
    order: [[User, 'name', 'ASC']],
    limit: 5000,
  });

  const rows = students.map((s, i) => ({
    'No': i + 1,
    'Student ID': s.studentCode || '',
    'Full Name': s.User?.name || '',
    'Email': s.User?.email || '',
    'Department': s.Department?.name || '',
    'Program': s.Program?.name || '',
    'Batch': s.Batch?.name || '',
    'Year': s.AcademicYear?.name || '',
    'Semester': s.Semester?.name || '',
    'Section': s.Section?.name || '',
    'Status': s.status || '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 }, { wch: 14 }, { wch: 30 }, { wch: 30 },
    { wch: 24 }, { wch: 24 }, { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 10 }, { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Students');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename="students.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile,
  getStudentsBySection,
  uploadStudentPhoto,
  exportStudents,        // ← add this
};
