import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMenu, MdLightMode, MdDarkMode, MdLogout, MdPerson } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16
      bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700
      flex items-center justify-between px-4 z-30 shadow-sm">

      <button
        onClick={onToggleSidebar}
        className="md:hidden p-2 rounded-lg text-gray-500
          hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <MdMenu size={24} />
      </button>

      <h1 className="text-base font-semibold text-gray-700
        dark:text-gray-200 hidden md:block">
        Student Attendance Management System
      </h1>

      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDark ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-2 rounded-lg
              hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center
              justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700
              dark:text-gray-200 hidden sm:block">
              {user?.name}
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800
              rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <button
                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm
                  text-gray-700 dark:text-gray-200 hover:bg-gray-100
                  dark:hover:bg-gray-700 rounded-t-xl"
              >
                <MdPerson size={18} /> My Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm
                  text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-b-xl"
              >
                <MdLogout size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;