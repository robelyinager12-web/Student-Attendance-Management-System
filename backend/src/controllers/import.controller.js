const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const bcrypt = require('bcrypt');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const {
  User, Student, Department, Program,
  Batch, AcademicYear, Semester, Section,
} = require('../models');

// Helper to normalize string values
function normalize(val) {
  if (!val) return '';
  return String(val).trim();
}

// Parse Excel or CSV file and return array of row objects
function parseFile(filePath, fileExt) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  return rows;
}

// Validate a single row
function validateRow(row, index) {
  const errors = [];
  const rowNum = index + 2; // +2 because index 0 = row 2 in Excel (row 1 is header)

  if (!normalize(row['Student ID']) && !normalize(row['Registration Number'])) {
    errors.push(`Row ${rowNum}: Student ID or Registration Number is required`);
  }
  if (!normalize(row['First Name'])) {
    errors.push(`Row ${rowNum}: First Name is required`);
  }
  if (!normalize(row['Last Name'])) {
    errors.push(`Row ${rowNum}: Last Name is required`);
  }
  if (!normalize(row['Email'])) {
    errors.push(`Row ${rowNum}: Email is required`);
  }

  return errors;
}

// Preview import without saving
const previewImport = asyncHandler(async (req, res) => {
  if (!req.file) return error(res, 400, 'No file uploaded');

  const filePath = req.file.path;
  const fileExt = path.extname(req.file.originalname).toLowerCase();

  if (!['.xlsx', '.xls', '.csv'].includes(fileExt)) {
    fs.unlinkSync(filePath);
    return error(res, 400, 'Only Excel (.xlsx, .xls) or CSV files are allowed');
  }

  try {
    const rows = parseFile(filePath, fileExt);
    fs.unlinkSync(filePath);

    if (rows.length === 0) {
      return error(res, 400, 'File is empty or has no data rows');
    }

    const validationErrors = [];
    rows.forEach((row, i) => {
      const rowErrors = validateRow(row, i);
      validationErrors.push(...rowErrors);
    });

    return success(res, 200, 'File preview ready', {
      totalRows: rows.length,
      sampleRows: rows.slice(0, 5),
      validationErrors,
      isValid: validationErrors.length === 0,
      columns: Object.keys(rows[0] || {}),
    });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return error(res, 500, `Failed to parse file: ${err.message}`);
  }
});

// Actual import — saves students to database
const importStudents = asyncHandler(async (req, res) => {
  if (!req.file) return error(res, 400, 'No file uploaded');

  const filePath = req.file.path;
  const fileExt = path.extname(req.file.originalname).toLowerCase();

  if (!['.xlsx', '.xls', '.csv'].includes(fileExt)) {
    fs.unlinkSync(filePath);
    return error(res, 400, 'Only Excel (.xlsx, .xls) or CSV files are allowed');
  }

  const {
    departmentId,
    batchId,
    academicYearId,
    semesterId,
    sectionId,
    programId,
  } = req.body;

  try {
    const rows = parseFile(filePath, fileExt);
    fs.unlinkSync(filePath);

    if (rows.length === 0) {
      return error(res, 400, 'File is empty');
    }

    const results = {
      total: rows.length,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    const defaultPassword = await bcrypt.hash('password123', 10);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        const studentId = normalize(row['Student ID']);
        const regNumber = normalize(row['Registration Number']);
        const firstName = normalize(row['First Name']);
        const middleName = normalize(row['Middle Name'] || row['Father Name'] || '');
        const lastName = normalize(row['Last Name']);
        const gender = normalize(row['Gender']).toUpperCase();
        const email = normalize(row['Email']).toLowerCase();
        const phone = normalize(row['Phone']);

        // Skip row if required fields missing
        if (!firstName || !lastName) {
          results.errors.push(`Row ${rowNum}: Missing first or last name — skipped`);
          results.skipped++;
          continue;
        }

        // Generate email if not provided
        const studentEmail = email ||
          `${(studentId || regNumber).replace('/', '-').toLowerCase()}@injibara.edu.et`;

        // Check for duplicate email
        const existingUser = await User.findOne({ where: { email: studentEmail } });
        if (existingUser) {
          results.errors.push(`Row ${rowNum}: ${studentEmail} already exists — skipped`);
          results.skipped++;
          continue;
        }

        // Check for duplicate student code
        const studentCode = studentId || regNumber;
        if (studentCode) {
          const existingStudent = await Student.findOne({ where: { studentCode } });
          if (existingStudent) {
            results.errors.push(`Row ${rowNum}: Student ID ${studentCode} already exists — skipped`);
            results.skipped++;
            continue;
          }
        }

        // Full name
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

        // Create user
        const user = await User.create({
          name: fullName,
          email: studentEmail,
          password: defaultPassword,
          role: 'STUDENT',
          isActive: true,
        });

        // Generate student code if not provided
        const count = await Student.count();
        const generatedCode = studentCode || `STU-${String(count + 1).padStart(4, '0')}`;

        // Create student
        await Student.create({
          userId: user.id,
          studentCode: generatedCode,
          registrationNumber: regNumber || null,
          gender: ['MALE', 'FEMALE', 'OTHER'].includes(gender) ? gender : null,
          phone: phone || null,
          departmentId: departmentId || null,
          programId: programId || null,
          batchId: batchId || null,
          academicYearId: academicYearId || null,
          semesterId: semesterId || null,
          sectionId: sectionId || null,
          status: 'ACTIVE',
        });

        results.imported++;

      } catch (rowErr) {
        results.errors.push(`Row ${rowNum}: ${rowErr.message}`);
        results.skipped++;
      }
    }

    return success(res, 201, 'Import completed', results);

  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return error(res, 500, `Import failed: ${err.message}`);
  }
});

// Download sample Excel template
const downloadTemplate = asyncHandler(async (req, res) => {
  const headers = [
    'Student ID',
    'Registration Number',
    'First Name',
    'Middle Name',
    'Last Name',
    'Gender',
    'Email',
    'Phone',
  ];

  const sampleData = [
    {
      'Student ID': 'INU1500510',
      'Registration Number': 'REG/001/2022',
      'First Name': 'ABAYNEW',
      'Middle Name': 'FISHA',
      'Last Name': 'ENYEW',
      'Gender': 'MALE',
      'Email': 'inu1500510@injibara.edu.et',
      'Phone': '0911223344',
    },
    {
      'Student ID': 'INU1500582',
      'Registration Number': 'REG/002/2022',
      'First Name': 'ALENE',
      'Middle Name': 'AYENEW',
      'Last Name': 'KASSAHUN',
      'Gender': 'MALE',
      'Email': 'inu1500582@injibara.edu.et',
      'Phone': '0922334455',
    },
  ];

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(sampleData, { header: headers });

  // Set column widths
  worksheet['!cols'] = headers.map(() => ({ wch: 20 }));

  xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename="student-import-template.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

module.exports = { previewImport, importStudents, downloadTemplate };