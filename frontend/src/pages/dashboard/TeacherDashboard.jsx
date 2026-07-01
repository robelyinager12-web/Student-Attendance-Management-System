import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';
import { ATTENDANCE_STATUS_COLORS } from '../../utils/constants';
import { MdClass, MdCheckCircle, MdPending } from 'react-icons/md';

function TeacherDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getTeacherStats()
      .then((res) => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen={false} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Teacher Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          title="Assigned Classes"
          value={stats?.todayClassesCount ?? 0}
          icon={<MdClass />}
          color="indigo"
        />
        <Card
          title="Attendance Taken Today"
          value={stats?.attendanceTakenToday ?? 0}
          icon={<MdCheckCircle />}
          color="green"
        />
        <Card
          title="Pending Attendance"
          value={stats?.pendingAttendance ?? 0}
          icon={<MdPending />}
          color="yellow"
        />
      </div>

      {/* Classes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold text-gray-700
          dark:text-gray-200 mb-4">
          My Classes
        </h2>
        <div className="space-y-2">
          {stats?.assignedClasses?.map((cls) => (
            <div key={cls.id} className="flex items-center justify-between
              p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700
                dark:text-gray-200">
                {cls.name} {cls.section && `— Section ${cls.section}`}
              </span>
            </div>
          ))}
          {stats?.assignedClasses?.length === 0 && (
            <p className="text-gray-400 text-sm">No classes assigned yet</p>
          )}
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold text-gray-700
          dark:text-gray-200 mb-4">
          Recent Attendance
        </h2>
        <div className="space-y-2">
          {stats?.recentAttendance?.map((a) => (
            <div key={a.id} className="flex items-center justify-between
              p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700
                  dark:text-gray-200">
                  {a.Student?.User?.name}
                </p>
                <p className="text-xs text-gray-400">{formatDate(a.date)}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium
                ${ATTENDANCE_STATUS_COLORS[a.status]}`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;