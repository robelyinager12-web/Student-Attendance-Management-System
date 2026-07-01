import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import Card from '../../components/common/Card';
import AttendanceCalendar from '../../components/calendar/AttendanceCalendar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MdCheckCircle, MdCancel, MdSchedule } from 'react-icons/md';

function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStudentStats()
      .then((res) => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen={false} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        My Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Attendance %"
          value={`${stats?.attendancePercentage ?? 0}%`}
          icon={<MdCheckCircle />}
          color="indigo"
        />
        <Card
          title="Present Days"
          value={stats?.presentDays ?? 0}
          icon={<MdCheckCircle />}
          color="green"
        />
        <Card
          title="Absent Days"
          value={stats?.absentDays ?? 0}
          icon={<MdCancel />}
          color="red"
        />
        <Card
          title="Late Days"
          value={stats?.lateDays ?? 0}
          icon={<MdSchedule />}
          color="yellow"
        />
      </div>

      <AttendanceCalendar records={stats?.calendar ?? []} />
    </div>
  );
}

export default StudentDashboard;