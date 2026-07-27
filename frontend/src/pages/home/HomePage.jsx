import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboard.service';
import { courseAssignmentService } from '../../services/courseAssignment.service';
import { formatDate, todayDateString } from '../../utils/formatDate';
import {
  MdPeople, MdSchool, MdClass, MdAssignment,
  MdCheckCircle, MdWarning, MdBarChart,
  MdBook, MdArrowForward, MdNotifications,
  MdTrendingUp, MdGroup, MdHistory,
  MdCalendarMonth, MdStar, MdLibraryBooks,
} from 'react-icons/md';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// ── Shared helpers ─────────────────────────────────────────────────────────

function Greeting({ name, role }) {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const roleLabel = role === 'ADMIN' ? 'Administrator' : role === 'TEACHER' ? 'Teacher' : 'Student';
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        {time}, {name?.split(' ')[0]}! 👋
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Logged in as <span className="font-semibold text-indigo-600">{roleLabel}</span>
        &nbsp;·&nbsp;
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })}
      </p>
    </div>
  );
}

function StatCard({ label, value, icon, color, subtitle, onClick }) {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
    green:  'bg-green-50  dark:bg-green-900/20  text-green-600  dark:text-green-400  border-green-100  dark:border-green-800',
    red:    'bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400    border-red-100    dark:border-red-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800',
    blue:   'bg-blue-50   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400   border-blue-100   dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
  };
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl border p-5
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${colors[color]?.split(' ').slice(-2).join(' ') || 'border-gray-100 dark:border-gray-700'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400
            uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value ?? '—'}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center
          text-xl ${colors[color]?.split(' ').slice(0, 2).join(' ')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, linkLabel, linkTo, navigate }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
        {title}
      </h2>
      {linkLabel && (
        <button
          onClick={() => navigate(linkTo)}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600
            hover:text-indigo-700 transition-colors"
        >
          {linkLabel} <MdArrowForward size={14} />
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ADMIN HOME PAGE
// ══════════════════════════════════════════════════════════
function AdminHome({ user }) {
  const navigate = useNavigate();
  const [stats, setStats]             = useState(null);
  const [weeklyData, setWeeklyData]   = useState([]);
  const [deptData, setDeptData]       = useState([]);
  const [lowAttend, setLowAttend]     = useState([]);
  const [recentAct, setRecentAct]     = useState([]);
  const [batchStats, setBatchStats]   = useState([]);
  const [loading, setLoading]         = useState(true);

  const PIE_COLORS = ['#4F46E5', '#06B6D4', '#34d399', '#f87171', '#f59e0b'];

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
      setWeeklyData(w.data.data);
      setDeptData(d.data.data);
      setLowAttend(la.data.data);
      setRecentAct(ra.data.data);
      setBatchStats(b.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { label: 'Add Student',        icon: <MdPeople size={20} />,       path: '/students/new',        color: 'indigo' },
    { label: 'Add Teacher',        icon: <MdSchool size={20} />,       path: '/teachers/new',        color: 'blue' },
    { label: 'Assign Course',      icon: <MdAssignment size={20} />,   path: '/course-assignments',  color: 'purple' },
    { label: 'Take Attendance',    icon: <MdCheckCircle size={20} />,  path: '/attendance',          color: 'green' },
    { label: 'Import Students',    icon: <MdGroup size={20} />,        path: '/students/import',     color: 'yellow' },
    { label: 'View Reports',       icon: <MdBarChart size={20} />,     path: '/reports',             color: 'red' },
    { label: 'Manage Sections',    icon: <MdClass size={20} />,        path: '/sections',            color: 'indigo' },
    { label: 'Audit Logs',         icon: <MdHistory size={20} />,      path: '/audit-logs',          color: 'blue' },
  ];

  const STATUS_COLORS = {
    PRESENT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ABSENT:  'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400',
    LATE:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    EXCUSED: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-500
        border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <Greeting name={user.name} role="ADMIN" />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students"  value={stats?.totalStudents}  icon={<MdPeople />}       color="indigo" onClick={() => navigate('/students')} />
        <StatCard label="Total Teachers"  value={stats?.totalTeachers}  icon={<MdSchool />}       color="blue"   onClick={() => navigate('/teachers')} />
        <StatCard label="Active Batches"  value={stats?.totalBatches}   icon={<MdGroup />}        color="purple" onClick={() => navigate('/batches')} />
        <StatCard label="Departments"     value={stats?.totalDepartments} icon={<MdLibraryBooks />} color="green"  onClick={() => navigate('/departments')} />
        <StatCard label="Courses"         value={stats?.totalCourses}   icon={<MdBook />}         color="yellow" onClick={() => navigate('/courses')} />
        <StatCard label="Sections"        value={stats?.totalSections}  icon={<MdClass />}        color="blue"   onClick={() => navigate('/sections')} />
        <StatCard
          label="Today's Attendance"
          value={`${stats?.attendancePercentage ?? 0}%`}
          icon={<MdCheckCircle />}
          color="green"
          subtitle={`${stats?.presentToday ?? 0} present · ${stats?.absentToday ?? 0} absent`}
        />
        <StatCard
          label="At-Risk Students"
          value={lowAttend.length}
          icon={<MdWarning />}
          color="red"
          subtitle="Below 75% attendance"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border
        border-gray-100 dark:border-gray-700 p-5">
        <SectionHeader title="Quick Actions" navigate={navigate} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((a) => {
            const colorMap = {
              indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40',
              blue:   'bg-blue-50   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400   hover:bg-blue-100   dark:hover:bg-blue-900/40',
              purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40',
              green:  'bg-green-50  dark:bg-green-900/20  text-green-600  dark:text-green-400  hover:bg-green-100  dark:hover:bg-green-900/40',
              yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40',
              red:    'bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400    hover:bg-red-100    dark:hover:bg-red-900/40',
            };
            return (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl
                  transition-colors text-sm font-semibold ${colorMap[a.color]}`}
              >
                {a.icon}
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly attendance chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-5">
          <SectionHeader title="Weekly Attendance Overview" navigate={navigate} />
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f87171" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="PRESENT" stroke="#4F46E5" fill="url(#presentGrad)" strokeWidth={2} name="Present" />
                <Area type="monotone" dataKey="ABSENT"  stroke="#f87171" fill="url(#absentGrad)"  strokeWidth={2} name="Absent" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm">
              No attendance data yet — start taking attendance to see trends
            </div>
          )}
        </div>

        {/* Department pie chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-5">
          <SectionHeader title="Students by Dept." navigate={navigate} />
          {deptData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={deptData} dataKey="studentCount" nameKey="department"
                    cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {deptData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} students`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {deptData.slice(0, 4).map((d, i) => (
                  <div key={d.department} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[100px]">
                        {d.department}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                      {d.studentCount}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm">
              No department data
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Active Batches */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-5">
          <SectionHeader title="Active Batches" linkLabel="View all" linkTo="/batches" navigate={navigate} />
          {batchStats.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No batches yet</p>
          ) : (
            <div className="space-y-2">
              {batchStats.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3
                  bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.department} · {b.currentYear}</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">
                    {b.studentCount} students
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-5">
          <SectionHeader title="Recent Attendance" linkLabel="Full history" linkTo="/attendance/history" navigate={navigate} />
          {recentAct.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recentAct.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between
                  p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30
                      flex items-center justify-center text-xs font-bold text-indigo-600">
                      {a.studentName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {a.studentName}
                      </p>
                      <p className="text-xs text-gray-400">{a.course ?? 'General'} · {a.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium
                    ${STATUS_COLORS[a.status]}`}>
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
          border-red-100 dark:border-red-900/30 p-5">
          <SectionHeader title="⚠️ At-Risk Students (Below 75%)" linkLabel="View reports" linkTo="/reports" navigate={navigate} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowAttend.slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3
                bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.studentCode} · {s.department}</p>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {s.attendancePercentage}%
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
// TEACHER HOME PAGE
// ══════════════════════════════════════════════════════════
function TeacherHome({ user }) {
  const navigate = useNavigate();
  const [stats, setStats]           = useState(null);
  const [courses, setCourses]       = useState([]);
  const [loading, setLoading]       = useState(true);

  const STATUS_COLORS = {
    PRESENT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ABSENT:  'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400',
    LATE:    'bg-yellow-100 text-yellow-700',
    EXCUSED: 'bg-blue-100  text-blue-700',
  };

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
      <div className="w-10 h-10 border-4 border-indigo-500
        border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <Greeting name={user.name} role="TEACHER" />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="My Courses"         value={courses.length}                    icon={<MdBook />}         color="indigo" onClick={() => navigate('/attendance')} />
        <StatCard label="Today's Attendance" value={stats?.attendanceTakenToday ?? 0} icon={<MdCheckCircle />}  color="green"  subtitle="Records submitted today" />
        <StatCard label="My Sections"        value={stats?.assignedSections?.length ?? 0} icon={<MdClass />}    color="blue"   />
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border
        border-gray-100 dark:border-gray-700 p-5">
        <SectionHeader title="Quick Actions" navigate={navigate} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Take Attendance',    path: '/attendance',          icon: <MdCheckCircle size={22} />, color: 'green' },
            { label: 'Attendance History', path: '/attendance/history',  icon: <MdHistory size={22} />,     color: 'blue' },
            { label: 'My Students',        path: '/students',            icon: <MdPeople size={22} />,      color: 'indigo' },
            { label: 'View Reports',       path: '/reports',             icon: <MdBarChart size={22} />,    color: 'purple' },
          ].map((a) => {
            const colorMap = {
              green:  'bg-green-50  dark:bg-green-900/20  text-green-600  dark:text-green-400  hover:bg-green-100',
              blue:   'bg-blue-50   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400   hover:bg-blue-100',
              indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100',
              purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100',
            };
            return (
              <button key={a.label} onClick={() => navigate(a.path)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl
                  transition-colors text-sm font-semibold ${colorMap[a.color]}`}>
                {a.icon}
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Assigned Courses ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border
        border-gray-100 dark:border-gray-700 p-5">
        <SectionHeader title="My Assigned Courses" linkLabel="Take attendance" linkTo="/attendance" navigate={navigate} />
        {courses.length === 0 ? (
          <div className="text-center py-10">
            <MdBook size={40} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-medium">No courses assigned yet</p>
            <p className="text-xs text-gray-400 mt-1">Contact your administrator to get courses assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((a) => (
              <div key={a.id} className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50
                dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border
                border-indigo-100 dark:border-indigo-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center
                    justify-center text-white font-bold text-sm">
                    {a.Course?.code?.substring(0, 2)}
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30
                    dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
                    Active
                  </span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">
                  {a.Course?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {a.Course?.code} · {a.Course?.creditHour} credit hrs
                </p>
                <div className="flex gap-1 flex-wrap mt-2">
                  {a.Batch?.name && (
                    <span className="text-xs bg-white dark:bg-gray-700 text-gray-600
                      dark:text-gray-300 px-2 py-0.5 rounded-full border border-gray-200
                      dark:border-gray-600">{a.Batch.name}</span>
                  )}
                  {a.Section?.name && (
                    <span className="text-xs bg-white dark:bg-gray-700 text-gray-600
                      dark:text-gray-300 px-2 py-0.5 rounded-full border border-gray-200
                      dark:border-gray-600">{a.Section.name}</span>
                  )}
                  {a.Semester?.name && (
                    <span className="text-xs bg-white dark:bg-gray-700 text-gray-600
                      dark:text-gray-300 px-2 py-0.5 rounded-full border border-gray-200
                      dark:border-gray-600">{a.Semester.name}</span>
                  )}
                </div>
                <button
                  onClick={() => navigate('/attendance')}
                  className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700
                    text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Mark Attendance
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── My Sections ── */}
      {stats?.assignedSections?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-5">
          <SectionHeader title="My Sections" navigate={navigate} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.assignedSections.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3
                bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{s.name}</p>
                  <p className="text-xs text-gray-400">
                    {s.department}{s.academicYear && ` · ${s.academicYear}`}{s.semester && ` · ${s.semester}`}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm font-bold text-indigo-600">
                  <MdPeople size={16} /> {s.studentCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Attendance ── */}
      {stats?.recentAttendance?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-5">
          <SectionHeader title="Recent Attendance Records" linkLabel="Full history" linkTo="/attendance/history" navigate={navigate} />
          <div className="space-y-2">
            {stats.recentAttendance.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center justify-between p-2
                hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30
                    flex items-center justify-center text-xs font-bold text-indigo-600">
                    {a.Student?.User?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {a.Student?.User?.name}
                    </p>
                    <p className="text-xs text-gray-400">{a.Course?.name} · {a.date}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${STATUS_COLORS[a.status]}`}>
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
// STUDENT HOME PAGE
// ══════════════════════════════════════════════════════════
function StudentHome({ user }) {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStudentStats()
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-500
        border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pct = parseFloat(stats?.attendancePercentage ?? 0);
  const circumference = 2 * Math.PI * 40;
  const strokeDash    = ((100 - pct) / 100) * circumference;
  const pctColor = pct >= 75 ? '#34d399' : pct >= 60 ? '#f59e0b' : '#f87171';

  const STATUS_COLORS = {
    PRESENT: 'bg-green-100 text-green-700',
    ABSENT:  'bg-red-100   text-red-700',
    LATE:    'bg-yellow-100 text-yellow-700',
    EXCUSED: 'bg-blue-100  text-blue-700',
  };

  return (
    <div className="space-y-6">
      <Greeting name={user.name} role="STUDENT" />

      {/* ── Profile summary card ── */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center
            justify-center text-2xl font-bold">
            {user.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">{user.name}</p>
            <p className="text-blue-100 text-sm mt-0.5">
              {stats?.department && `${stats.department} · `}
              {stats?.batch && `${stats.batch} · `}
              {stats?.academicYear && `${stats.academicYear} · `}
              {stats?.semester}
            </p>
            <p className="text-blue-200 text-xs mt-1">
              {stats?.section && `Section: ${stats.section}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black">{stats?.attendancePercentage ?? 0}%</p>
            <p className="text-blue-200 text-xs mt-0.5">Attendance Rate</p>
          </div>
        </div>
      </div>

      {/* ── Attendance stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Classes" value={stats?.totalDays ?? 0}   icon={<MdCalendarMonth />} color="indigo" />
        <StatCard label="Present"       value={stats?.presentDays ?? 0} icon={<MdCheckCircle />}   color="green"  />
        <StatCard label="Absent"        value={stats?.absentDays ?? 0}  icon={<MdWarning />}       color="red"    />
        <StatCard label="Late"          value={stats?.lateDays ?? 0}    icon={<MdStar />}          color="yellow" />
      </div>

      {/* ── Attendance meter + status message ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Circular meter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Overall Attendance
          </p>
          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10"/>
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke={pctColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDash}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <text x="50" y="46" textAnchor="middle" fontSize="16" fontWeight="800" fill={pctColor}>{pct.toFixed(0)}%</text>
            <text x="50" y="58" textAnchor="middle" fontSize="7" fill="#94a3b8">ATTENDANCE</text>
          </svg>
          <p className={`mt-4 text-sm font-semibold px-4 py-1.5 rounded-full
            ${pct >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {pct >= 75 ? '✅ Good Standing' : '⚠️ Below Required 75%'}
          </p>
        </div>

        {/* Quick actions -->  */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Quick Actions
          </p>
          <div className="space-y-3">
            {[
              { label: 'View My Attendance History', icon: <MdHistory size={18} />,     path: '/attendance/history', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' },
              { label: 'My Notifications',           icon: <MdNotifications size={18} />, path: '/notifications',      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
              { label: 'My Profile',                 icon: <MdPeople size={18} />,       path: '/profile',            color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
            ].map((a) => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl
                  text-sm font-medium transition-opacity hover:opacity-80 ${a.color}`}>
                {a.icon}
                {a.label}
                <MdArrowForward size={16} className="ml-auto" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent attendance history ── */}
      {stats?.calendar?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-5">
          <SectionHeader
            title="Recent Attendance Records"
            linkLabel="View all"
            linkTo="/attendance/history"
            navigate={navigate}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {stats.calendar.slice(0, 8).map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-2.5 text-gray-700 dark:text-gray-300">
                      {formatDate(r.date)}
                    </td>
                    <td className="py-2.5 text-gray-500 dark:text-gray-400">
                      {r.course ?? '—'}
                    </td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium
                        ${STATUS_COLORS[r.status]}`}>
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
// MAIN EXPORT — role router
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