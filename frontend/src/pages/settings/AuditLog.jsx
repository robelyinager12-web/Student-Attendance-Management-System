import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { auditLogService } from '../../services/auditLog.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/formatDate';
import {
  MdSearch, MdRefresh, MdDelete,
  MdFilterList, MdInfo, MdClose,
  MdPerson, MdLogin, MdLogout,
  MdAdd, MdEdit, MdSecurity,
  MdDownload, MdUpload,
} from 'react-icons/md';

const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
  focus:ring-indigo-500 disabled:opacity-50`;

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LOGIN: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  LOGOUT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  IMPORT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  EXPORT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ATTENDANCE_MARK: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  ATTENDANCE_EDIT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const ACTION_ICONS = {
  CREATE: <MdAdd size={12} />,
  UPDATE: <MdEdit size={12} />,
  DELETE: <MdDelete size={12} />,
  LOGIN: <MdLogin size={12} />,
  LOGOUT: <MdLogout size={12} />,
  IMPORT: <MdUpload size={12} />,
  EXPORT: <MdDownload size={12} />,
  ATTENDANCE_MARK: <MdSecurity size={12} />,
  ATTENDANCE_EDIT: <MdEdit size={12} />,
};

const ENTITIES = [
  'User', 'Student', 'Teacher', 'Course',
  'CourseAssignment', 'StudentEnrollment',
  'Attendance', 'Department', 'Section',
  'Batch', 'AcademicYear', 'Semester',
];

const ACTIONS = [
  'CREATE', 'UPDATE', 'DELETE',
  'LOGIN', 'LOGOUT', 'IMPORT',
  'EXPORT', 'ATTENDANCE_MARK', 'ATTENDANCE_EDIT',
];

// ── Detail Modal ─────────────────────────────────────────────────────────────
function LogDetailModal({ log, onClose }) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl
        shadow-xl w-full max-w-lg z-10 max-h-[85vh] overflow-y-auto">

        <div className="flex items-center justify-between p-5 border-b
          border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
            Audit Log Detail
          </h3>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600
              hover:bg-gray-100 dark:hover:bg-gray-700">
            <MdClose size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Action', (
                <span className={`flex items-center gap-1 text-xs px-2 py-1
                  rounded-full font-medium w-fit
                  ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                  {ACTION_ICONS[log.action]} {log.action}
                </span>
              )],
              ['Entity', log.entity],
              ['Entity ID', log.entityId || '—'],
              ['User', log.User?.name || 'System'],
              ['Role', log.userRole || '—'],
              ['IP Address', log.ipAddress || '—'],
              ['Time', formatDateTime(log.createdAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  {label}
                </p>
                <div className="text-sm text-gray-700 dark:text-gray-200
                  font-medium">
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {log.description && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {log.description}
              </p>
            </div>
          )}

          {/* Old Values */}
          {log.oldValues && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                Before Change
              </p>
              <pre className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700
                dark:text-red-400 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(log.oldValues, null, 2)}
              </pre>
            </div>
          )}

          {/* New Values */}
          {log.newValues && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                After Change
              </p>
              <pre className="text-xs bg-green-50 dark:bg-green-900/20
                text-green-700 dark:text-green-400 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(log.newValues, null, 2)}
              </pre>
            </div>
          )}

          {/* User Agent */}
          {log.userAgent && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                User Agent
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400
                break-all">
                {log.userAgent}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [actionCounts, setActionCounts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearDate, setClearDate] = useState('');
  const [clearing, setClearing] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    from: '',
    to: '',
  });

  // Load stats on mount
  useEffect(() => {
    auditLogService.getStats()
      .then((r) => setStats(r.data.data))
      .catch(() => {});
  }, []);

  const fetchLogs = useCallback(async (currentPage = page) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 20 };
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      const res = await auditLogService.getAll(params);
      setLogs(res.data.data.logs);
      setPagination(res.data.data.pagination);
      setActionCounts(res.data.data.actionCounts);
      setSearched(true);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const handleSearch = () => {
    setPage(1);
    fetchLogs(1);
  };

  const handleReset = () => {
    setFilters({ action: '', entity: '', from: '', to: '' });
    setLogs([]);
    setPagination(null);
    setActionCounts([]);
    setSearched(false);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchLogs(newPage);
  };

  const handleClear = async () => {
    if (!clearDate) return toast.error('Please select a date');
    setClearing(true);
    try {
      const res = await auditLogService.clearOld(clearDate);
      toast.success(res.data.message);
      setShowClearModal(false);
      setClearDate('');
      handleSearch();
    } catch (err) {
      toast.error('Failed to clear logs');
    } finally {
      setClearing(false);
    }
  };

  const setQuickDate = (days) => {
    const today = new Date();
    const to = today.toISOString().split('T')[0];
    let from;
    if (days === 0) {
      from = to;
    } else {
      const d = new Date(today);
      d.setDate(d.getDate() - days);
      from = d.toISOString().split('T')[0];
    }
    setFilters((p) => ({ ...p, from, to }));
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings', href: '/settings' },
        { label: 'Audit Logs' },
      ]} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Audit Logs
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Track all system activity and changes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters((p) => !p)}
            className="flex items-center gap-2 px-3 py-2 border
              border-gray-200 dark:border-gray-600 text-gray-600
              dark:text-gray-300 text-sm font-medium rounded-lg
              hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <MdFilterList size={18} />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 px-3 py-2 border
              border-red-300 text-red-500 text-sm font-medium rounded-lg
              hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <MdDelete size={18} /> Clear Old Logs
          </button>
        </div>
      </div>

      {/* ── Stats cards ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Logs', value: stats.total, color: 'indigo' },
            { label: 'Today', value: stats.todayCount, color: 'green' },
            { label: 'Total Logins', value: stats.totalLogins, color: 'blue' },
            {
              label: 'Last Activity',
              value: stats.recentActivity?.[0]?.User?.name || '—',
              color: 'purple',
            },
          ].map(({ label, value, color }) => {
            const colors = {
              indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
              green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
              blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
              purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
            };
            return (
              <div key={label}
                className={`rounded-xl p-4 text-center ${colors[color]}`}>
                <p className="text-xl font-bold truncate">{value}</p>
                <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Filters ── */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            Filter Audit Logs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => setFilters((p) => ({ ...p, action: e.target.value }))}
                className={inputClass}
              >
                <option value="">All Actions</option>
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>{a.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Entity / Module
              </label>
              <select
                value={filters.entity}
                onChange={(e) => setFilters((p) => ({ ...p, entity: e.target.value }))}
                className={inputClass}
              >
                <option value="">All Entities</option>
                {ENTITIES.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Quick date buttons */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-gray-400">Quick:</span>
            {[
              { label: 'Today', days: 0 },
              { label: 'Last 7 days', days: 7 },
              { label: 'Last 30 days', days: 30 },
            ].map(({ label, days }) => (
              <button
                key={label}
                onClick={() => setQuickDate(days)}
                className="text-xs px-3 py-1.5 rounded-full border
                  border-gray-200 dark:border-gray-600 text-gray-600
                  dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Action count badges */}
          {actionCounts.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs text-gray-400 self-center">Results by action:</span>
              {actionCounts.map((ac) => (
                <span
                  key={ac.action}
                  className={`flex items-center gap-1 text-xs px-2 py-1
                    rounded-full font-medium
                    ${ACTION_COLORS[ac.action] || 'bg-gray-100 text-gray-700'}`}
                >
                  {ACTION_ICONS[ac.action]}
                  {ac.action} ({ac.count})
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-gray-100
            dark:border-gray-700">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600
                hover:bg-indigo-700 text-white text-sm font-medium
                rounded-lg disabled:opacity-60"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white
                    border-t-transparent rounded-full animate-spin" />
                : <MdSearch size={18} />
              }
              {loading ? 'Loading...' : 'Search'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 border
                border-gray-200 dark:border-gray-600 text-gray-600
                dark:text-gray-300 text-sm font-medium rounded-lg
                hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MdRefresh size={18} /> Reset
            </button>
          </div>
        </div>
      )}

      {/* ── Log Table ── */}
      {searched && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 overflow-hidden">

          <div className="p-4 border-b border-gray-100 dark:border-gray-700
            flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {pagination?.total ?? 0} log entries
            </p>
            {pagination && (
              <p className="text-xs text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-500
                border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16">
              <MdSecurity size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No audit logs found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Activity will appear here as users interact with the system
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b
                    border-gray-100 dark:border-gray-700">
                    {[
                      'Time', 'Action', 'Entity',
                      'User', 'Role', 'Description', 'Details',
                    ].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs
                        font-semibold text-gray-500 dark:text-gray-400
                        uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30
                        transition-colors">

                      <td className="px-4 py-3 text-xs text-gray-500
                        dark:text-gray-400 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs
                          px-2 py-1 rounded-full font-medium w-fit
                          ${ACTION_COLORS[log.action] ||
                            'bg-gray-100 text-gray-700'}`}>
                          {ACTION_ICONS[log.action]}
                          {log.action?.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-gray-700 dark:text-gray-200
                          text-xs font-medium whitespace-nowrap">
                          {log.entity}
                        </p>
                        {log.entityId && (
                          <p className="text-xs text-gray-400 truncate
                            max-w-[100px]" title={log.entityId}>
                            {log.entityId.substring(0, 8)}...
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100
                            dark:bg-indigo-900/30 flex items-center
                            justify-center shrink-0">
                            <MdPerson size={12} className="text-indigo-600" />
                          </div>
                          <p className="text-xs text-gray-700
                            dark:text-gray-200 whitespace-nowrap">
                            {log.User?.name || 'System'}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          font-medium
                          ${log.userRole === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : log.userRole === 'TEACHER'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                          {log.userRole || '—'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-500
                        dark:text-gray-400 max-w-[180px] truncate"
                        title={log.description}>
                        {log.description || '—'}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg text-indigo-600
                            hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                          title="View details"
                        >
                          <MdInfo size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-16 text-center">
          <MdSecurity size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Set filters and click Search to view audit logs
          </p>
          <button
            onClick={() => fetchLogs(1)}
            className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-medium rounded-lg"
          >
            Load All Recent Logs
          </button>
        </div>
      )}

      {/* ── Log Detail Modal ── */}
      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}

      {/* ── Clear Old Logs Modal ── */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center
          justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowClearModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl
            shadow-xl p-6 w-full max-w-sm z-10">

            <h3 className="text-base font-semibold text-gray-700
              dark:text-gray-200 mb-2">
              Clear Old Audit Logs
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              All logs before the selected date will be permanently deleted.
              This action cannot be undone.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">
                Delete logs before:
              </label>
              <input
                type="date"
                value={clearDate}
                onChange={(e) => setClearDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowClearModal(false); setClearDate(''); }}
                className="flex-1 py-2.5 border border-gray-200
                  dark:border-gray-600 text-sm text-gray-600
                  dark:text-gray-300 rounded-lg hover:bg-gray-100
                  dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                disabled={clearing || !clearDate}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700
                  text-white text-sm font-medium rounded-lg
                  disabled:opacity-60"
              >
                {clearing ? 'Deleting...' : 'Delete Logs'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLog;