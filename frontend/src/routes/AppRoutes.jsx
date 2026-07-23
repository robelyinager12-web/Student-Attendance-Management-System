import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

import AdminDashboard from '../pages/dashboard/AdminDashboard';
import TeacherDashboard from '../pages/dashboard/TeacherDashboard';
import StudentDashboard from '../pages/dashboard/StudentDashboard';

import StudentList from '../pages/students/StudentList';
import StudentForm from '../pages/students/StudentForm';
import StudentProfile from '../pages/students/StudentProfile';
import ImportStudents from '../pages/students/ImportStudents';

import TeacherList from '../pages/teachers/TeacherList';
import TeacherForm from '../pages/teachers/TeacherForm';

import DepartmentList from '../pages/departments/DepartmentList';
import CourseList from '../pages/courses/CourseList';
import ClassList from '../pages/classes/ClassList';

import TakeAttendance from '../pages/attendance/TakeAttendance';
import AttendanceHistory from '../pages/attendance/AttendanceHistory';

import Reports from '../pages/reports/Reports';
import Profile from '../pages/profile/Profile';
import Settings from '../pages/profile/Settings';
import Notifications from '../pages/notifications/Notifications';
import NotFound from '../pages/NotFound';

function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (user?.role === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
  if (user?.role === 'TEACHER') return <Navigate to="/dashboard/teacher" replace />;
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard/student" replace />;

  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>

      {/* ── Auth routes ── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* ── Protected dashboard routes ── */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/dashboard/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher" element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/student" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        {/* Students */}
        <Route path="/students" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <StudentList />
          </ProtectedRoute>
        } />
        <Route path="/students/new" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <StudentForm />
          </ProtectedRoute>
        } />
        <Route path="/students/import" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ImportStudents />
          </ProtectedRoute>
        } />
        <Route path="/students/:id" element={<StudentProfile />} />

        {/* Teachers */}
        <Route path="/teachers" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <TeacherList />
          </ProtectedRoute>
        } />
        <Route path="/teachers/new" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <TeacherForm />
          </ProtectedRoute>
        } />

        {/* Academic */}
        <Route path="/departments" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DepartmentList />
          </ProtectedRoute>
        } />
        <Route path="/courses" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CourseList />
          </ProtectedRoute>
        } />
        <Route path="/classes" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ClassList />
          </ProtectedRoute>
        } />

        {/* Attendance */}
        <Route path="/attendance" element={<TakeAttendance />} />
        <Route path="/attendance/history" element={<AttendanceHistory />} />

        {/* Reports */}
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <Reports />
          </ProtectedRoute>
        } />

        {/* Other */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Settings />
          </ProtectedRoute>
        } />

      </Route>
      {/* ── End dashboard routes ── */}

      {/* ── Fallback routes ── */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default AppRoutes;