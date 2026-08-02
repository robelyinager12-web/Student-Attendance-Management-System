import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboard.service';
import { courseAssignmentService } from '../../services/courseAssignment.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  MdPeople, MdSchool, MdClass, MdAssignment,
  MdCheckCircle, MdWarning, MdBarChart,
  MdBook, MdArrowForward, MdNotifications,
  MdGroup, MdHistory, MdCalendarMonth,
  MdStar, MdLibraryBooks,
} from 'react-icons/md';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, Legend, ReferenceLine,
} from 'recharts';

const PIE_COLORS  = ['#6366f1','#06b6d4','#10b981','#f43f5e','#f59e0b','#a855f7'];
const STATUS_BADGE = {
  PRESENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ABSENT:  'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400',
  LATE:    'bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400',
  EXCUSED: 'bg-sky-100     text-sky-700     dark:bg-sky-900/30     dark:text-sky-400',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return dateStr; }
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
      <h2 className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
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

// ══ ADMIN HOME ═══════════════════════════════════════════════════════════════
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

  const statCards = [
    { label: 'Total Students',    value: stats?.totalStudents ?? 0,    icon: <MdPeople size={20} />,      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',  border: 'border-indigo-100 dark:border-indigo-900/30',  valueColor: 'text-indigo-700 dark:text-indigo-400',  trend: '+5%', trendUp: true, onClick: () => navigate('/students') },
    { label: 'Total Teachers',    value: stats?.totalTeachers ?? 0,    icon: <MdSchool size={20} />,      iconBg: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600',           border: 'border-sky-100 dark:border-sky-900/30',        valueColor: 'text-sky-700 dark:text-sky-400',        trend: '+2%', trendUp: true, onClick: () => navigate('/teachers') },
    { label: 'Active Batches',    value: stats?.totalBatches ?? 0,     icon: <MdGroup size={20} />,       iconBg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600',  border: 'border-violet-100 dark:border-violet-900/30',  valueColor: 'text-violet-700 dark:text-violet-400',  onClick: () => navigate('/batches') },
    { label: 'Departments',       value: stats?.totalDepartments ?? 0, icon: <MdLibraryBooks size={20} />,iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',border: 'border-emerald-100 dark:border-emerald-900/30', valueColor: 'text-emerald-700 dark:text-emerald-400', onClick: () => navigate('/departments') },
    { label: 'Total Courses',     value: stats?.totalCourses ?? 0,     icon: <MdBook size={20} />,        iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',     border: 'border-amber-100 dark:border-amber-900/30',    valueColor: 'text-amber-700 dark:text-amber-400',    onClick: () => navigate('/courses') },
    { label: 'Total Sections',    value: stats?.totalSections ?? 0,    icon: <MdClass size={20} />,       iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',        border: 'border-blue-100 dark:border-blue-900/30',      valueColor: 'text-blue-700 dark:text-blue-400',      onClick: () => navigate('/sections') },
    { label: "Today's Attendance",value: `${stats?.attendancePercentage ?? 0}%`, icon: <MdCheckCircle size={20} />, iconBg: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600', border: 'border-teal-100 dark:border-teal-900/30', valueColor: 'text-teal-700 dark:text-teal-400', sub: `${stats?.presentToday ?? 0} present · ${stats?.absentToday ?? 0} absent` },
    { label: 'At-Risk Students',  value: lowAttend.length,             icon: <MdWarning size={20} />,     iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-500',           border: 'border-red-100 dark:border-red-900/30',        valueColor: 'text-red-600 dark:text-red-400',        sub: 'Below 75% attendance', onClick: () => navigate('/reports') },
  ];

  const quickActions = [
    { label: 'Add Student',     path: '/students/new',       icon: '👤', bg: 'bg-indigo-50  dark:bg-indigo-900/20  text-indigo-600  hover:bg-indigo-100' },
    { label: 'Add Teacher',     path: '/teachers/new',       icon: '🎓', bg: 'bg-sky-50     dark:bg-sky-900/20     text-sky-600     hover:bg-sky-100' },
    { label: 'Assign Course',   path: '/course-assignments', icon: '📋', bg: 'bg-violet-50  dark:bg-violet-900/20  text-violet-600  hover:bg-violet-100' },
    { label: 'Take Attendance', path: '/attendance',         icon: '✅', bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100' },
    { label: 'Import Students', path: '/students/import',    icon: '📥', bg: 'bg-amber-50   dark:bg-amber-900/20   text-amber-600   hover:bg-amber-100' },
    { label: 'View Reports',    path: '/reports',            icon: '📊', bg: 'bg-rose-50    dark:bg-rose-900/20    text-rose-600    hover:bg-rose-100' },
    { label: 'Sections',        path: '/sections',           icon: '🏫', bg: 'bg-teal-50    dark:bg-teal-900/20    text-teal-600    hover:bg-teal-100' },
    { label: 'Audit Logs',      path: '/audit-logs',         icon: '🔍', bg: 'bg-slate-50   dark:bg-slate-900/20   text-slate-600   hover:bg-slate-100' },
  ];

  const present    = stats?.presentToday ?? 0;
  const absent     = stats?.absentToday  ?? 0;
  const late       = stats?.lateToday    ?? 0;
  const totalToday = present + absent + late;
  const pct        = totalToday > 0 ? Math.round((present / totalToday) * 100) : 0;
  const circ       = 2 * Math.PI * 38;
  const pctColor   = pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#f43f5e';

  const atRiskChartData = lowAttend.slice(0, 10).map(s => ({
    id:   s.studentCode?.split(/[-/]/).pop() || s.studentCode,
    pct:  parseFloat(s.attendancePercentage),
    full: s.studentCode,
  }));

  const presentCount = recentAct.filter(a => a.status === 'PRESENT').length;
  const absentCount  = recentAct.filter(a => a.status === 'ABSENT').length;
  const lateCount    = recentAct.filter(a => a.status === 'LATE').length;
  const excusedCount = recentAct.filter(a => a.status === 'EXCUSED').length;
  const totalRecent  = recentAct.length;

  const recentBarData = [
    { label: 'Present', count: presentCount, color: '#10b981' },
    { label: 'Absent',  count: absentCount,  color: '#f43f5e' },
    { label: 'Late',    count: lateCount,     color: '#f59e0b' },
    { label: 'Excused', count: excusedCount,  color: '#06b6d4' },
  ];

  return (
    <div className="space-y-6">
      <Greeting name={user.name} role="ADMIN" />

      {/* Stat cards */}
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
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight truncate">{c.label}</p>
              <p className={`text-2xl font-extrabold leading-tight mt-0.5 ${c.valueColor}`}>{c.value}</p>
              {c.sub   && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{c.sub}</p>}
              {c.trend && <span className={`text-[10px] font-bold mt-0.5 inline-block ${c.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>{c.trendUp ? '↑' : '↓'} {c.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
        <SectionTitle title="Quick Actions" navigate={navigate} />
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {quickActions.map((a) => (
            <button key={a.label} onClick={() => navigate(a.path)} className="flex flex-col items-center gap-2 group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-200 ${a.bg}`}>{a.icon}</div>
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly area chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
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
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl mb-3">📊</div>
              <p className="text-sm text-gray-400 font-medium">No attendance data yet</p>
              <button onClick={() => navigate('/attendance')} className="mt-2 text-xs text-indigo-600 underline font-semibold">Start taking attendance</button>
            </div>
          )}
        </div>

        {/* Today's donut */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm flex flex-col">
          <SectionTitle title="Today's Snapshot" navigate={navigate} />
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="relative mb-4">
              <svg width="110" height="110" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f3f4f6" strokeWidth="12"/>
                <circle cx="50" cy="50" r="38" fill="none" stroke={pctColor} strokeWidth="12"
                  strokeLinecap="round" strokeDasharray={circ}
                  strokeDashoffset={((100 - pct) / 100) * circ}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="800" fill={pctColor}>{pct}%</text>
                <text x="50" y="58" textAnchor="middle" fontSize="6" fill="#94a3b8" fontWeight="600">ATTENDANCE</text>
              </svg>
            </div>
            <div className="w-full space-y-2.5">
              {[
                { label: 'Present', value: present, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { label: 'Absent',  value: absent,  color: '#f43f5e', bg: 'bg-red-50    dark:bg-red-900/20' },
                { label: 'Late',    value: late,     color: '#f59e0b', bg: 'bg-amber-50  dark:bg-amber-900/20' },
              ].map(b => (
                <div key={b.label} className={`flex items-center justify-between px-3 py-2 rounded-xl ${b.bg}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{b.label}</span>
                  </div>
                  <span className="text-sm font-extrabold" style={{ color: b.color }}>{b.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 font-medium">{totalToday} total records today</p>
          </div>
        </div>
      </div>

      {/* Bottom row — both charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Attendance bar chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <SectionTitle title="Recent Attendance Summary" linkLabel="Full history" linkTo="/attendance/history" navigate={navigate} />
          {totalRecent === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <svg width="180" height="110" viewBox="0 0 180 110" className="mb-3 opacity-60">
                <rect x="10" y="10" width="160" height="80" rx="8" fill="#EEF2FF"/>
                <rect x="20" y="20" width="140" height="50" rx="4" fill="#C7D2FE"/>
                <text x="90" y="50" textAnchor="middle" fontSize="9" fill="#4F46E5" fontWeight="600">NO DATA YET</text>
                {[30,55,80,105,130].map((x, i) => (
                  <g key={i}>
                    <rect x={x-8} y="70" width="16" height="16" rx="3" fill="#6366f1" opacity="0.5"/>
                    <circle cx={x} cy="65" r="6" fill="#818CF8"/>
                  </g>
                ))}
              </svg>
              <p className="text-sm text-gray-400 font-medium">No attendance data yet</p>
              <button onClick={() => navigate('/attendance')} className="mt-2 text-xs text-indigo-600 underline font-semibold">Take attendance now</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-gray-400 font-medium">Latest session breakdown</p>
                  <p className="text-xs font-bold text-gray-500">{totalRecent} records</p>
                </div>
                <div className="flex h-5 rounded-xl overflow-hidden gap-0.5">
                  {recentBarData.map(b => b.count > 0 && (
                    <div key={b.label} className="transition-all duration-700"
                      style={{ width: `${(b.count / totalRecent) * 100}%`, background: b.color }}
                      title={`${b.label}: ${b.count}`} />
                  ))}
                </div>
                <div className="flex gap-4 mt-2 flex-wrap">
                  {recentBarData.map(b => (
                    <div key={b.label} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                      <span className="text-xs text-gray-500 font-medium">{b.label}: <span className="font-bold text-gray-700 dark:text-gray-200">{b.count}</span></span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={recentBarData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: 12 }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="count" name="Students" radius={[8, 8, 0, 0]} maxBarSize={56}>
                    {recentBarData.map((b, i) => <Cell key={i} fill={b.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Attendance Rate (latest)</span>
                <span className={`text-sm font-extrabold ${presentCount / totalRecent >= 0.75 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {totalRecent > 0 ? ((presentCount / totalRecent) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* At-Risk horizontal bar chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <SectionTitle title="At-Risk Students (Below 75%)" linkLabel="Full reports" linkTo="/reports" navigate={navigate} />
          {lowAttend.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6">
              <svg width="160" height="110" viewBox="0 0 160 110" className="mb-4">
                <circle cx="80" cy="55" r="45" fill="#ECFDF5"/>
                <circle cx="80" cy="55" r="30" fill="#10b981" opacity="0.15"/>
                <circle cx="80" cy="55" r="22" fill="#10b981" opacity="0.25"/>
                <circle cx="80" cy="55" r="16" fill="#10b981"/>
                <path d="M70 55 L77 62 L92 47" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                {[20,42,118,140].map((x, i) => (
                  <g key={i}>
                    <circle cx={x} cy="90" r="7" fill="#6EE7B7" opacity="0.6"/>
                    <rect x={x-5} y="97" width="10" height="10" rx="2" fill="#A7F3D0" opacity="0.6"/>
                  </g>
                ))}
              </svg>
              <p className="text-sm font-bold text-emerald-600 mb-1">All students in good standing!</p>
              <p className="text-xs text-gray-400 text-center max-w-[200px]">No students are below 75% attendance.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'At-Risk',       value: lowAttend.length, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
                  { label: 'Critical <40%', value: lowAttend.filter(s => parseFloat(s.attendancePercentage) < 40).length, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
                  { label: 'Avg Rate',      value: lowAttend.length > 0 ? `${(lowAttend.reduce((s, x) => s + parseFloat(x.attendancePercentage), 0) / lowAttend.length).toFixed(1)}%` : '0%', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                ].map(c => (
                  <div key={c.label} className={`text-center p-2 rounded-xl ${c.color}`}>
                    <p className="text-lg font-extrabold">{c.value}</p>
                    <p className="text-[9px] font-semibold uppercase tracking-wider opacity-80 leading-tight">{c.label}</p>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart layout="vertical" data={atRiskChartData} margin={{ top: 0, right: 40, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="id" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} width={65} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: 11 }} formatter={(value, name, props) => [`${value}%`, props.payload.full]} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <ReferenceLine x={75} stroke="#10b981" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: '75%', position: 'right', fontSize: 9, fill: '#10b981', fontWeight: 700 }} />
                  <Bar dataKey="pct" name="Attendance" radius={[0, 6, 6, 0]} maxBarSize={18}>
                    {atRiskChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.pct < 40 ? '#f43f5e' : entry.pct < 60 ? '#f97316' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-3 justify-center flex-wrap">
                {[
                  { label: '< 40% Critical', color: '#f43f5e' },
                  { label: '40–60% Warning', color: '#f97316' },
                  { label: '60–75% At-Risk', color: '#f59e0b' },
                  { label: '≥ 75% Safe',     color: '#10b981' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                    <span className="text-[10px] text-gray-500 font-medium">{l.label}</span>
                  </div>
                ))}
              </div>
              {lowAttend.length > 10 && (
                <button onClick={() => navigate('/reports')}
                  className="w-full py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50
                    dark:hover:bg-indigo-900/20 rounded-xl transition-colors border
                    border-indigo-100 dark:border-indigo-900/30">
                  View all {lowAttend.length} at-risk students in reports →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Department pie chart */}
      {deptData.filter(d => d.studentCount > 0).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <SectionTitle title="Students by Department" navigate={navigate} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={deptData.filter(d => d.studentCount > 0)} dataKey="studentCount" nameKey="department"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3}>
                  {deptData.filter(d => d.studentCount > 0).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} students`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {deptData.filter(d => d.studentCount > 0).map((d, i) => (
                <div key={d.department} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[160px]">{d.department}</span>
                  </div>
                  <span className="text-sm font-extrabold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-full">{d.studentCount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══ TEACHER HOME ══════════════════════════════════════════════════════════════
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
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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
    <div className="space-y-6">
      <Greeting name={user.name} role="TEACHER" />
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'My Courses',      value: courses.length,                       icon: <MdBook size={20} />,        iconBg: 'bg-indigo-100 text-indigo-600',  border: 'border-indigo-100',  valueColor: 'text-indigo-700', onClick: () => navigate('/attendance') },
          { label: "Today's Records", value: stats?.attendanceTakenToday ?? 0,     icon: <MdCheckCircle size={20} />, iconBg: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100', valueColor: 'text-emerald-700', sub: 'Submitted today' },
          { label: 'My Sections',     value: stats?.assignedSections?.length ?? 0, icon: <MdClass size={20} />,       iconBg: 'bg-sky-100 text-sky-600',         border: 'border-sky-100',     valueColor: 'text-sky-700' },
        ].map(c => (
          <div key={c.label} onClick={c.onClick}
            className={`bg-white dark:bg-gray-800 rounded-2xl border ${c.border} dark:border-gray-700 p-4 shadow-sm flex items-center gap-4 ${c.onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''} transition-all duration-200`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>{c.icon}</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{c.label}</p>
              <p className={`text-2xl font-extrabold ${c.valueColor}`}>{c.value}</p>
              {c.sub && <p className="text-[10px] text-gray-400">{c.sub}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
        <SectionTitle title="Quick Actions" navigate={navigate} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Take Attendance',    path: '/attendance',         icon: '✅', bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100' },
            { label: 'Attendance History', path: '/attendance/history', icon: '📅', bg: 'bg-blue-50    dark:bg-blue-900/20    text-blue-600    hover:bg-blue-100' },
            { label: 'My Students',        path: '/students',           icon: '👥', bg: 'bg-indigo-50  dark:bg-indigo-900/20  text-indigo-600  hover:bg-indigo-100' },
            { label: 'View Reports',       path: '/reports',            icon: '📊', bg: 'bg-purple-50  dark:bg-purple-900/20  text-purple-600  hover:bg-purple-100' },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.path)} className="flex flex-col items-center gap-2 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-200 ${a.bg}`}>{a.icon}</div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
        <SectionTitle title="My Assigned Courses" linkLabel="Take attendance" linkTo="/attendance" navigate={navigate} />
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl mx-auto mb-3">📚</div>
            <p className="text-sm font-semibold text-gray-500">No courses assigned yet</p>
            <p className="text-xs text-gray-400 mt-1">Contact your administrator</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((a, i) => (
              <div key={a.id} className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                <div className="p-4 text-white" style={{ background: courseGradients[i % courseGradients.length] }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">{a.Course?.code?.substring(0, 2)}</div>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">Active</span>
                  </div>
                  <p className="font-bold text-sm leading-tight">{a.Course?.name}</p>
                  <p className="text-white/70 text-xs mt-0.5">{a.Course?.code} · {a.Course?.creditHour} credits</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4">
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {a.Batch?.name    && <span className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{a.Batch.name}</span>}
                    {a.Section?.name  && <span className="text-xs bg-cyan-50   dark:bg-cyan-900/20   text-cyan-600   px-2 py-0.5 rounded-full font-medium">{a.Section.name}</span>}
                    {a.Semester?.name && <span className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 px-2 py-0.5 rounded-full font-medium">{a.Semester.name}</span>}
                  </div>
                  <button onClick={() => navigate('/attendance')} className="w-full py-2 text-xs font-bold rounded-xl text-white transition-all" style={{ background: courseGradients[i % courseGradients.length] }}>Mark Attendance →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {stats?.recentAttendance?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <SectionTitle title="Recent Attendance Records" linkLabel="Full history" linkTo="/attendance/history" navigate={navigate} />
          <div className="space-y-2">
            {stats.recentAttendance.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{a.Student?.User?.name?.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{a.Student?.User?.name}</p>
                    <p className="text-xs text-gray-400">{a.Course?.name} · {a.date}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_BADGE[a.status]}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══ STUDENT HOME ══════════════════════════════════════════════════════════════
function StudentHome({ user }) {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStudentStats()
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pct   = parseFloat(stats?.attendancePercentage ?? 0);
  const circ  = 2 * Math.PI * 42;
  const dash  = ((100 - pct) / 100) * circ;
  const color = pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="space-y-6">
      <Greeting name={user.name} role="STUDENT" />
      <div className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#6366f1 0%,#06b6d4 100%)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-32 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold shrink-0 shadow-lg">{user.name?.charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-extrabold truncate">{user.name}</p>
            <p className="text-indigo-200 text-sm mt-0.5 truncate">{[stats?.department, stats?.batch, stats?.academicYear, stats?.semester].filter(Boolean).join(' · ')}</p>
            {stats?.section && <span className="inline-block text-xs bg-white/20 px-3 py-0.5 rounded-full mt-1.5 font-medium">Section: {stats.section}</span>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-4xl font-black">{pct.toFixed(0)}%</p>
            <p className="text-indigo-200 text-xs mt-0.5">Attendance Rate</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Classes', value: stats?.totalDays   ?? 0, icon: <MdCalendarMonth size={20} />, iconBg: 'bg-indigo-100 text-indigo-600',  border: 'border-indigo-100',  valueColor: 'text-indigo-700' },
          { label: 'Present',       value: stats?.presentDays ?? 0, icon: <MdCheckCircle size={20} />,   iconBg: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100', valueColor: 'text-emerald-700' },
          { label: 'Absent',        value: stats?.absentDays  ?? 0, icon: <MdWarning size={20} />,       iconBg: 'bg-red-100 text-red-500',         border: 'border-red-100',     valueColor: 'text-red-600' },
          { label: 'Late',          value: stats?.lateDays    ?? 0, icon: <MdStar size={20} />,          iconBg: 'bg-amber-100 text-amber-600',     border: 'border-amber-100',   valueColor: 'text-amber-700' },
        ].map(c => (
          <div key={c.label} className={`bg-white dark:bg-gray-800 rounded-2xl border ${c.border} dark:border-gray-700 p-4 shadow-sm flex items-center gap-4 transition-all`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>{c.icon}</div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{c.label}</p>
              <p className={`text-2xl font-extrabold ${c.valueColor}`}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm flex flex-col items-center">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Overall Attendance</p>
          <svg width="140" height="140" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash} transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
            <text x="50" y="45" textAnchor="middle" fontSize="18" fontWeight="800" fill={color}>{pct.toFixed(0)}%</text>
            <text x="50" y="58" textAnchor="middle" fontSize="7" fill="#94a3b8">ATTENDANCE</text>
          </svg>
          <div className={`mt-4 flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-full ${pct >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {pct >= 75 ? '✅ Good Standing' : '⚠️ Below Required 75%'}
          </div>
          <div className="mt-4 w-full space-y-2">
            {[
              { label: 'Present', value: stats?.presentDays ?? 0, total: stats?.totalDays || 1, color: '#10b981' },
              { label: 'Absent',  value: stats?.absentDays  ?? 0, total: stats?.totalDays || 1, color: '#f43f5e' },
              { label: 'Late',    value: stats?.lateDays    ?? 0, total: stats?.totalDays || 1, color: '#f59e0b' },
            ].map(b => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{b.label}</span>
                  <span className="font-bold" style={{ color: b.color }}>{b.value}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${(b.value / b.total) * 100}%`, background: b.color, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block" /> Quick Actions
          </p>
          <div className="space-y-3">
            {[
              { label: 'View Attendance History', icon: '📅', path: '/attendance/history', gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
              { label: 'My Notifications',        icon: '🔔', path: '/notifications',      gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
              { label: 'My Profile',              icon: '👤', path: '/profile',            gradient: 'linear-gradient(135deg,#10b981,#059669)' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="flex items-center gap-4 w-full p-3.5 rounded-xl hover:scale-[1.02] transition-all duration-200 text-white shadow-md"
                style={{ background: a.gradient }}>
                <span className="text-2xl w-8 text-center">{a.icon}</span>
                <span className="text-sm font-semibold flex-1 text-left">{a.label}</span>
                <MdArrowForward size={18} className="opacity-70" />
              </button>
            ))}
          </div>
        </div>
      </div>
      {stats?.calendar?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <SectionTitle title="Recent Attendance Records" linkLabel="View all" linkTo="/attendance/history" navigate={navigate} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {stats.calendar.slice(0, 8).map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-2.5 text-gray-700 dark:text-gray-300 font-medium">{formatDate(r.date)}</td>
                    <td className="py-2.5 text-gray-500 dark:text-gray-400">{r.course ?? '—'}</td>
                    <td className="py-2.5"><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_BADGE[r.status]}`}>{r.status}</span></td>
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

// ══ MAIN EXPORT ═══════════════════════════════════════════════════════════════
function HomePage() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  switch (user?.role) {
    case 'ADMIN':   return <AdminHome   user={user} />;
    case 'TEACHER': return <TeacherHome user={user} />;
    case 'STUDENT': return <StudentHome user={user} />;
    default:        return <StudentHome user={user} />;
  }
}

export default HomePage;