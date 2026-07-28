import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboard.service';
import { courseAssignmentService } from '../../services/courseAssignment.service';
import { formatDate } from '../../utils/formatDate';
import {
  MdPeople, MdSchool, MdClass, MdAssignment,
  MdCheckCircle, MdWarning, MdBarChart,
  MdBook, MdArrowForward, MdNotifications,
  MdGroup, MdHistory, MdCalendarMonth,
  MdStar, MdLibraryBooks, MdTrendingUp,
  MdTrendingDown,
} from 'react-icons/md';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ── Stat card with gradient ──────────────────────────────────────────────────
function StatCard({ label, value, icon, gradient, subtitle, onClick, trend }) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl p-5 text-white overflow-hidden
        ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-100' : ''}
        transition-transform duration-200 shadow-lg`}
      style={{ background: gradient }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full
        bg-white/10 -translate-y-6 translate-x-6" />
      <div className="absolute bottom-0 right-8 w-12 h-12 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center
            justify-center text-xl shadow-inner">
            {icon}
          </div>
          {trend !== undefined && (
            <span className="flex items-center gap-0.5 text-xs font-semibold
              bg-white/20 px-2 py-0.5 rounded-full">
              {trend >= 0
                ? <MdTrendingUp size={12} />
                : <MdTrendingDown size={12} />
              }
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-3xl font-extrabold text-white leading-none">
          {value ?? '—'}
        </p>
        {subtitle && (
          <p className="text-white/60 text-xs mt-1.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function Greeting({ name, role }) {
  const hour = new Date().getHours();
  const time  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const emoji = hour < 12 ? '☀️' : hour < 17 ? '⛅' : '🌙';
  const roleLabel =
    role === 'ADMIN'   ? 'Administrator' :
    role === 'TEACHER' ? 'Teacher' : 'Student';

  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
          {emoji} {time}, {name?.split(' ')[0]}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Logged in as{' '}
          <span className={`font-bold px-2 py-0.5 rounded-full text-xs
            ${role === 'ADMIN'   ? 'bg-purple-100 text-purple-700' :
              role === 'TEACHER' ? 'bg-blue-100   text-blue-700'   :
                                   'bg-green-100  text-green-700'}`}>
            {roleLabel}
          </span>
          &nbsp;·&nbsp;
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ title, linkLabel, linkTo, navigate }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-gray-700 dark:text-gray-200
        flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block" />
        {title}
      </h2>
      {linkLabel && (
        <button onClick={() => navigate(linkTo)}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600
            hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5
            rounded-full transition-colors">
          {linkLabel} <MdArrowForward size={13} />
        </button>
      )}
    </div>
  );
}

const STATUS_BADGE = {
  PRESENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ABSENT:  'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400',
  LATE:    'bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400',
  EXCUSED: 'bg-sky-100     text-sky-700     dark:bg-sky-900/30     dark:text-sky-400',
};

const PIE_COLORS = ['#6366f1','#06b6d4','#10b981','#f43f5e','#f59e0b','#a855f7'];

// ══════════════════════════════════════════════════════════
// ADMIN HOME
// ══════════════════════════════════════════════════════════
function AdminHome({ user }) {
  const navigate = useNavigate();
  const [stats,      setStats]   = useState(null);
  const [weekly,     setWeekly]  = useState([]);
  const [deptData,   setDept]    = useState([]);
  const [lowAttend,  setLow]     = useState([]);
  const [recentAct,  setRecent]  = useState([]);
  const [batchStats, setBatch]   = useState([]);
  const [loading,    setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getAdminStats(),
      dashboardService.getWeeklyChart(),
      dashboardService.getDepartmentStats(),
      dashboardService.getLowAttendance(75),
      dashboardService.getRecentActivity(),
      dashboardService.getBatchStats(),
    ]).then(([s, w, d, la, ra, b]) => {
      setStats(s.data.data);
      setWeekly(w.data.data);
      setDept(d.data.data);
      setLow(la.data.data);
      setRecent(ra.data.data);
      setBatch(b.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent
        rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    {
      label: 'Total Students',
      value: stats?.totalStudents,
      icon: <MdPeople />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      onClick: () => navigate('/students'),
    },
    {
      label: 'Total Teachers',
      value: stats?.totalTeachers,
      icon: <MdSchool />,
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      onClick: () => navigate('/teachers'),
    },
    {
      label: 'Active Batches',
      value: stats?.totalBatches,
      icon: <MdGroup />,
      gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
      onClick: () => navigate('/batches'),
    },
    {
      label: 'Departments',
      value: stats?.totalDepartments,
      icon: <MdLibraryBooks />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      onClick: () => navigate('/departments'),
    },
    {
      label: 'Total Courses',
      value: stats?.totalCourses,
      icon: <MdBook />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      onClick: () => navigate('/courses'),
    },
    {
      label: 'Total Sections',
      value: stats?.totalSections,
      icon: <MdClass />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      onClick: () => navigate('/sections'),
    },
    {
      label: "Today's Attendance",
      value: `${stats?.attendancePercentage ?? 0}%`,
      icon: <MdCheckCircle />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      subtitle: `${stats?.presentToday ?? 0} present · ${stats?.absentToday ?? 0} absent · ${stats?.lateToday ?? 0} late`,
    },
    {
      label: 'At-Risk Students',
      value: lowAttend.length,
      icon: <MdWarning />,
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
      subtitle: 'Below 75% attendance',
      onClick: () => navigate('/reports'),
    },
  ];

  const quickActions = [
    { label: 'Add Student',     path: '/students/new',       icon: '👤', bg: 'from-indigo-500 to-indigo-600' },
    { label: 'Add Teacher',     path: '/teachers/new',       icon: '🎓', bg: 'from-cyan-500 to-cyan-600' },
    { label: 'Assign Course',   path: '/course-assignments', icon: '📋', bg: 'from-purple-500 to-purple-600' },
    { label: 'Take Attendance', path: '/attendance',         icon: '✅', bg: 'from-emerald-500 to-emerald-600' },
    { label: 'Import Students', path: '/students/import',    icon: '📥', bg: 'from-amber-500 to-amber-600' },
    { label: 'View Reports',    path: '/reports',            icon: '📊', bg: 'from-rose-500 to-rose-600' },
    { label: 'Sections',        path: '/sections',           icon: '🏫', bg: 'from-blue-500 to-blue-600' },
    { label: 'Audit Logs',      path: '/audit-logs',         icon: '🔍', bg: 'from-slate-500 to-slate-600' },
  ];

  return (
    <div className="space-y-7">
      <Greeting name={user.name} role="ADMIN" />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border
        border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <SectionTitle title="Quick Actions" navigate={navigate} />
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {quickActions.map((a) => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-2 group">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.bg}
                flex items-center justify-center text-xl shadow-md
                group-hover:scale-110 group-hover:shadow-lg transition-all duration-200`}>
                {a.icon}
              </div>
              <span className="text-[10px] font-semibold text-gray-600
                dark:text-gray-400 text-center leading-tight">
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weekly area chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <SectionTitle title="Weekly Attendance Overview" navigate={navigate} />
          {weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={weekly} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="PRESENT" stroke="#6366f1"
                  fill="url(#gPresent)" strokeWidth={2.5} name="Present" dot={{ r: 3 }} />
                <Area type="monotone" dataKey="ABSENT"  stroke="#f43f5e"
                  fill="url(#gAbsent)"  strokeWidth={2.5} name="Absent"  dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-gray-400">
              <MdBarChart size={48} className="mb-2 opacity-30" />
              <p className="text-sm">No attendance data yet</p>
              <button onClick={() => navigate('/attendance')}
                className="mt-2 text-xs text-indigo-600 underline font-medium">
                Start taking attendance
              </button>
            </div>
          )}
        </div>

        {/* Department pie */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <SectionTitle title="Students by Dept." navigate={navigate} />
          {deptData.filter(d => d.studentCount > 0).length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={deptData.filter(d => d.studentCount > 0)}
                    dataKey="studentCount" nameKey="department"
                    cx="50%" cy="50%" outerRadius={72} innerRadius={42}
                    paddingAngle={3}
                  >
                    {deptData.filter(d => d.studentCount > 0).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} students`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-1">
                {deptData.filter(d => d.studentCount > 0).slice(0, 4).map((d, i) => (
                  <div key={d.department} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-gray-600 dark:text-gray-300
                        truncate max-w-[110px]">
                        {d.department}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200
                      bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {d.studentCount}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-gray-400">
              <MdGroup size={40} className="mb-2 opacity-30" />
              <p className="text-sm">No students added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Active batches */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <SectionTitle title="Active Batches" linkLabel="View all"
            linkTo="/batches" navigate={navigate} />
          {batchStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <MdGroup size={40} className="opacity-30 mb-2" />
              <p className="text-sm">No batches yet</p>
              <button onClick={() => navigate('/batches')}
                className="mt-2 text-xs text-indigo-600 underline font-medium">
                Add batches
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {batchStats.slice(0, 4).map((b, i) => {
                const colors = ['bg-indigo-500','bg-cyan-500','bg-purple-500','bg-emerald-500'];
                return (
                  <div key={b.id} className="flex items-center gap-3 p-3
                    bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100
                    dark:hover:bg-gray-700 transition-colors">
                    <div className={`w-10 h-10 rounded-xl ${colors[i % colors.length]}
                      flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {b.year?.toString().slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700
                        dark:text-gray-200 truncate">{b.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {b.department} · {b.currentYear}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-indigo-600
                      bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full shrink-0">
                      {b.studentCount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <SectionTitle title="Recent Attendance" linkLabel="Full history"
            linkTo="/attendance/history" navigate={navigate} />
          {recentAct.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <MdCheckCircle size={40} className="opacity-30 mb-2" />
              <p className="text-sm">No records yet</p>
              <button onClick={() => navigate('/attendance')}
                className="mt-2 text-xs text-indigo-600 underline font-medium">
                Take attendance
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAct.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between
                  p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl
                  transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br
                      from-indigo-400 to-indigo-600 flex items-center justify-center
                      text-white text-xs font-bold shrink-0">
                      {a.studentName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700
                        dark:text-gray-200 leading-tight">
                        {a.studentName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {a.course ?? 'General'} · {a.date}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                    ${STATUS_BADGE[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── At-risk students ── */}
      {lowAttend.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-red-200 dark:border-red-900/40 p-6 shadow-sm">
          <SectionTitle title="⚠️ At-Risk Students (Below 75%)"
            linkLabel="Full reports" linkTo="/reports" navigate={navigate} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowAttend.slice(0, 6).map((s) => {
              const pct = parseFloat(s.attendancePercentage);
              const barColor = pct < 50 ? '#f43f5e' : '#f59e0b';
              return (
                <div key={s.id} className="p-4 bg-red-50 dark:bg-red-900/20
                  rounded-xl border border-red-100 dark:border-red-900/30">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {s.studentCode} · {s.department}
                      </p>
                    </div>
                    <span className="text-lg font-extrabold"
                      style={{ color: barColor }}>
                      {s.attendancePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-red-200 dark:bg-red-900/40 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// TEACHER HOME
// ══════════════════════════════════════════════════════════
function TeacherHome({ user }) {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getTeacherStats(),
      courseAssignmentService.getMyCourses(),
    ]).then(([s, c]) => {
      setStats(s.data.data);
      setCourses(c.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent
        rounded-full animate-spin" />
    </div>
  );

  const courseGradients = [
    'linear-gradient(135deg,#6366f1,#4f46e5)',
    'linear-gradient(135deg,#06b6d4,#0891b2)',
    'linear-gradient(135deg,#a855f7,#7c3aed)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#f43f5e,#e11d48)',
  ];

  return (
    <div className="space-y-7">
      <Greeting name={user.name} role="TEACHER" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="My Courses"
          value={courses.length}
          icon={<MdBook />}
          gradient="linear-gradient(135deg,#6366f1,#4f46e5)"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          label="Today's Records"
          value={stats?.attendanceTakenToday ?? 0}
          icon={<MdCheckCircle />}
          gradient="linear-gradient(135deg,#10b981,#059669)"
          subtitle="Submitted today"
        />
        <StatCard
          label="My Sections"
          value={stats?.assignedSections?.length ?? 0}
          icon={<MdClass />}
          gradient="linear-gradient(135deg,#06b6d4,#0891b2)"
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border
        border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <SectionTitle title="Quick Actions" navigate={navigate} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Take Attendance',    path: '/attendance',         icon: '✅', bg: 'from-emerald-500 to-emerald-600' },
            { label: 'Attendance History', path: '/attendance/history', icon: '📅', bg: 'from-blue-500 to-blue-600' },
            { label: 'My Students',        path: '/students',           icon: '👥', bg: 'from-indigo-500 to-indigo-600' },
            { label: 'View Reports',       path: '/reports',            icon: '📊', bg: 'from-purple-500 to-purple-600' },
          ].map((a) => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-2 group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.bg}
                flex items-center justify-center text-2xl shadow-md
                group-hover:scale-110 group-hover:shadow-lg transition-all duration-200`}>
                {a.icon}
              </div>
              <span className="text-xs font-semibold text-gray-600
                dark:text-gray-400 text-center">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Assigned courses */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border
        border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <SectionTitle title="My Assigned Courses" linkLabel="Take attendance"
          linkTo="/attendance" navigate={navigate} />
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700
              flex items-center justify-center text-3xl mx-auto mb-3">📚</div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              No courses assigned yet
            </p>
            <p className="text-xs text-gray-400 mt-1">Contact your administrator</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((a, i) => (
              <div key={a.id} className="rounded-2xl overflow-hidden shadow-md
                hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                {/* Colorful header */}
                <div className="p-4 text-white"
                  style={{ background: courseGradients[i % courseGradients.length] }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center
                      justify-center font-bold text-sm">
                      {a.Course?.code?.substring(0, 2)}
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-0.5
                      rounded-full font-semibold">Active</span>
                  </div>
                  <p className="font-bold text-sm leading-tight">{a.Course?.name}</p>
                  <p className="text-white/70 text-xs mt-0.5">
                    {a.Course?.code} · {a.Course?.creditHour} credits
                  </p>
                </div>
                {/* White card body */}
                <div className="bg-white dark:bg-gray-800 p-4">
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {a.Batch?.name && (
                      <span className="text-xs bg-indigo-50 dark:bg-indigo-900/20
                        text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                        {a.Batch.name}
                      </span>
                    )}
                    {a.Section?.name && (
                      <span className="text-xs bg-cyan-50 dark:bg-cyan-900/20
                        text-cyan-600 px-2 py-0.5 rounded-full font-medium">
                        {a.Section.name}
                      </span>
                    )}
                    {a.Semester?.name && (
                      <span className="text-xs bg-purple-50 dark:bg-purple-900/20
                        text-purple-600 px-2 py-0.5 rounded-full font-medium">
                        {a.Semester.name}
                      </span>
                    )}
                  </div>
                  <button onClick={() => navigate('/attendance')}
                    className="w-full py-2 text-xs font-bold rounded-xl
                      text-white transition-all"
                    style={{ background: courseGradients[i % courseGradients.length] }}>
                    Mark Attendance →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent records */}
      {stats?.recentAttendance?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <SectionTitle title="Recent Attendance Records"
            linkLabel="Full history" linkTo="/attendance/history" navigate={navigate} />
          <div className="space-y-2">
            {stats.recentAttendance.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center justify-between
                p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br
                    from-indigo-400 to-indigo-600 flex items-center justify-center
                    text-white text-xs font-bold shrink-0">
                    {a.Student?.User?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {a.Student?.User?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.Course?.name} · {a.date}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold
                  ${STATUS_BADGE[a.status]}`}>
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

// ══════════════════════════════════════════════════════════
// STUDENT HOME
// ══════════════════════════════════════════════════════════
function StudentHome({ user }) {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStudentStats()
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent
        rounded-full animate-spin" />
    </div>
  );

  const pct   = parseFloat(stats?.attendancePercentage ?? 0);
  const circ  = 2 * Math.PI * 42;
  const dash  = ((100 - pct) / 100) * circ;
  const color = pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="space-y-7">
      <Greeting name={user.name} role="STUDENT" />

      {/* Hero banner */}
      <div className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#6366f1 0%,#06b6d4 100%)' }}>
        {/* Decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full
          bg-white/10 -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-32 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center
            justify-center text-3xl font-bold shrink-0 shadow-lg">
            {user.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-extrabold truncate">{user.name}</p>
            <p className="text-indigo-200 text-sm mt-0.5 truncate">
              {[stats?.department, stats?.batch, stats?.academicYear, stats?.semester]
                .filter(Boolean).join(' · ')}
            </p>
            {stats?.section && (
              <span className="inline-block text-xs bg-white/20 px-3 py-0.5
                rounded-full mt-1.5 font-medium">
                Section: {stats.section}
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-4xl font-black">{pct.toFixed(0)}%</p>
            <p className="text-indigo-200 text-xs mt-0.5">Attendance Rate</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Classes" value={stats?.totalDays ?? 0}
          icon={<MdCalendarMonth />}
          gradient="linear-gradient(135deg,#6366f1,#4f46e5)" />
        <StatCard label="Present" value={stats?.presentDays ?? 0}
          icon={<MdCheckCircle />}
          gradient="linear-gradient(135deg,#10b981,#059669)" />
        <StatCard label="Absent" value={stats?.absentDays ?? 0}
          icon={<MdWarning />}
          gradient="linear-gradient(135deg,#f43f5e,#e11d48)" />
        <StatCard label="Late" value={stats?.lateDays ?? 0}
          icon={<MdStar />}
          gradient="linear-gradient(135deg,#f59e0b,#d97706)" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Circular meter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-6 shadow-sm flex flex-col items-center">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">
            Overall Attendance
          </p>

          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 100 100">
              {/* Track */}
              <circle cx="50" cy="50" r="42" fill="none"
                stroke="#f1f5f9" strokeWidth="10"/>
              {/* Progress */}
              <circle cx="50" cy="50" r="42" fill="none"
                stroke={color} strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dash}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
              />
              {/* Center text */}
              <text x="50" y="45" textAnchor="middle"
                fontSize="18" fontWeight="800" fill={color}>
                {pct.toFixed(0)}%
              </text>
              <text x="50" y="58" textAnchor="middle" fontSize="7" fill="#94a3b8">
                ATTENDANCE
              </text>
            </svg>
          </div>

          <div className={`mt-4 flex items-center gap-2 text-sm font-bold
            px-5 py-2 rounded-full
            ${pct >= 75
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {pct >= 75 ? '✅ Good Standing' : '⚠️ Below Required 75%'}
          </div>

          {/* Mini bar breakdown */}
          <div className="mt-4 w-full space-y-2">
            {[
              { label: 'Present', value: stats?.presentDays ?? 0, total: stats?.totalDays || 1, color: '#10b981' },
              { label: 'Absent',  value: stats?.absentDays  ?? 0, total: stats?.totalDays || 1, color: '#f43f5e' },
              { label: 'Late',    value: stats?.lateDays    ?? 0, total: stats?.totalDays || 1, color: '#f59e0b' },
            ].map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 dark:text-gray-400">{b.label}</span>
                  <span className="font-bold" style={{ color: b.color }}>{b.value}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full"
                    style={{
                      width: `${(b.value / b.total) * 100}%`,
                      background: b.color,
                      transition: 'width 1s ease',
                    }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-5
            flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block" />
            Quick Actions
          </p>
          <div className="space-y-3">
            {[
              {
                label: 'View Attendance History',
                icon: '📅', path: '/attendance/history',
                gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)',
              },
              {
                label: 'My Notifications',
                icon: '🔔', path: '/notifications',
                gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)',
              },
              {
                label: 'My Profile',
                icon: '👤', path: '/profile',
                gradient: 'linear-gradient(135deg,#10b981,#059669)',
              },
            ].map((a) => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="flex items-center gap-4 w-full p-3.5 rounded-xl
                  hover:scale-[1.02] transition-all duration-200 text-white shadow-md"
                style={{ background: a.gradient }}>
                <span className="text-2xl w-8 text-center">{a.icon}</span>
                <span className="text-sm font-semibold flex-1 text-left">{a.label}</span>
                <MdArrowForward size={18} className="opacity-70" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent attendance table */}
      {stats?.calendar?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <SectionTitle title="Recent Attendance Records"
            linkLabel="View all" linkTo="/attendance/history" navigate={navigate} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {stats.calendar.slice(0, 8).map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-2.5 text-gray-700 dark:text-gray-300 font-medium">
                      {formatDate(r.date)}
                    </td>
                    <td className="py-2.5 text-gray-500 dark:text-gray-400">
                      {r.course ?? '—'}
                    </td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                        ${STATUS_BADGE[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════
function HomePage() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'ADMIN')   return <AdminHome   user={user} />;
  if (user.role === 'TEACHER') return <TeacherHome user={user} />;
  if (user.role === 'STUDENT') return <StudentHome user={user} />;
  return null;
}

export default HomePage;