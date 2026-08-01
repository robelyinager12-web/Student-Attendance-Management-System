import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import { settingsService } from '../../services/settings.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  MdLightMode, MdDarkMode, MdBusiness,
  MdPeople, MdInfo, MdEdit, MdSave,
  MdDelete, MdLock, MdToggleOn, MdToggleOff,
} from 'react-icons/md';

const TABS = [
  { key: 'appearance', label: 'Appearance', icon: <MdLightMode size={18} /> },
  { key: 'college', label: 'College Info', icon: <MdBusiness size={18} /> },
  { key: 'users', label: 'User Management', icon: <MdPeople size={18} /> },
  { key: 'system', label: 'System Info', icon: <MdInfo size={18} /> },
];

const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
  focus:ring-indigo-500`;

// ─── Appearance Tab ─────────────────────────────────────────────────────────
function AppearanceTab() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
        Appearance
      </h2>

      <div className="flex items-center justify-between py-4 border-b
        border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Dark Mode
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Switch between light and dark theme
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className={`relative w-14 h-7 rounded-full transition-colors
            duration-300 ${isDark ? 'bg-indigo-600' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white
            shadow transition-transform duration-300
            ${isDark ? 'translate-x-8' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => isDark && toggleTheme()}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg
            text-sm font-medium border transition-colors
            ${!isDark
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
            }`}
        >
          <MdLightMode size={18} /> Light Mode
        </button>
        <button
          onClick={() => !isDark && toggleTheme()}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg
            text-sm font-medium border transition-colors
            ${isDark
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
            }`}
        >
          <MdDarkMode size={18} /> Dark Mode
        </button>
      </div>
    </div>
  );
}

// ─── College Info Tab ────────────────────────────────────────────────────────
function CollegeTab() {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    settingsService.getCollegeInfo()
      .then((r) => { if (r.data.data) reset(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    try {
      await settingsService.updateCollegeInfo(data);
      toast.success('College info updated successfully');
    } catch (err) {
      toast.error('Failed to update college info');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="w-8 h-8 border-4 border-indigo-500
        border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
        College Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          ['College Name', 'name'],
          ['College Code', 'code'],
          ['Dean / Head', 'dean'],
          ['Email', 'email'],
          ['Phone', 'phone'],
          ['Address', 'address'],
        ].map(([label, name]) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700
              dark:text-gray-300 mb-1">{label}</label>
            <input {...register(name)} className={inputClass} />
          </div>
        ))}

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600
            hover:bg-indigo-700 text-white text-sm font-medium rounded-lg
            disabled:opacity-60">
          <MdSave size={18} />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

// ─── User Management Tab ─────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await settingsService.getUsers();
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id) {
    try {
      await settingsService.toggleUserStatus(id);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  }

  async function handleRoleChange(id, role) {
    try {
      await settingsService.changeUserRole(id, role);
      toast.success('Role updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  }

  async function handleResetPassword() {
    if (!newPassword || newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    try {
      await settingsService.resetUserPassword(resetModal.id, newPassword);
      toast.success('Password reset successfully');
      setResetModal(null);
      setNewPassword('');
    } catch (err) {
      toast.error('Failed to reset password');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await settingsService.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole ? u.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    TEACHER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    STUDENT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
        User Management ({users.length} users)
      </h2>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className={`${inputClass} max-w-xs`}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className={`${inputClass} w-auto`}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-indigo-500
            border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border
          border-gray-100 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b
                border-gray-100 dark:border-gray-700">
                {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs
                    font-semibold text-gray-500 dark:text-gray-400
                    uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50
                  dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100
                        dark:bg-indigo-900/30 flex items-center justify-center
                        text-xs font-bold text-indigo-600">
                        {user.name?.charAt(0)}
                      </div>
                      <span className="text-gray-700 dark:text-gray-200
                        font-medium">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium
                        border-0 cursor-pointer ${roleColors[user.role]}`}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="TEACHER">TEACHER</option>
                      <option value="STUDENT">STUDENT</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(user.id)}>
                      {user.isActive ? (
                        <span className="flex items-center gap-1 text-xs
                          text-green-600 font-medium">
                          <MdToggleOn size={20} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs
                          text-red-500 font-medium">
                          <MdToggleOff size={20} /> Disabled
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setResetModal(user)}
                        className="p-1.5 rounded-lg text-yellow-600
                          hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        title="Reset password"
                      >
                        <MdLock size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 rounded-lg text-red-500
                          hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete user"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setResetModal(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl
            shadow-xl p-6 w-full max-w-sm z-10">
            <h3 className="text-base font-semibold text-gray-700
              dark:text-gray-200 mb-4">
              Reset Password for {resetModal.name}
            </h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              className={inputClass}
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => { setResetModal(null); setNewPassword(''); }}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600
                  text-sm text-gray-600 dark:text-gray-300 rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700
                  text-white text-sm rounded-lg"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── System Info Tab ──────────────────────────────────────────────────────────
function SystemTab() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsService.getSystemInfo()
      .then((r) => setInfo(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="w-8 h-8 border-4 border-indigo-500
        border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const items = [
    ['Total Users', info?.totalUsers],
    ['Admins', info?.totalAdmins],
    ['Teachers', info?.totalTeachers],
    ['Students', info?.totalStudents],
    ['Node.js Version', info?.nodeVersion],
    ['Environment', info?.environment],
    ['Server Time', new Date(info?.serverTime).toLocaleString()],
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
        System Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(([label, value]) => (
          <div key={label} className="p-4 bg-gray-50 dark:bg-gray-700/50
            rounded-xl">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              {label}
            </p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1">
              {value ?? '—'}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
          Injibara University — College of Technology
        </p>
        <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
          Student Attendance Management System v1.0.0
        </p>
      </div>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
function Settings() {
  const [activeTab, setActiveTab] = useState('appearance');

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings' },
      ]} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Settings
      </h1>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50
        rounded-xl p-1 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
              font-medium transition-colors flex-1 justify-center
              ${activeTab === tab.key
                ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6">
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'college' && <CollegeTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'system' && <SystemTab />}
      </div>
    </div>
  );
}

export default Settings;