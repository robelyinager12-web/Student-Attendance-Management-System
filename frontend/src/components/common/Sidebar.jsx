import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdDashboard, MdPeople, MdSchool, MdClass,
  MdLibraryBooks, MdAssignment, MdBarChart,
  MdNotifications, MdPerson, MdSettings,
} from 'react-icons/md';

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <MdDashboard size={20} /> },
  { to: '/students', label: 'Students', icon: <MdPeople size={20} /> },
  { to: '/teachers', label: 'Teachers', icon: <MdSchool size={20} /> },
  { to: '/classes', label: 'Classes', icon: <MdClass size={20} /> },
  { to: '/departments', label: 'Departments', icon: <MdLibraryBooks size={20} /> },
  { to: '/courses', label: 'Courses', icon: <MdAssignment size={20} /> },
  { to: '/attendance', label: 'Attendance', icon: <MdAssignment size={20} /> },
  { to: '/reports', label: 'Reports', icon: <MdBarChart size={20} /> },
  { to: '/notifications', label: 'Notifications', icon: <MdNotifications size={20} /> },
  { to: '/profile', label: 'Profile', icon: <MdPerson size={20} /> },
  { to: '/settings', label: 'Settings', icon: <MdSettings size={20} /> },
];

const teacherLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <MdDashboard size={20} /> },
  { to: '/attendance', label: 'Attendance', icon: <MdAssignment size={20} /> },
  { to: '/students', label: 'Students', icon: <MdPeople size={20} /> },
  { to: '/reports', label: 'Reports', icon: <MdBarChart size={20} /> },
  { to: '/notifications', label: 'Notifications', icon: <MdNotifications size={20} /> },
  { to: '/profile', label: 'Profile', icon: <MdPerson size={20} /> },
];

const studentLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <MdDashboard size={20} /> },
  { to: '/attendance', label: 'My Attendance', icon: <MdAssignment size={20} /> },
  { to: '/notifications', label: 'Notifications', icon: <MdNotifications size={20} /> },
  { to: '/profile', label: 'Profile', icon: <MdPerson size={20} /> },
];

function Sidebar({ isOpen }) {
  const { user } = useAuth();

  const links =
    user?.role === 'ADMIN'
      ? adminLinks
      : user?.role === 'TEACHER'
      ? teacherLinks
      : studentLinks;

  return (
    <aside className={`fixed top-0 left-0 h-full w-64 bg-indigo-900 text-white
      z-40 transform transition-transform duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

      <div className="flex items-center justify-center h-16
        border-b border-indigo-700">
        <span className="text-xl font-bold tracking-wide">📚 SAMS</span>
      </div>

      <nav className="flex flex-col gap-1 p-4
        overflow-y-auto h-[calc(100vh-64px)]">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
              font-medium transition-colors
              ${isActive
                ? 'bg-indigo-600 text-white'
                : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;