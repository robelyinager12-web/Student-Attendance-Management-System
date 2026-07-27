import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdDashboard, MdPeople, MdSchool, MdClass,
  MdLibraryBooks, MdAssignment, MdBarChart,
  MdNotifications, MdPerson, MdSettings,
  MdGroup, MdCalendarMonth, MdBook,
  MdHistory, MdSecurity, MdLogout,
} from 'react-icons/md';

const adminLinks = [
  { to: '/home', label: 'Dashboard', icon: <MdDashboard size={18} /> },

  { type: 'divider', label: 'PEOPLE' },
  { to: '/students',  label: 'Students',  icon: <MdPeople size={18} /> },
  { to: '/teachers',  label: 'Teachers',  icon: <MdSchool size={18} /> },

  { type: 'divider', label: 'ACADEMIC' },
  { to: '/departments', label: 'Departments',    icon: <MdLibraryBooks size={18} /> },
  { to: '/programs',    label: 'Programs',       icon: <MdBook size={18} /> },
  { to: '/batches',     label: 'Batches',        icon: <MdGroup size={18} /> },
  { to: '/academic',    label: 'Academic Years', icon: <MdCalendarMonth size={18} /> },
  { to: '/sections',    label: 'Sections',       icon: <MdClass size={18} /> },
  { to: '/courses',     label: 'Courses',        icon: <MdAssignment size={18} /> },

  { type: 'divider', label: 'ASSIGNMENTS' },
  { to: '/course-assignments', label: 'Course Assignments', icon: <MdAssignment size={18} /> },
  { to: '/enrollments',        label: 'Enrollments',        icon: <MdBook size={18} /> },

  { type: 'divider', label: 'ATTENDANCE' },
  { to: '/attendance',         label: 'Take Attendance',    icon: <MdAssignment size={18} /> },
  { to: '/attendance/history', label: 'Attendance History', icon: <MdHistory size={18} /> },

  { type: 'divider', label: 'REPORTS' },
  { to: '/reports',    label: 'Reports',    icon: <MdBarChart size={18} /> },
  { to: '/audit-logs', label: 'Audit Logs', icon: <MdSecurity size={18} /> },

  { type: 'divider', label: 'ACCOUNT' },
  { to: '/notifications', label: 'Notifications', icon: <MdNotifications size={18} /> },
  { to: '/profile',       label: 'Profile',       icon: <MdPerson size={18} /> },
  { to: '/settings',      label: 'Settings',      icon: <MdSettings size={18} /> },
];

const teacherLinks = [
  { to: '/home',               label: 'Dashboard',          icon: <MdDashboard size={18} /> },
  { type: 'divider', label: 'ATTENDANCE' },
  { to: '/attendance',         label: 'Take Attendance',    icon: <MdAssignment size={18} /> },
  { to: '/attendance/history', label: 'Attendance History', icon: <MdHistory size={18} /> },
  { type: 'divider', label: 'STUDENTS' },
  { to: '/students',           label: 'My Students',        icon: <MdPeople size={18} /> },
  { to: '/reports',            label: 'Reports',            icon: <MdBarChart size={18} /> },
  { type: 'divider', label: 'ACCOUNT' },
  { to: '/notifications',      label: 'Notifications',      icon: <MdNotifications size={18} /> },
  { to: '/profile',            label: 'Profile',            icon: <MdPerson size={18} /> },
];

const studentLinks = [
  { to: '/home',               label: 'Dashboard',     icon: <MdDashboard size={18} /> },
  { type: 'divider', label: 'MY ATTENDANCE' },
  { to: '/attendance/history', label: 'My Attendance', icon: <MdHistory size={18} /> },
  { type: 'divider', label: 'ACCOUNT' },
  { to: '/notifications',      label: 'Notifications', icon: <MdNotifications size={18} /> },
  { to: '/profile',            label: 'Profile',       icon: <MdPerson size={18} /> },
];

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const links =
    user?.role === 'ADMIN'   ? adminLinks   :
    user?.role === 'TEACHER' ? teacherLinks :
    studentLinks;

  const roleLabel =
    user?.role === 'ADMIN'   ? 'Administrator' :
    user?.role === 'TEACHER' ? 'Teacher' : 'Student';

  const roleBadgeColor =
    user?.role === 'ADMIN'   ? 'bg-purple-500' :
    user?.role === 'TEACHER' ? 'bg-blue-500'   : 'bg-green-500';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen w-64 z-40
        flex flex-col
        bg-[#1a237e] text-white
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>

        {/* ── Logo ── */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400
            to-indigo-500 flex items-center justify-center text-xl shrink-0 shadow-lg">
            📚
          </div>
          <div>
            <p className="font-extrabold text-white text-[15px] leading-tight tracking-wide">
              SAMS
            </p>
            <p className="text-indigo-300 text-[10px] leading-tight">
              Injibara University
            </p>
          </div>
        </div>

        {/* ── User profile strip ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0">
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center
            justify-center text-sm font-bold shrink-0 shadow">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {user?.name}
            </p>
            <span className={`inline-block text-[9px] font-bold px-2 py-0.5
              rounded-full text-white mt-0.5 ${roleBadgeColor}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {links.map((link, i) => {
            if (link.type === 'divider') {
              return (
                <p key={`div-${i}`}
                  className="text-[9px] font-bold text-indigo-400 uppercase
                    tracking-[0.12em] px-3 pt-4 pb-1 select-none">
                  {link.label}
                </p>
              );
            }

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/home'}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-xl text-[13px]
                  font-medium transition-all duration-150 mb-0.5
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/60'
                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <span className="shrink-0 opacity-90">{link.icon}</span>
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* ── Logout button ── */}
        <div className="shrink-0 px-3 py-3 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl
              text-[13px] font-medium text-red-300 hover:bg-red-500/20
              hover:text-red-200 transition-colors"
          >
            <MdLogout size={18} />
            <span>Logout</span>
          </button>
          <p className="text-[10px] text-indigo-500 text-center mt-2">
            SAMS v1.0 · College of Technology
          </p>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;