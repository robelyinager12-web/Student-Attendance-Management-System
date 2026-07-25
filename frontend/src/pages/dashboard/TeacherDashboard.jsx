import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';
import { courseAssignmentService } from '../../services/courseAssignment.service';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';
import { ATTENDANCE_STATUS_COLORS } from '../../utils/constants';
import {
  MdClass, MdCheckCircle, MdPending,
  MdBook, MdPeople, MdArrowForward,
} from 'react-icons/md';

function TeacherDashboard() {
  const [stats, setStats] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAll() {
      try {
        const [s, courses] = await Promise.all([
          dashboardService.getTeacherStats(),
          courseAssignmentService.getMyCourses(),
        ]);
        setStats(s.data.data);
        setAssignedCourses(courses.data.data);
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
        Teacher Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          title="Assigned Courses"
          value={assignedCourses.length}
          icon={<MdBook />}
          color="indigo"
        />
        <Card
          title="Attendance Today"
          value={stats?.attendanceTakenToday ?? 0}
          icon={<MdCheckCircle />}
          color="green"
          subtitle="Records submitted today"
        />
        <Card
          title="Assigned Sections"
          value={stats?.assignedSections?.length ?? 0}
          icon={<MdClass />}
          color="blue"
        />
      </div>

      {/* My Assigned Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
            My Courses
          </h2>
          <button
            onClick={() => navigate('/attendance')}
            className="flex items-center gap-1 text-sm text-indigo-600
              hover:text-indigo-700 font-medium">
            Take Attendance <MdArrowForward size={16} />
          </button>
        </div>

        {assignedCourses.length === 0 ? (
          <div className="text-center py-8">
            <MdBook size={36} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">
              No courses assigned yet. Contact your administrator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assignedCourses.map((assignment) => (
              <div key={assignment.id}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl
                  border border-gray-100 dark:border-gray-600">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
                      {assignment.Course?.code} — {assignment.Course?.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {assignment.Batch?.name &&
                        `Batch ${assignment.Batch.year}`}
                      {assignment.Section?.name &&
                        ` · ${assignment.Section.name}`}
                      {assignment.Semester?.name &&
                        ` · ${assignment.Semester.name}`}
                    </p>
                    <p className="text-xs text-indigo-500 mt-1">
                      {assignment.Course?.creditHour} credit hours
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/attendance')}
                    className="text-xs px-3 py-1.5 bg-indigo-600
                      hover:bg-indigo-700 text-white rounded-lg
                      transition-colors shrink-0 ml-2">
                    Attend
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assigned Sections */}
      {stats?.assignedSections?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-700
            dark:text-gray-200 mb-4">
            My Sections
          </h2>
          <div className="space-y-2">
            {stats.assignedSections.map((section) => (
              <div key={section.id} className="flex items-center
                justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700
                    dark:text-gray-200">
                    {section.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {section.department}
                    {section.academicYear && ` · ${section.academicYear}`}
                    {section.semester && ` · ${section.semester}`}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm
                  text-indigo-600 font-medium">
                  <MdPeople size={16} /> {section.studentCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Attendance */}
      {stats?.recentAttendance?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-700
            dark:text-gray-200 mb-4">
            Recent Attendance Records
          </h2>
          <div className="space-y-2">
            {stats.recentAttendance.map((a) => (
              <div key={a.id} className="flex items-center justify-between
                p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100
                    dark:bg-indigo-900/30 flex items-center justify-center
                    text-xs font-bold text-indigo-600">
                    {a.Student?.User?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700
                      dark:text-gray-200">
                      {a.Student?.User?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.Course?.name} · {formatDate(a.date)}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${ATTENDANCE_STATUS_COLORS[a.status]}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;