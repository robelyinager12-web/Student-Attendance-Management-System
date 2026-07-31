import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LandingPage from '../pages/landing/LandingPage';

import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Auth
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Role-based home page
import HomePage from '../pages/home/HomePage';

// Students
import StudentList from '../pages/students/StudentList';
import StudentForm from '../pages/students/StudentForm';
import StudentProfile from '../pages/students/StudentProfile';
import ImportStudents from '../pages/students/ImportStudents';

// Teachers
import TeacherList from '../pages/teachers/TeacherList';
import TeacherForm from '../pages/teachers/TeacherForm';

// Academic
import DepartmentList from '../pages/departments/DepartmentList';
import CourseList from '../pages/courses/CourseList';
import CourseAssignment from '../pages/courses/CourseAssignment';
import ClassList from '../pages/classes/ClassList';
import ProgramList from '../pages/programs/ProgramList';
import BatchList from '../pages/batches/BatchList';
import AcademicStructure from '../pages/academic/AcademicStructure';
import SectionList from '../pages/sections/SectionList';

// Enrollments & Audit
import StudentEnrollmentPage from '../pages/enrollments/StudentEnrollment';
import AuditLog from '../pages/settings/AuditLog';

// Attendance
import TakeAttendance from '../pages/attendance/TakeAttendance';
import AttendanceHistory from '../pages/attendance/AttendanceHistory';

// Other
import Reports from '../pages/reports/Reports';
import Profile from '../pages/profile/Profile';
import Settings from '../pages/profile/Settings';
import Notifications from '../pages/notifications/Notifications';
import NotFound from '../pages/NotFound';

// ── After login, redirect to /home ──────────────────────────────────────────
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/home" replace />;
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>

      {/* ── Auth routes ── */}
      <Route element={<AuthLayout />}>
        <Route path="/login"           element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
      </Route>

      {/* ── Protected routes (inside DashboardLayout) ── */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        {/* ✅ Single home route — all roles */}
        <Route path="/home" element={<HomePage />} />

        {/* Legacy redirects */}
        <Route path="/dashboard"         element={<Navigate to="/home" replace />} />
        <Route path="/dashboard/admin"   element={<Navigate to="/home" replace />} />
        <Route path="/dashboard/teacher" element={<Navigate to="/home" replace />} />
        <Route path="/dashboard/student" element={<Navigate to="/home" replace />} />

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
        <Route path="/programs" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ProgramList />
          </ProtectedRoute>
        } />
        <Route path="/batches" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <BatchList />
          </ProtectedRoute>
        } />
        <Route path="/academic" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AcademicStructure />
          </ProtectedRoute>
        } />
        <Route path="/sections" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SectionList />
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
        <Route path="/course-assignments" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CourseAssignment />
          </ProtectedRoute>
        } />
        <Route path="/enrollments" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <StudentEnrollmentPage />
          </ProtectedRoute>
        } />

        {/* Attendance */}
        <Route path="/attendance"         element={<TakeAttendance />} />
        <Route path="/attendance/history" element={<AttendanceHistory />} />

        {/* Reports */}
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <Reports />
          </ProtectedRoute>
        } />

        {/* Admin only */}
        <Route path="/audit-logs" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AuditLog />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Settings />
          </ProtectedRoute>
        } />

        {/* Common */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile"       element={<Profile />} />

      </Route>
      {/* ── End protected routes ── */}

    {/* ── Root → Landing page ── */}
<Route path="/" element={<LandingPage />} />
<Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;