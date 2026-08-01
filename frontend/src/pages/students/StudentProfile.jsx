import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { studentService } from '../../services/student.service';
import { attendanceService } from '../../services/attendance.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import AttendanceCalendar from '../../components/calendar/AttendanceCalendar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';
import { ATTENDANCE_STATUS_COLORS } from '../../utils/constants';

function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState({ records: [], summary: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const [s, a] = await Promise.all([
          studentService.getById(id),
          attendanceService.getByStudent(id),
        ]);
        setStudent(s.data.data);
        setAttendance(a.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen={false} />;
  if (!student) return <p className="text-gray-400">Student not found</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Students', href: '/students' },
        { label: student.User?.name },
      ]} />

      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6 flex gap-6">
        <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30
          flex items-center justify-center text-3xl font-bold
          text-indigo-600 shrink-0">
          {student.User?.name?.charAt(0)}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm flex-1">
          {[
            ['Student ID', student.studentCode],
            ['Name', student.User?.name],
            ['Email', student.User?.email],
            ['Phone', student.phone],
            ['Gender', student.gender],
            ['Date of Birth', formatDate(student.dateOfBirth)],
            ['Class', student.Class?.name],
            ['Department', student.Department?.name],
            ['Course', student.Course?.name],
            ['Status', student.status],
            ['Guardian', student.guardianName],
            ['Guardian Phone', student.guardianPhone],
            ['Admitted', formatDate(student.admissionDate)],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-gray-400 text-xs">{label}</p>
              <p className="text-gray-700 dark:text-gray-200 font-medium">
                {value ?? '—'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ['Total Days', attendance.summary?.total, 'indigo'],
          ['Present', attendance.summary?.present, 'green'],
          ['Absent', attendance.summary?.absent, 'red'],
          ['Attendance %', `${attendance.summary?.percentage}%`, 'blue'],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl
            border border-gray-100 dark:border-gray-700 p-4 text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {value ?? 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>

      <AttendanceCalendar records={attendance.records ?? []} />
    </div>
  );
}

export default StudentProfile;