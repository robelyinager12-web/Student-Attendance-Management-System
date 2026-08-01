const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { getAttendanceReportData } = require('../services/report.service');
const { generateAttendancePdf } = require('../utils/exportPdf.utils');
const { generateAttendanceExcel } = require('../utils/exportExcel.utils');
const { generateAttendanceCsv } = require('../utils/exportCsv.utils');

// Shared handler that supports ?format=json|pdf|excel|csv
async function buildReport(req, res, title) {
  const { classId, studentId, departmentId, from, to, format } = req.query;

  const { headers, rows, records } = await getAttendanceReportData({
    classId, studentId, departmentId, from, to,
  });

  if (format === 'pdf') {
    return generateAttendancePdf(res, { title, headers, rows });
  }
  if (format === 'excel') {
    return generateAttendanceExcel(res, { title, headers, rows });
  }
  if (format === 'csv') {
    return generateAttendanceCsv(res, { title, headers, rows });
  }

  return success(res, 200, `${title} fetched successfully`, records);
}

const dailyReport = asyncHandler(async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  req.query.from = date;
  req.query.to = date;
  return buildReport(req, res, 'Daily Attendance Report');
});

const weeklyReport = asyncHandler(async (req, res) => {
  if (!req.query.from || !req.query.to) {
    return error(res, 400, 'from and to dates are required for weekly report');
  }
  return buildReport(req, res, 'Weekly Attendance Report');
});

const monthlyReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) {
    return error(res, 400, 'month and year are required for monthly report');
  }
  const start = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const end = new Date(year, month, 0).toISOString().split('T')[0];
  req.query.from = start;
  req.query.to = end;
  return buildReport(req, res, 'Monthly Attendance Report');
});

const studentReport = asyncHandler(async (req, res) => {
  if (!req.query.studentId) {
    return error(res, 400, 'studentId is required for student report');
  }
  return buildReport(req, res, 'Student Attendance Report');
});

const classReport = asyncHandler(async (req, res) => {
  if (!req.query.classId) {
    return error(res, 400, 'classId is required for class report');
  }
  return buildReport(req, res, 'Class Attendance Report');
});

const departmentReport = asyncHandler(async (req, res) => {
  if (!req.query.departmentId) {
    return error(res, 400, 'departmentId is required for department report');
  }
  return buildReport(req, res, 'Department Attendance Report');
});

module.exports = {
  dailyReport,
  weeklyReport,
  monthlyReport,
  studentReport,
  classReport,
  departmentReport,
};