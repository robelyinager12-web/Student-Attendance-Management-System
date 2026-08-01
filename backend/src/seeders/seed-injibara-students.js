require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, User, Student, Department, Course, Class } = require('../models');

const group1Students = [
  { fname: 'ABAYNEW', mname: 'FISHA', lname: 'ENYEW', id: 'INU1500510' },
  { fname: 'ALENE', mname: 'AYENEW', lname: 'KASSAHUN', id: 'INU1500582' },
  { fname: 'AMANUEAL', mname: 'AYALEW', lname: 'TADESSE', id: 'INU1500588' },
  { fname: 'ASEFA', mname: 'KIDANU', lname: 'ABEBE', id: 'INU1500612' },
  { fname: 'BERUK', mname: 'ASHEBER', lname: 'MIRTIE', id: 'INU1500663' },
  { fname: 'BETESFA', mname: 'MENGESHA', lname: 'CHEKOL', id: 'INU1500668' },
  { fname: 'BEWKET', mname: 'MENGIE', lname: 'AZEZE', id: 'INU1500671' },
  { fname: 'BEZAWIT', mname: 'GASHAW', lname: 'ANDARGE', id: 'INU1500673' },
  { fname: 'BINIYAM', mname: 'TEGEGNE', lname: 'TEREFE', id: 'INU1500680' },
  { fname: 'BIRUK', mname: 'YASIN', lname: 'YEKA', id: 'INU1500695' },
  { fname: 'CHALACHEW', mname: 'YESUNEH', lname: 'ZEWDE', id: 'INU1500704' },
  { fname: 'CHALIE', mname: 'MELKAMU', lname: 'WAGNEW', id: 'INU1500705' },
  { fname: 'DANIAL', mname: 'DESALEW', lname: 'TILAYE', id: 'INU1500709' },
  { fname: 'DANIEL', mname: 'AYEN', lname: 'DEMEKE', id: 'INU1500711' },
  { fname: 'DAWIT', mname: 'DARGIE', lname: 'AYENEW', id: 'INU1500720' },
  { fname: 'DAWIT', mname: 'MOLLA', lname: 'TSEGAW', id: 'INU1500718' },
  { fname: 'DEAWIT', mname: 'TSEGIE', lname: 'GENET', id: 'INU1500722' },
  { fname: 'ELIAS', mname: 'ADANE', lname: 'TEFERA', id: 'INU1500762' },
  { fname: 'ENYEW', mname: 'GETNET', lname: 'TADESSE', id: 'INU1500778' },
  { fname: 'EYOB', mname: 'KEFALE', lname: 'WORKU', id: 'INU1500803' },
  { fname: 'GETNET', mname: 'ADAMU', lname: 'BEYENE', id: 'INU1500861' },
  { fname: 'HAILEMARIAM', mname: 'GEREMEW', lname: 'TADESSE', id: 'INU1500884' },
  { fname: 'HANA', mname: 'DEMISEW', lname: 'AREGA', id: 'INU1500886' },
  { fname: 'HENOK', mname: 'AMARE', lname: 'ABEBE', id: 'INU1500896' },
  { fname: 'KIDIST', mname: 'ADAL', lname: 'TILAHUN', id: 'INU1700013' },
  { fname: 'MAHLET', mname: 'ESUBALEW', lname: 'ALEM', id: 'INU1500939' },
  { fname: 'MEKONNEN', mname: 'ASAYE', lname: 'MESELE', id: 'INU1500955' },
  { fname: 'MEKUANNT', mname: 'MUNYE', lname: 'BIRLEW', id: 'INU1500956' },
  { fname: 'MELAKU', mname: 'ADANE', lname: 'HUNEGN', id: 'INU1500962' },
  { fname: 'MENGISTU', mname: 'ABAWA', lname: 'BAYIH', id: 'INU1500977' },
];

