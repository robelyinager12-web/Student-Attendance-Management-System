import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';
import { useAuth } from '../../context/AuthContext';
import {
  MdPeople, MdSchool, MdGroup, MdLibraryBooks, MdBook,
  MdClass, MdCheckCircle, MdWarning,
} from 'react-icons/md';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// ── Shared palettes & helpers ─────────────────────────────────────────────────
const PIE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899'];

const STATUS_BADGE = {
  PRESENT: 'bg-emerald-100 text-emerald-700',
  ABSENT: 'bg-red-100 text-red-700',
  LATE: 'bg-amber-100 text-amber-700',
  EXCUSED: 'bg-blue-100 text-blue-700',
};

const STATUS_DOT_COLOR = {
  PRESENT: '#10b981',
  ABSENT: '#f43f5e',
  LATE: '#f59e0b',
  EXCUSED: '#06b6d4',
};

function Greeting({ name, role }) {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const roleLabel = role === 'ADMIN' ? 'Administrator' : role === 'TEACHER' ? 'Teacher' : 'Student';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white leading-tight">
          {part}, {name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome back to your {roleLabel} dashboard
        </p>
      </div>
      <div className="text-right text-sm text-gray-400">
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })}
      </div>
    </div>
  );
}

function SectionTitle({ title, linkLabel, linkTo, navigate }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
        {title}
      </h3>
      {linkLabel && linkTo && navigate && (
        <button
          onClick={() => navigate(linkTo)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700
            hover:underline transition-colors"
        >
          {linkLabel} →
        </button>
      )}
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Stat cards — clean minimal style ────────────────────────────────────────
  const statCards = [
    {
      label: 'Total Students',
      value: stats?.totalStudents ?? 0,
      icon: <MdPeople size={20} />,
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/30',
      valueColor: 'text-indigo-700 dark:text-indigo-400',
      trend: '+5%',
      trendUp: true,
      onClick: () => navigate('/students'),
    },
    {
      label: 'Total Teachers',
      value: stats?.totalTeachers ?? 0,
      icon: <MdSchool size={20} />,
      iconBg: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
      border: 'border-sky-100 dark:border-sky-900/30',
      valueColor: 'text-sky-700 dark:text-sky-400',
      trend: '+2%',
      trendUp: true,
      onClick: () => navigate('/teachers'),
    },
    {
      label: 'Active Batches',
      value: stats?.totalBatches ?? 0,
      icon: <MdGroup size={20} />,
      iconBg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
      border: 'border-violet-100 dark:border-violet-900/30',
      valueColor: 'text-violet-700 dark:text-violet-400',
      onClick: () => navigate('/batches'),
    },
    {
      label: 'Departments',
      value: stats?.totalDepartments ?? 0,
      icon: <MdLibraryBooks size={20} />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30',
      valueColor: 'text-emerald-700 dark:text-emerald-400',
      onClick: () => navigate('/departments'),
    },
    {
      label: 'Total Courses',
      value: stats?.totalCourses ?? 0,
      icon: <MdBook size={20} />,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30',
      valueColor: 'text-amber-700 dark:text-amber-400',
      onClick: () => navigate('/courses'),
    },
    {
      label: 'Total Sections',
      value: stats?.totalSections ?? 0,
      icon: <MdClass size={20} />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/30',
      valueColor: 'text-blue-700 dark:text-blue-400',
      onClick: () => navigate('/sections'),
    },
    {
      label: "Today's Attendance",
      value: `${stats?.attendancePercentage ?? 0}%`,
      icon: <MdCheckCircle size={20} />,
      iconBg: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
      border: 'border-teal-100 dark:border-teal-900/30',
      valueColor: 'text-teal-700 dark:text-teal-400',
      sub: `${stats?.presentToday ?? 0} present · ${stats?.absentToday ?? 0} absent`,
    },
    {
      label: 'At-Risk Students',
      value: lowAttend.length,
      icon: <MdWarning size={20} />,
      iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
      border: 'border-red-100 dark:border-red-900/30',
      valueColor: 'text-red-600 dark:text-red-400',
      sub: 'Below 75% attendance',
      onClick: () => navigate('/reports'),
    },
  ];

  const quickActions = [
    { label: 'Add Student',     path: '/students/new',       icon: '👤', bg: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 hover:bg-indigo-100' },
    { label: 'Add Teacher',     path: '/teachers/new',       icon: '🎓', bg: 'bg-sky-50    dark:bg-sky-900/20    text-sky-600    hover:bg-sky-100' },
    { label: 'Assign Course',   path: '/course-assignments', icon: '📋', bg: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 hover:bg-violet-100' },
    { label: 'Take Attendance', path: '/attendance',         icon: '✅', bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100' },
    { label: 'Import Students', path: '/students/import',    icon: '📥', bg: 'bg-amber-50  dark:bg-amber-900/20  text-amber-600  hover:bg-amber-100' },
    { label: 'View Reports',    path: '/reports',            icon: '📊', bg: 'bg-rose-50   dark:bg-rose-900/20   text-rose-600   hover:bg-rose-100' },
    { label: 'Sections',        path: '/sections',           icon: '🏫', bg: 'bg-teal-50   dark:bg-teal-900/20   text-teal-600   hover:bg-teal-100' },
    { label: 'Audit Logs',      path: '/audit-logs',         icon: '🔍', bg: 'bg-slate-50  dark:bg-slate-900/20  text-slate-600  hover:bg-slate-100' },
  ];

  // ── Attendance summary for donut ────────────────────────────────────────────
  const present = stats?.presentToday ?? 0;
  const absent  = stats?.absentToday  ?? 0;
  const late    = stats?.lateToday    ?? 0;
  const totalToday = present + absent + late;
  const pct     = totalToday > 0 ? Math.round((present / totalToday) * 100) : 0;
  const circ    = 2 * Math.PI * 38;
  const pctColor = pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="space-y-6">
      <Greeting name={user.name} role="ADMIN" />

      {/* ── Stat cards — clean minimal ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label}
            onClick={c.onClick}
            className={`bg-white dark:bg-gray-800 rounded-2xl border ${c.border}
              p-4 shadow-sm flex items-center gap-4
              ${c.onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
              transition-all duration-200`}>
            {/* Icon — small clean circle */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
              flex-shrink-0 ${c.iconBg}`}>
              {c.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400
                uppercase tracking-wider leading-tight truncate">
                {c.label}
              </p>
              <p className={`text-2xl font-extrabold leading-tight mt-0.5 ${c.valueColor}`}>
                {c.value}
              </p>
              {c.sub && (
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{c.sub}</p>
              )}
              {c.trend && (
                <span className={`text-[10px] font-bold mt-0.5 inline-block
                  ${c.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                  {c.trendUp ? '↑' : '↓'} {c.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
        dark:border-gray-700 p-5 shadow-sm">
        <SectionTitle title="Quick Actions" navigate={navigate} />
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {quickActions.map((a) => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-2 group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
                text-xl shadow-sm group-hover:scale-110 group-hover:shadow-md
                transition-all duration-200 ${a.bg}`}>
                {a.icon}
              </div>
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400
                text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Weekly area chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <SectionTitle title="Weekly Attendance Overview" navigate={navigate} />
          {weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weekly} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="PRESENT" stroke="#6366f1" fill="url(#gP)" strokeWidth={2.5} name="Present" dot={{ r: 3 }} />
                <Area type="monotone" dataKey="ABSENT"  stroke="#f43f5e" fill="url(#gA)" strokeWidth={2}   name="Absent"  dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-52">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700
                flex items-center justify-center text-3xl mb-3">📊</div>
              <p className="text-sm text-gray-400 font-medium">No attendance data yet</p>
              <button onClick={() => navigate('/attendance')}
                className="mt-2 text-xs text-indigo-600 underline font-semibold">
                Start taking attendance
              </button>
            </div>
          )}
        </div>

        {/* Today's attendance donut */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
          dark:border-gray-700 p-5 shadow-sm flex flex-col">
          <SectionTitle title="Today's Snapshot" navigate={navigate} />

          <div className="flex flex-col items-center justify-center flex-1">
            {/* Donut ring */}
            <div className="relative mb-4">
              <svg width="110" height="110" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f3f4f6" strokeWidth="12"/>
                <circle cx="50" cy="50" r="38" fill="none"
                  stroke={pctColor} strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={((100 - pct) / 100) * circ}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="800" fill={pctColor}>
                  {pct}%
                </text>
                <text x="50" y="58" textAnchor="middle" fontSize="6" fill="#94a3b8" fontWeight="600">
                  ATTENDANCE
                </text>
              </svg>
            </div>

            {/* Breakdown */}
            <div className="w-full space-y-2.5">
              {[
                { label: 'Present', value: present, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { label: 'Absent',  value: absent,  color: '#f43f5e', bg: 'bg-red-50 dark:bg-red-900/20' },
                { label: 'Late',    value: late,     color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              ].map(b => (
                <div key={b.label} className={`flex items-center justify-between
                  px-3 py-2 rounded-xl ${b.bg}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: b.color }} />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {b.label}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold" style={{ color: b.color }}>
                    {b.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-3 font-medium">
              {totalToday} total records today
            </p>
          </div>
        </div>
      </div>

      {/* ── Visual bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Department attendance bar chart (visual) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
          dark:border-gray-700 p-5 shadow-sm">
          <SectionTitle title="Recent Attendance Activity" linkLabel="Full history"
            linkTo="/attendance/history" navigate={navigate} />

          {recentAct.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              {/* SVG classroom illustration */}
              <svg width="180" height="120" viewBox="0 0 180 120" className="mb-4 opacity-60">
                <rect x="10" y="10" width="160" height="90" rx="8" fill="#EEF2FF"/>
                <rect x="20" y="20" width="140" height="55" rx="4" fill="#C7D2FE"/>
                {/* Whiteboard content */}
                <text x="90" y="52" textAnchor="middle" fontSize="9" fill="#4F46E5" fontWeight="600">ATTENDANCE</text>
                <line x1="35" y1="58" x2="145" y2="58" stroke="#A5B4FC" strokeWidth="1.5"/>
                {/* Students */}
                {[30,55,80,105,130].map((x, i) => (
                  <g key={i}>
                    <rect x={x-8} y="78" width="16" height="18" rx="3" fill="#6366f1" opacity="0.6"/>
                    <circle cx={x} cy="72" r="6" fill="#818CF8"/>
                  </g>
                ))}
                {/* Teacher desk */}
                <rect x="70" y="95" width="40" height="8" rx="2" fill="#4F46E5" opacity="0.4"/>
              </svg>
              <p className="text-sm text-gray-400 font-medium">No recent activity</p>
              <button onClick={() => navigate('/attendance')}
                className="mt-2 text-xs text-indigo-600 underline font-semibold">
                Take attendance now
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAct.slice(0, 5).map((a, i) => (
                <div key={a.id || i}
                  className="flex items-center justify-between p-3
                    hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400
                      to-indigo-600 flex items-center justify-center text-white text-xs
                      font-bold shrink-0">
                      {a.studentName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight">
                        {a.studentName}
                      </p>
                      <p className="text-xs text-gray-400">{a.course ?? 'General'} · {a.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold
                    ${STATUS_BADGE[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* At-risk students — visual card grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
          dark:border-gray-700 p-5 shadow-sm">
          <SectionTitle title="At-Risk Students (Below 75%)" linkLabel="Full reports"
            linkTo="/reports" navigate={navigate} />

          {lowAttend.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              {/* SVG success illustration */}
              <svg width="160" height="110" viewBox="0 0 160 110" className="mb-4">
                {/* Background circle */}
                <circle cx="80" cy="55" r="45" fill="#ECFDF5" />
                {/* Big checkmark */}
                <circle cx="80" cy="55" r="30" fill="#10b981" opacity="0.15"/>
                <circle cx="80" cy="55" r="22" fill="#10b981" opacity="0.25"/>
                <circle cx="80" cy="55" r="16" fill="#10b981"/>
                <path d="M70 55 L77 62 L92 47" stroke="white" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                {/* Students */}
                {[20,42,118,140].map((x, i) => (
                  <g key={i}>
                    <circle cx={x} cy="85" r="7" fill="#6EE7B7" opacity="0.6"/>
                    <rect x={x-6} y="92" width="12" height="12" rx="2" fill="#A7F3D0" opacity="0.6"/>
                  </g>
                ))}
                {/* Stars */}
                {[35,80,125].map((x, i) => (
                  <text key={i} x={x} y="25" fontSize="10" textAnchor="middle" opacity="0.5">⭐</text>
                ))}
              </svg>
              <p className="text-sm font-bold text-emerald-600 mb-1">
                All students in good standing!
              </p>
              <p className="text-xs text-gray-400 text-center max-w-[200px]">
                No students are currently below 75% attendance. Keep it up!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {lowAttend.slice(0, 8).map((s, i) => {
                const pct   = parseFloat(s.attendancePercentage);
                const color = pct < 40 ? '#f43f5e' : pct < 60 ? '#f97316' : '#f59e0b';
                const bgcl  = pct < 40
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
                  : pct < 60
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30';
                return (
                  <div key={s.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${bgcl}`}>
                    {/* Risk badge */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center
                      text-white text-xs font-extrabold flex-shrink-0"
                      style={{ background: color }}>
                      {pct.toFixed(0)}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {s.studentCode}
                        {s.department ? ` · ${s.department}` : ''}
                      </p>
                      {/* Progress bar */}
                      <div className="mt-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color }}>
                        {s.presentDays}/{s.totalDays}
                      </p>
                      <p className="text-[9px] text-gray-400">days</p>
                    </div>
                  </div>
                );
              })}
              {lowAttend.length > 8 && (
                <button onClick={() => navigate('/reports')}
                  className="w-full py-2 text-xs font-bold text-indigo-600
                    hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                  View {lowAttend.length - 8} more at-risk students →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Department pie chart ── */}
      {deptData.filter(d => d.studentCount > 0).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
          dark:border-gray-700 p-5 shadow-sm">
          <SectionTitle title="Students by Department" navigate={navigate} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={deptData.filter(d => d.studentCount > 0)}
                  dataKey="studentCount" nameKey="department"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3}>
                  {deptData.filter(d => d.studentCount > 0).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} students`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {deptData.filter(d => d.studentCount > 0).map((d, i) => (
                <div key={d.department} className="flex items-center justify-between
                  p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[160px]">
                      {d.department}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-gray-700 dark:text-gray-200
                    bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-full">
                    {d.studentCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Teacher home ──────────────────────────────────────────────────────────────
function TeacherHome({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getTeacherStats()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;

  const sections = stats?.assignedSections ?? [];
  const courses = stats?.recentAttendance ?? [];
  const quickActions = [
    { label: 'Take Attendance', path: '/attendance', icon: '✅', bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100' },
    { label: 'Attendance History', path: '/attendance/history', icon: '📜', bg: 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 hover:bg-sky-100' },
    { label: 'My Students', path: '/students', icon: '👨‍🎓', bg: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 hover:bg-indigo-100' },
    { label: 'Reports', path: '/reports', icon: '📊', bg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100' },
  ];

  const statCards = [
    { label: 'Assigned Sections', value: sections.length, icon: <MdClass size={20} />,
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/30', valueColor: 'text-indigo-700 dark:text-indigo-400',
      onClick: () => navigate('/attendance') },
    { label: 'Attendance Today', value: stats?.attendanceTakenToday ?? 0, icon: <MdCheckCircle size={20} />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30', valueColor: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Assigned Classes', value: stats?.assignedClasses?.length ?? 0, icon: <MdLibraryBooks size={20} />,
      iconBg: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
      border: 'border-sky-100 dark:border-sky-900/30', valueColor: 'text-sky-700 dark:text-sky-400' },
    { label: 'Recent Records', value: courses.length, icon: <MdBook size={20} />,
      iconBg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
      border: 'border-violet-100 dark:border-violet-900/30', valueColor: 'text-violet-700 dark:text-violet-400' },
  ];

  return (
    <div className="space-y-6">
      <Greeting name={user.name} role="TEACHER" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label} onClick={c.onClick}
            className={`bg-white dark:bg-gray-800 rounded-2xl border ${c.border}
              p-4 shadow-sm flex items-center gap-4
              ${c.onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
              transition-all duration-200`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
              {c.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight truncate">
                {c.label}
              </p>
              <p className={`text-2xl font-extrabold leading-tight mt-0.5 ${c.valueColor}`}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
        <SectionTitle title="Quick Actions" navigate={navigate} />
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-2 group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm
                group-hover:scale-110 group-hover:shadow-md transition-all duration-200 ${a.bg}`}>
                {a.icon}
              </div>
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 text-center leading-tight">
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Assigned sections */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
        <SectionTitle title="My Sections" linkLabel="Take attendance" linkTo="/attendance" navigate={navigate} />
        {sections.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No sections assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sections.map((s) => (
              <div key={s.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border
                border-gray-100 dark:border-gray-600">
                <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{s.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {s.department}{s.academicYear ? ` · ${s.academicYear}` : ''}{s.semester ? ` · ${s.semester}` : ''}
                </p>
                <p className="flex items-center gap-1 text-sm text-indigo-600 font-medium mt-2">
                  <MdPeople size={16} /> {s.studentCount} students
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent attendance */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
        <SectionTitle title="Recent Attendance Records" linkLabel="Full history" linkTo="/attendance/history" navigate={navigate} />
        {courses.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No recent attendance records.</p>
        ) : (
          <div className="space-y-2">
            {courses.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3
                hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600
                    flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {a.Student?.User?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight">
                      {a.Student?.User?.name}
                    </p>
                    <p className="text-xs text-gray-400">{a.Course?.name} · {a.date}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${STATUS_BADGE[a.status]}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Student home ──────────────────────────────────────────────────────────────
function StudentHome({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStudentStats()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;

  const present = parseInt(stats?.presentDays ?? 0, 10);
  const absent = parseInt(stats?.absentDays ?? 0, 10);
  const late = parseInt(stats?.lateDays ?? 0, 10);
  const excused = parseInt(stats?.excusedDays ?? 0, 10);
  const total = parseInt(stats?.totalDays ?? 0, 10);
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const circ = 2 * Math.PI * 38;
  const pctColor = pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#f43f5e';

  const statCards = [
    { label: 'Attendance Rate', value: `${stats?.attendancePercentage ?? 0}%`, icon: <MdCheckCircle size={20} />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30', valueColor: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Present Days', value: present, icon: <MdPeople size={20} />,
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/30', valueColor: 'text-indigo-700 dark:text-indigo-400' },
    { label: 'Absent Days', value: absent, icon: <MdWarning size={20} />,
      iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
      border: 'border-red-100 dark:border-red-900/30', valueColor: 'text-red-600 dark:text-red-400' },
    { label: 'Late Arrivals', value: late, icon: <MdSchool size={20} />,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30', valueColor: 'text-amber-700 dark:text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      <Greeting name={user.name} role="STUDENT" />

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative mx-auto sm:mx-0">
            <svg width="110" height="110" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#f3f4f6" strokeWidth="12"/>
              <circle cx="50" cy="50" r="38" fill="none"
                stroke={pctColor} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={((100 - pct) / 100) * circ}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
              <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="800" fill={pctColor}>{pct}%</text>
              <text x="50" y="58" textAnchor="middle" fontSize="6" fill="#94a3b8" fontWeight="600">ATTENDANCE</text>
            </svg>
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Student Code: <span className="text-gray-800 dark:text-gray-200 font-bold">{stats?.studentCode}</span>
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
              {stats?.department && <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700">{stats.department}</span>}
              {stats?.section && <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700">{stats.section}</span>}
              {stats?.batch && <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700">{stats.batch}</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { label: 'Present', value: present, color: '#10b981' },
                { label: 'Absent', value: absent, color: '#f43f5e' },
                { label: 'Late', value: late, color: '#f59e0b' },
                { label: 'Excused', value: excused, color: '#06b6d4' },
              ].map((b) => (
                <div key={b.label} className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-lg font-extrabold" style={{ color: b.color }}>{b.value}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label}
            className={`bg-white dark:bg-gray-800 rounded-2xl border ${c.border}
              p-4 shadow-sm flex items-center gap-4 transition-all duration-200`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
              {c.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight truncate">
                {c.label}
              </p>
              <p className={`text-2xl font-extrabold leading-tight mt-0.5 ${c.valueColor}`}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent attendance calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
        <SectionTitle title="Recent Attendance" linkLabel="Full history" linkTo="/attendance/history" navigate={navigate} />
        {!stats?.calendar || stats.calendar.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No attendance records yet.</p>
        ) : (
          <div className="space-y-2">
            {stats.calendar.slice(0, 8).map((rec, i) => (
              <div key={i} className="flex items-center justify-between p-3
                hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: STATUS_DOT_COLOR[rec.status] || '#94a3b8' }} />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{rec.course}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${STATUS_BADGE[rec.status]}`}>
                    {rec.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Role-based HomePage wrapper (default export) ──────────────────────────────
function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingBlock />;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <AdminHome user={user} />;
  if (user.role === 'TEACHER') return <TeacherHome user={user} />;
  return <StudentHome user={user} />;
}

export default HomePage;
