import { useTheme } from '../../context/ThemeContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import { MdLightMode, MdDarkMode } from 'react-icons/md';

function Settings() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-2xl">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
          Appearance
        </h2>

        <div className="flex items-center justify-between py-3 border-b
          border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Dark Mode
            </p>
            <p className="text-xs text-gray-400">Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors
              ${isDark ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white
              transition-transform shadow
              ${isDark ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => !isDark && toggleTheme()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
              border transition-colors
              ${isDark
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                : 'border-gray-200 dark:border-gray-600 text-gray-500'
              }`}
          >
            <MdDarkMode size={18} /> Dark
          </button>
          <button
            onClick={() => isDark && toggleTheme()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
              border transition-colors
              ${!isDark
                ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                : 'border-gray-200 dark:border-gray-600 text-gray-400'
              }`}
          >
            <MdLightMode size={18} /> Light
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;