import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import Card from '../../components/common/Card';
import AttendanceChart from '../../components/charts/AttendanceChart';
import StudentGrowthChart from '../../components/charts/StudentGrowthChart';
import DepartmentChart from '../../components/charts/DepartmentChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/formatDate';
import { ATTENDANCE_STATUS_COLORS } from '../../utils/constants';
import {
  MdPeople, MdSchool, MdClass, MdLibraryBooks,
  MdAssignment, MdCheckCircle, MdWarning,
  MdTrendingUp, MdGroup,
} from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [weeklyChart, setWeeklyChart] = useState([]);
  const [monthlyChart, setMonthlyChart] = useState([]);
  const [growthChart, setGrowthChart] = useState([]);
  const [deptChart, setDeptChart] = useState([]);
  const [deptAttendance, setDeptAttendance] = useState([]);
  const [batchStats, setBatchStats] = useState([]);
  const [lowAttendance, setLowAttendance] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [s, w, m, g, d, da, b, la, ra] = await Promise.all([
          dashboardService.getAdminStats(),
          dashboardService.getWeeklyChart(),
          dashboardService.getMonthlyChart(),
          dashboardService.getStudentGrowth(),
          dashboardService.getDepartmentStats(),
          dashboardService.getAttendanceByDept(),
          dashboardService.getBatchStats(),
          dashboardService.getLowAttendance(75),
          dashboardService.getRecentActivity(),
        ]);
        setStats(s.data.data);
        setWeeklyChart(w.data.data);
        setMonthlyChart(m.data.data);
        setGrowthChart(g.data.data);
        setDeptChart(d.data.data);
        setDeptAttendance(da.data.data);
        setBatchStats(b.data.data);
        setLowAttendance(la.data.data);
        setRecentActivity(ra.data.data);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Injibara University — College of Technology
          </p>
        </div>
        <div className="text-right text-sm text-gray-400">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric',
          })}
        </div>
      </div>

      {/* Stat Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Students" value={stats?.totalStudents ?? 0}
          icon={<MdPeople />} color="indigo" />
        <Card title="Total Teachers" value={stats?.totalTeachers ?? 0}
          icon={<MdSchool />} color="blue" />
        <Card title="Active Batches" value={stats?.totalBatches ?? 0}
          icon={<MdGroup />} color="purple" />
        <Card title="Departments" value={stats?.totalDepartments ?? 0}
          icon={<MdLibraryBooks />} color="green" />
      </div>

      {/* Stat Cards Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Courses" value={stats?.totalCourses ?? 0}
          icon={<MdAssignment />} color="yellow" />
        <Card title="Total Sections" value={stats?.totalSections ?? 0}
          icon={<MdClass />} color="blue" />
        <Card
          title="Today's Attendance"
          value={`${stats?.attendancePercentage ?? 0}%`}
          icon={<MdCheckCircle />}
          color="green"
          subtitle={`${stats?.presentToday ?? 0} present · ${stats?.absentToday ?? 0} absent · ${stats?.lateToday ?? 0} late`}
        />
        <Card
          title="At-Risk Students"
          value={lowAttendance.length}
          icon={<MdWarning />}
          color="red"
          subtitle="Below 75% attendance"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart data={weeklyChart} />
        <StudentGrowthChart data={growthChart} />
      </div>

      {/* Monthly Attendance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-base font-semibold text-gray-700
          dark:text-gray-200 mb-4">
          Monthly Attendance Overview (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="PRESENT" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ABSENT" fill="#EF4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="LATE" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="EXCUSED" fill="#06B6D4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department Attendance Rate */}
      {deptAttendance.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-base font-semibold text-gray-700
            dark:text-gray-200 mb-4">
            Attendance Rate by Department
          </h3>
          <div className="space-y-3">
            {deptAttendance.map((dept) => (
              <div key={dept.department}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {dept.department}
                  </span>
                  <span className={`text-sm font-bold
                    ${parseFloat(dept.percentage) >= 75
                      ? 'text-green-600'
                      : 'text-red-600'
                    }`}>
                    {dept.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all
                      ${parseFloat(dept.percentage) >= 75
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min(dept.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Active Batches */}
        {batchStats.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border
            border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-700
              dark:text-gray-200 mb-4">
              Active Batches
            </h3>
            <div className="space-y-3">
              {batchStats.map((batch) => (
                <div key={batch.id} className="flex items-center
                  justify-between p-3 bg-gray-50 dark:bg-gray-700/50
                  rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700
                      dark:text-gray-200">
                      {batch.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {batch.department} · {batch.currentYear}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">
                    {batch.studentCount} students
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Attendance Warning */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-base font-semibold text-gray-700
            dark:text-gray-200 mb-4 flex items-center gap-2">
            <MdWarning className="text-red-500" size={20} />
            At-Risk Students (Below 75%)
          </h3>
          {lowAttendance.length === 0 ? (
            <div className="text-center py-6">
              <MdCheckCircle size={40} className="text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                All students are above 75% attendance
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lowAttendance.slice(0, 10).map((student) => (
                <div key={student.id} className="flex items-center
                  justify-between p-3 bg-red-50 dark:bg-red-900/20
                  rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700
                      dark:text-gray-200">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {student.studentCode} · {student.department}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {student.attendancePercentage}%
                  </span>
                </div>
              ))}
              {lowAttendance.length > 10 && (
                <p className="text-xs text-center text-gray-400 pt-2">
                  + {lowAttendance.length - 10} more students
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Department Chart */}
      <DepartmentChart data={deptChart} />

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-base font-semibold text-gray-700
            dark:text-gray-200 mb-4">
            Recent Attendance Activity
          </h3>
          <div className="space-y-2">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center
                justify-between p-3 hover:bg-gray-50
                dark:hover:bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100
                    dark:bg-indigo-900/30 flex items-center justify-center
                    text-xs font-bold text-indigo-600">
                    {activity.studentName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700
                      dark:text-gray-200">
                      {activity.studentName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {activity.course || 'General'} · {activity.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full
                    font-medium ${ATTENDANCE_STATUS_COLORS[activity.status]}`}>
                    {activity.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDateTime(activity.markedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;