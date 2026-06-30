const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const dashboardService = require('../services/dashboard.service');

const getAdminDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getAdminStats();
  return success(res, 200, 'Admin dashboard stats fetched successfully', stats);
});

const getMonthlyChart = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMonthlyAttendanceChart();
  return success(res, 200, 'Monthly attendance chart fetched successfully', data);
});

const getWeeklyChart = asyncHandler(async (req, res) => {
  const data = await dashboardService.getWeeklyAttendanceChart();
  return success(res, 200, 'Weekly attendance chart fetched successfully', data);
});

const getStudentGrowthChart = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStudentGrowthChart();
  return success(res, 200, 'Student growth chart fetched successfully', data);
});

const getDepartmentStats = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDepartmentStats();
  return success(res, 200, 'Department statistics fetched successfully', data);
});

const getTeacherDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getTeacherDashboardStats(req.user.id);
  if (!stats) return error(res, 404, 'Teacher profile not found');
  return success(res, 200, 'Teacher dashboard stats fetched successfully', stats);
});

const getStudentDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStudentDashboardStats(req.user.id);
  if (!stats) return error(res, 404, 'Student profile not found');
  return success(res, 200, 'Student dashboard stats fetched successfully', stats);
});

module.exports = {
  getAdminDashboard,
  getMonthlyChart,
  getWeeklyChart,
  getStudentGrowthChart,
  getDepartmentStats,
  getTeacherDashboard,
  getStudentDashboard,
};