import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { studentService } from '../../services/student.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  MdPerson, MdEdit, MdArrowBack,
  MdSchool, MdEmail, MdBadge,
  MdCalendarMonth, MdClass,
} from 'react-icons/md';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getById(id)
      .then(r => setStudent(r.data.data))
      .catch(() => toast.error('Failed to load student'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!student) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">👤</div>
      <p className="text-gray-500 font-semibold text-lg">Student not found</p>
      <button onClick={() => navigate('/students')}
        className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
        Back to Students
      </button>
    </div>
  );

  const STATUS_COLORS = {
    ACTIVE:    'bg-emerald-100 text-emerald-700',
    INACTIVE:  'bg-gray-100    text-gray-600',
    GRADUATED: 'bg-blue-100    text-blue-700',
    SUSPENDED: 'bg-red-100     text-red-700',
  };

  const infoItems = [
    { icon: <MdBadge size={18} />,        label: 'Student ID',    value: student.studentCode },
    { icon: <MdEmail size={18} />,        label: 'Email',         value: student.User?.email },
    { icon: <MdSchool size={18} />,       label: 'Department',    value: student.Department?.name || '—' },
    { icon: <MdSchool size={18} />,       label: 'Program',       value: student.Program?.name  || '—' },
    { icon: <MdCalendarMonth size={18} />,label: 'Batch',         value: student.Batch?.name    || '—' },
    { icon: <MdCalendarMonth size={18} />,label: 'Academic Year', value: student.AcademicYear?.name || '—' },
    { icon: <MdCalendarMonth size={18} />,label: 'Semester',      value: student.Semester?.name || '—' },
    { icon: <MdClass size={18} />,        label: 'Section',       value: student.Section?.name  || '—' },
    { icon: <MdPerson size={18} />,       label: 'Gender',        value: student.gender         || '—' },
    { icon: <MdPerson size={18} />,       label: 'Status',
      value: (
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
          ${STATUS_COLORS[student.status] || STATUS_COLORS.INACTIVE}`}>
          {student.status}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/home' },
        { label: 'Students',  href: '/students' },
        { label: student.User?.name || 'Profile' },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-semibold">
          <MdArrowBack size={18} /> Back to Students
        </button>
        <button onClick={() => navigate(`/students/${id}/edit`)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
            text-white text-sm font-semibold rounded-xl shadow-md transition-colors">
          <MdEdit size={18} /> Edit Student
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
        dark:border-gray-700 shadow-sm overflow-hidden">

        {/* Top banner */}
        <div className="h-24 bg-gradient-to-r from-indigo-600 to-blue-500" />

        {/* Avatar + name */}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 mb-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400
              to-indigo-600 flex items-center justify-center text-white text-3xl
              font-extrabold border-4 border-white dark:border-gray-800 shadow-lg">
              {student.User?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="mb-1">
              <h1 className="text-xl font-extrabold text-gray-800 dark:text-white">
                {student.User?.name}
              </h1>
              <p className="text-sm text-gray-400">{student.studentCode}</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-gray-50
                dark:bg-gray-700/40 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30
                  flex items-center justify-center text-indigo-600 flex-shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase
                    tracking-wider">{item.label}</p>
                  <div className="text-sm font-semibold text-gray-700
                    dark:text-gray-200 mt-0.5 truncate">
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}