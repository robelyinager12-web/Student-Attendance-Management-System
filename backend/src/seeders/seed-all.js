const bcrypt = require('bcrypt');
const {
  sequelize,
  User,
  Department,
  Course,
  Class,
  Teacher,
  Student,
  Enrollment,
} = require('../models');

async function seedAdmin() {
  const existing = await User.findOne({ where: { email: 'admin@school.com' } });
  if (existing) {
    console.log('Admin already exists, skipping...');
    return;
  }
  const password = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'System Admin',
    email: 'admin@school.com',
    password,
    role: 'ADMIN',
    isActive: true,
  });
  console.log('Admin created: admin@school.com / admin123');
}

async function seedDepartments() {
  const departments = [
    {
      name: 'Computer Science',
      code: 'CS',
      description: 'Computer Science and Engineering',
      headOfDepartment: 'Dr. Abebe Kebede',
    },
    {
      name: 'Mathematics',
      code: 'MATH',
      description: 'Mathematics Department',
      headOfDepartment: 'Dr. Tigist Alemu',
    },
    {
      name: 'Physics',
      code: 'PHY',
      description: 'Physics Department',
      headOfDepartment: 'Dr. Dawit Haile',
    },
    {
      name: 'English',
      code: 'ENG',
      description: 'English Language Department',
      headOfDepartment: 'Dr. Sara Bekele',
    },
  ];

  for (const dept of departments) {
    const existing = await Department.findOne({ where: { code: dept.code } });
    if (!existing) {
      await Department.create(dept);
      console.log(`Department created: ${dept.name}`);
    }
  }
}

async function seedSampleData() {
  const password = await bcrypt.hash('password123', 10);

  const dept = await Department.findOne({ where: { code: 'CS' } });
  if (!dept) {
    console.log('CS department not found, skipping sample data...');
    return;
  }

  // Create course
  let course = await Course.findOne({ where: { code: 'CS101' } });
  if (!course) {
    course = await Course.create({
      name: 'Introduction to Programming',
      code: 'CS101',
      creditHour: 4,
      semester: '1',
      departmentId: dept.id,
    });
    console.log('Course created: CS101');
  }

  // Create teacher
  let teacherUser = await User.findOne({ where: { email: 'teacher@school.com' } });
  let teacher;
  if (!teacherUser) {
    teacherUser = await User.create({
      name: 'Mr. Robel Tesfaye',
      email: 'teacher@school.com',
      password,
      role: 'TEACHER',
    });
    teacher = await Teacher.create({
      userId: teacherUser.id,
      teacherCode: 'TCH-0001',
      phone: '0911223344',
      departmentId: dept.id,
      qualification: 'MSc Computer Science',
      experience: 5,
    });
    console.log('Teacher created: teacher@school.com / password123');
  } else {
    teacher = await Teacher.findOne({ where: { userId: teacherUser.id } });
  }

  // Create class
  let myClass = await Class.findOne({ where: { name: 'Grade 10', section: 'A' } });
  if (!myClass) {
    myClass = await Class.create({
      name: 'Grade 10',
      section: 'A',
      academicYear: '2026/2027',
      semester: '1',
      departmentId: dept.id,
      teacherId: teacher.id,
    });
    console.log('Class created: Grade 10 - A');
  }

  // Create student
  let studentUser = await User.findOne({ where: { email: 'student@school.com' } });
  if (!studentUser) {
    studentUser = await User.create({
      name: 'Selam Tesfaye',
      email: 'student@school.com',
      password,
      role: 'STUDENT',
    });
    const student = await Student.create({
      userId: studentUser.id,
      studentCode: 'STU-0001',
      gender: 'FEMALE',
      dateOfBirth: '2008-03-15',
      phone: '0922334455',
      address: 'Addis Ababa',
      departmentId: dept.id,
      courseId: course.id,
      classId: myClass.id,
      year: '1',
      semester: '1',
      guardianName: 'Almaz Tesfaye',
      guardianPhone: '0911000000',
      admissionDate: '2026-09-01',
    });
    await Enrollment.create({ studentId: student.id, courseId: course.id });
    console.log('Student created: student@school.com / password123');
  }
}

async function runSeed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected. Running seed...\n');

    await seedAdmin();
    await seedDepartments();
    await seedSampleData();

    console.log('\nSeed complete! Login credentials:');
    console.log('Admin:   admin@school.com / admin123');
    console.log('Teacher: teacher@school.com / password123');
    console.log('Student: student@school.com / password123');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await sequelize.close();
  }
}

runSeed();