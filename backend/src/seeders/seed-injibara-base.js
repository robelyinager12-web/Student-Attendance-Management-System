require('dotenv').config();
const {
  sequelize, College, Department, Program,
  Batch, AcademicYear, Semester,
} = require('../models');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connected. Seeding Injibara base data...\n');

    // College
    let college = await College.findOne({ where: { code: 'COT' } });
    if (!college) {
      college = await College.create({
        name: 'College of Technology',
        code: 'COT',
        description: 'Injibara University College of Technology',
        dean: 'Dean Name',
        email: 'cot@injibara.edu.et',
        phone: '+251-58-000-0000',
        address: 'Injibara, Awi Zone, Amhara Region, Ethiopia',
      });
      console.log('College created: College of Technology');
    }

    // Departments
    const deptData = [
      { name: 'Software Engineering', code: 'SE' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Computer Science', code: 'CS' },
      { name: 'Information Systems', code: 'IS' },
      { name: 'Civil Engineering', code: 'CE' },
      { name: 'Mechanical Engineering', code: 'ME' },
      { name: 'Electrical Engineering', code: 'EE' },
    ];

    const departments = {};
    for (const d of deptData) {
      let dept = await Department.findOne({ where: { code: d.code } });
      if (!dept) {
        dept = await Department.create({
          name: d.name,
          code: d.code,
          collegeId: college.id,
        });
        console.log(`Department created: ${d.name}`);
      }
      departments[d.code] = dept;
    }

    // Programs
    const programData = [
      { name: 'BSc Software Engineering', code: 'BSE', dept: 'SE', duration: 4 },
      { name: 'BSc Information Technology', code: 'BIT', dept: 'IT', duration: 4 },
      { name: 'BSc Computer Science', code: 'BCS', dept: 'CS', duration: 4 },
      { name: 'BSc Information Systems', code: 'BIS', dept: 'IS', duration: 4 },
      { name: 'BSc Civil Engineering', code: 'BCE', dept: 'CE', duration: 5 },
      { name: 'BSc Mechanical Engineering', code: 'BME', dept: 'ME', duration: 5 },
      { name: 'BSc Electrical Engineering', code: 'BEE', dept: 'EE', duration: 5 },
    ];

    const programs = {};
    for (const p of programData) {
      let prog = await Program.findOne({ where: { code: p.code } });
      if (!prog) {
        prog = await Program.create({
          name: p.name,
          code: p.code,
          departmentId: departments[p.dept].id,
          collegeId: college.id,
          duration: p.duration,
        });
        console.log(`Program created: ${p.name}`);
      }
      programs[p.code] = prog;
    }

    // Batches for SE department (2022, 2023, 2024)
    const batchYears = [2022, 2023, 2024];
    const batches = {};
    for (const year of batchYears) {
      let batch = await Batch.findOne({
        where: { year, departmentId: departments['SE'].id },
      });
      if (!batch) {
        batch = await Batch.create({
          name: `Batch ${year}`,
          year,
          departmentId: departments['SE'].id,
          programId: programs['BSE'].id,
          status: year === 2022 ? 'GRADUATED' : 'ACTIVE',
        });
        console.log(`Batch created: Batch ${year} (SE)`);
      }
      batches[year] = batch;
    }

    // Academic Years for Batch 2022 (Year I to IV)
    const batch2022 = batches[2022];
    const yearNames = ['Year I', 'Year II', 'Year III', 'Year IV'];
    const academicYears = {};
    for (let i = 0; i < yearNames.length; i++) {
      let ay = await AcademicYear.findOne({
        where: { year: i + 1, batchId: batch2022.id },
      });
      if (!ay) {
        ay = await AcademicYear.create({
          name: yearNames[i],
          year: i + 1,
          batchId: batch2022.id,
          isCurrent: i === 2, // Year III is current for 2022 batch
        });
        console.log(`Academic Year created: ${yearNames[i]} (Batch 2022)`);
      }
      academicYears[i + 1] = ay;
    }

    // Semesters for Year III (current)
    const yearIII = academicYears[3];
    for (let s = 1; s <= 2; s++) {
      let sem = await Semester.findOne({
        where: { number: s, academicYearId: yearIII.id },
      });
      if (!sem) {
        sem = await Semester.create({
          name: `Semester ${s}`,
          number: s,
          academicYearId: yearIII.id,
          isCurrent: s === 1,
          startDate: s === 1 ? '2026-09-01' : '2027-01-15',
          endDate: s === 1 ? '2027-01-10' : '2027-06-30',
        });
        console.log(`Semester created: Semester ${s} (Year III)`);
      }
    }

    console.log('\n✅ Injibara University base data seeded successfully!');
    console.log('College, 7 Departments, 7 Programs, 3 Batches, Academic Years, Semesters created.');

  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();