const group2Students = [
  { fname: 'MIHIRETU', mname: 'NIGUSSIE', lname: 'ARAGIE', id: 'INU1500991' },
  { fname: 'MULATU', mname: 'JALETA', lname: 'ABDETA', id: 'INU1501009' },
  { fname: 'ROEBEL', mname: 'YINAGER', lname: 'ASRES', id: 'INU1501051' },
  { fname: 'SISAY', mname: 'ALEMU', lname: 'BELACHEW', id: 'INU1700012' },
  { fname: 'TADESSE', mname: 'ASRIE', lname: 'ALEMAYEHU', id: 'INU1501088' },
  { fname: 'TEMESGEN', mname: 'WORKU', lname: 'ADANE', id: 'INU1501108' },
  { fname: 'TESHOME', mname: 'TSEGAYE', lname: 'GETIE', id: 'INU1501122' },
  { fname: 'TEWACHEW', mname: 'MELAKU', lname: 'HAILU', id: 'INU1501123' },
  { fname: 'WENDESEN', mname: 'DAMTEW', lname: 'ASNAKE', id: 'INU1501144' },
  { fname: 'YASCHILAL', mname: 'ADANE', lname: 'TIRUNEH', id: 'INU1501168' },
  { fname: 'YIBELETAL', mname: 'FIKADU', lname: 'ALEMU', id: 'INU1501186' },
  { fname: 'YIBELTAL', mname: 'YITAYEW', lname: 'MOLLA', id: 'INU1501189' },
  { fname: 'ZEWOTR', mname: 'LAMESGINEW', lname: 'AYALEW', id: 'INU1501232' },
  { fname: 'DAWIT', mname: 'TADESSE', lname: 'ALEMU', id: 'IUNSR/0283/14' },
  { fname: 'YARED', mname: 'AREGAYEHU', lname: 'WEREDE', id: 'INU1501164' },
];

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.\n');

    const password = await bcrypt.hash('password123', 10);

    // Find or create department
    let dept = await Department.findOne({ where: { code: 'SE' } });
    if (!dept) {
      dept = await Department.create({
        name: 'Software Engineering',
        code: 'SE',
        description: 'Department of Software Engineering - Injibara University',
        headOfDepartment: 'Department Head',
      });
      console.log('Department created: Software Engineering');
    }

    // Find or create course
    let course = await Course.findOne({ where: { code: 'SE301' } });
    if (!course) {
      course = await Course.create({
        name: 'Software Engineering 3rd Year',
        code: 'SE301',
        creditHour: 4,
        semester: '1',
        departmentId: dept.id,
      });
      console.log('Course created: SE301');
    }

    // Find or create Group 1 class
    let class1 = await Class.findOne({ where: { name: 'SE Year 3 Group 1' } });
    if (!class1) {
      class1 = await Class.create({
        name: 'SE Year 3 Group 1',
        section: 'Group 208',
        academicYear: '2026/2027',
        semester: '1',
        departmentId: dept.id,
      });
      console.log('Class created: SE Year 3 Group 1 (208)');
    }

    // Find or create Group 2 class
    let class2 = await Class.findOne({ where: { name: 'SE Year 3 Group 2' } });
    if (!class2) {
      class2 = await Class.create({
        name: 'SE Year 3 Group 2',
        section: 'Group 209',
        academicYear: '2026/2027',
        semester: '1',
        departmentId: dept.id,
      });
      console.log('Class created: SE Year 3 Group 2 (209)');
    }

    // Add Group 1 students
    console.log('\nAdding Group 1 students...');
    let count = await Student.count();

    for (const s of group1Students) {
      const fullName = `${s.fname} ${s.mname} ${s.lname}`;
      const email = `${s.id.toLowerCase()}@injibara.edu`;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        console.log(`  Skipped (exists): ${fullName}`);
        continue;
      }

      count++;
      const user = await User.create({
        name: fullName,
        email,
        password,
        role: 'STUDENT',
        isActive: true,
      });

      await Student.create({
        userId: user.id,
        studentCode: s.id,
        departmentId: dept.id,
        courseId: course.id,
        classId: class1.id,
        year: '3',
        semester: '1',
        status: 'ACTIVE',
      });

      console.log(`  Added: ${fullName} (${s.id})`);
    }

    // Add Group 2 students
    console.log('\nAdding Group 2 students...');
    for (const s of group2Students) {
      const fullName = `${s.fname} ${s.mname} ${s.lname}`;
      const email = `${s.id.replace('/', '-').toLowerCase()}@injibara.edu`;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        console.log(`  Skipped (exists): ${fullName}`);
        continue;
      }

      const user = await User.create({
        name: fullName,
        email,
        password,
        role: 'STUDENT',
        isActive: true,
      });

      await Student.create({
        userId: user.id,
        studentCode: s.id,
        departmentId: dept.id,
        courseId: course.id,
        classId: class2.id,
        year: '3',
        semester: '1',
        status: 'ACTIVE',
      });

      console.log(`  Added: ${fullName} (${s.id})`);
    }

    console.log('\n✅ All students added successfully!');
    console.log('Login password for all students: password123');
    console.log('Email format: studentID@injibara.edu');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();