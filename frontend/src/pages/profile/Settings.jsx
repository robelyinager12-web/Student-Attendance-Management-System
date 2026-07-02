import { useTheme } from '../../context/ThemeContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import { MdLightMode, MdDarkMode } from 'react-icons/md';

function Settings() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-2xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings' },
      ]} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Settings
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6 space-y-6">

        <h2 className="text-base font-semibold text-gray-700
          dark:text-gray-200">
          Appearance
        </h2>

        {/* Toggle row */}
        <div className="flex items-center justify-between py-3 border-b
          border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Dark Mode
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Switch between light and dark theme
            </p>
          </div>

          {/* Toggle switch */}
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-colors
              duration-300 focus:outline-none
              ${isDark ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white
                shadow transition-transform duration-300
                ${isDark ? 'translate-x-8' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* Theme buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => isDark && toggleTheme()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg
              text-sm font-medium border transition-colors
              ${!isDark
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <MdLightMode size={18} /> Light
          </button>

          <button
            onClick={() => !isDark && toggleTheme()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg
              text-sm font-medium border transition-colors
              ${isDark
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <MdDarkMode size={18} /> Dark
          </button>
        </div>

        {/* Current status */}
        <p className="text-xs text-gray-400">
          Current theme: <span className="font-medium text-indigo-600">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Settings;