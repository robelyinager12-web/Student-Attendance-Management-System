const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const dashboardService = require('../services/dashboard.service');

const getAdminDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getAdminStats();
  return success(res, 200, 'Admin dashboard stats fetched', stats);
});

const getMonthlyChart = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMonthlyAttendanceChart();
  return success(res, 200, 'Monthly chart fetched', data);
});

const getWeeklyChart = asyncHandler(async (req, res) => {
  const data = await dashboardService.getWeeklyAttendanceChart();
  return success(res, 200, 'Weekly chart fetched', data);
});

const getStudentGrowthChart = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStudentGrowthChart();
  return success(res, 200, 'Student growth chart fetched', data);
});

const getDepartmentStats = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDepartmentStats();
  return success(res, 200, 'Department stats fetched', data);
});

const getBatchStats = asyncHandler(async (req, res) => {
  const data = await dashboardService.getBatchStats();
  return success(res, 200, 'Batch stats fetched', data);
});

const getAttendanceByDepartment = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAttendanceByDepartment();
  return success(res, 200, 'Attendance by department fetched', data);
});

const getLowAttendanceStudents = asyncHandler(async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 75;
  const data = await dashboardService.getLowAttendanceStudents(threshold);
  return success(res, 200, 'Low attendance students fetched', data);
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRecentAttendanceActivity();
  return success(res, 200, 'Recent activity fetched', data);
});

const getTeacherDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getTeacherDashboardStats(req.user.id);
  if (!stats) return error(res, 404, 'Teacher profile not found');
  return success(res, 200, 'Teacher dashboard fetched', stats);
});

const getStudentDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStudentDashboardStats(req.user.id);
  if (!stats) return error(res, 404, 'Student profile not found');
  return success(res, 200, 'Student dashboard fetched', stats);
});

module.exports = {
  getAdminDashboard,
  getMonthlyChart,
  getWeeklyChart,
  getStudentGrowthChart,
  getDepartmentStats,
  getBatchStats,
  getAttendanceByDepartment,
  getLowAttendanceStudents,
  getRecentActivity,
  getTeacherDashboard,
  getStudentDashboard,
};