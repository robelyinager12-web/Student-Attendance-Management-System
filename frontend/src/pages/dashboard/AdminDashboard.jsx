import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import Card from '../../components/common/Card';
import AttendanceChart from '../../components/charts/AttendanceChart';
import StudentGrowthChart from '../../components/charts/StudentGrowthChart';
import DepartmentChart from '../../components/charts/DepartmentChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  MdPeople, MdSchool, MdClass,
  MdLibraryBooks, MdAssignment, MdCheckCircle,
} from 'react-icons/md';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [weeklyChart, setWeeklyChart] = useState([]);
  const [growthChart, setGrowthChart] = useState([]);
  const [deptChart, setDeptChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [s, w, g, d] = await Promise.all([
          dashboardService.getAdminStats(),
          dashboardService.getWeeklyChart(),
          dashboardService.getStudentGrowth(),
          dashboardService.getDepartmentStats(),
        ]);
        setStats(s.data.data);
        setWeeklyChart(w.data.data);
        setGrowthChart(g.data.data);
        setDeptChart(d.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner fullScreen={false} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Admin Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          icon={<MdPeople />}
          color="indigo"
        />
        <Card
          title="Total Teachers"
          value={stats?.totalTeachers ?? 0}
          icon={<MdSchool />}
          color="blue"
        />
        <Card
          title="Total Courses"
          value={stats?.totalCourses ?? 0}
          icon={<MdAssignment />}
          color="purple"
        />
        <Card
          title="Total Departments"
          value={stats?.totalDepartments ?? 0}
          icon={<MdLibraryBooks />}
          color="green"
        />
        <Card
          title="Total Classes"
          value={stats?.totalClasses ?? 0}
          icon={<MdClass />}
          color="yellow"
        />
        <Card
          title="Attendance Today"
          value={`${stats?.attendancePercentage ?? 0}%`}
          icon={<MdCheckCircle />}
          color="green"
          subtitle={`${stats?.presentToday ?? 0} present / ${stats?.absentToday ?? 0} absent`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart data={weeklyChart} />
        <StudentGrowthChart data={growthChart} />
      </div>

      <DepartmentChart data={deptChart} />
    </div>
  );
}

export default AdminDashboard;