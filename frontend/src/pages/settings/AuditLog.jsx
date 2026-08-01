import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { auditLogService } from '../../services/auditLog.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/formatDate';
import {
  MdSearch, MdRefresh, MdDelete, MdDownload,
  MdFilterList, MdClose, MdVisibility, MdPrint,
  MdSecurity, MdPerson, MdArchive,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2.5 rounded-xl border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50`;

const ACTION_STYLES = {
  CREATE:           { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '✦', label: 'Create' },
  UPDATE:           { color: 'bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-400',    icon: '✎', label: 'Update' },
  DELETE:           { color: 'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400',     icon: '✗', label: 'Delete' },
  LOGIN:            { color: 'bg-indigo-100  text-indigo-700  dark:bg-indigo-900/30  dark:text-indigo-400',  icon: '→', label: 'Login' },
  LOGOUT:           { color: 'bg-gray-100    text-gray-700    dark:bg-gray-700       dark:text-gray-300',    icon: '←', label: 'Logout' },
  IMPORT:           { color: 'bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400',   icon: '↓', label: 'Import' },
  EXPORT:           { color: 'bg-purple-100  text-purple-700  dark:bg-purple-900/30  dark:text-purple-400',  icon: '↑', label: 'Export' },
  ATTENDANCE_MARK:  { color: 'bg-teal-100    text-teal-700    dark:bg-teal-900/30    dark:text-teal-400',    icon: '✓', label: 'Attendance' },
  ATTENDANCE_EDIT:  { color: 'bg-orange-100  text-orange-700  dark:bg-orange-900/30  dark:text-orange-400',  icon: '✎', label: 'Edit Attend.' },
};

const ROLE_COLORS = {
  ADMIN:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  TEACHER: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  STUDENT: 'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
};

const ACTIONS  = ['CREATE','UPDATE','DELETE','LOGIN','LOGOUT','IMPORT','EXPORT','ATTENDANCE_MARK','ATTENDANCE_EDIT'];
const ENTITIES = ['User','Student','Teacher','Course','CourseAssignment','StudentEnrollment','Attendance','Department','Section','Batch'];

export default function AuditLog() {
  const [logs,         setLogs]         = useState([]);
  const [pagination,   setPagination]   = useState(null);
  const [actionCounts, setActionCounts] = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [searched,     setSearched]     = useState(false);
  const [selectedLog,  setSelectedLog]  = useState(null);
  const [clearModal,   setClearModal]   = useState(false);
  const [clearDate,    setClearDate]    = useState('');
  const [clearing,     setClearing]     = useState(false);
  const [page,         setPage]         = useState(1);
  const [showFilters,  setShowFilters]  = useState(true);

  const [filters, setFilters] = useState({ action: '', entity: '', from: '', to: '', search: '' });
  const sf = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  useEffect(() => {
    auditLogService.getStats().then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  const fetchLogs = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 20 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await auditLogService.getAll(params);
      setLogs(res.data.data.logs);
      setPagination(res.data.data.pagination);
      setActionCounts(res.data.data.actionCounts || []);
      setSearched(true);
    } catch { toast.error('Failed to load audit logs'); }
    finally { setLoading(false); }
  }, [filters, page]);

  const handleSearch = () => { setPage(1); fetchLogs(1); };
  const handleReset  = () => {
    setFilters({ action: '', entity: '', from: '', to: '', search: '' });
    setLogs([]); setPagination(null); setActionCounts([]); setSearched(false); setPage(1);
  };

  const handleClear = async () => {
    if (!clearDate) return toast.error('Please select a date');
    setClearing(true);
    try { await auditLogService.clearOld(clearDate); toast.success('Logs cleared'); setClearModal(false); handleSearch(); }
    catch { toast.error('Failed to clear logs'); }
    finally { setClearing(false); }
  };

  const setQuickDate = (days) => {
    const today = new Date(); const to = today.toISOString().split('T')[0];
    const d = new Date(today); d.setDate(d.getDate() - days);
    setFilters(p => ({ ...p, from: d.toISOString().split('T')[0], to }));
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/home' }, { label: 'Audit Logs' }]} />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <MdSecurity className="text-slate-600" size={28} /> Audit Logs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">System activity trail — track all user actions and changes</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm font-semibold rounded-xl">
            <MdDownload size={18} /> Export Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-red-500 text-red-500 hover:bg-red-50 text-sm font-semibold rounded-xl">
            <MdDownload size={18} /> Export PDF
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-400 text-gray-600 hover:bg-gray-100 text-sm font-semibold rounded-xl">
            <MdPrint size={18} /> Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-xl">
            <MdArchive size={18} /> Archive Logs
          </button>
          <button onClick={() => setClearModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-md">
            <MdDelete size={18} /> Clear Old Logs
          </button>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Logs',     value: stats.total,       gradient: 'from-slate-600 to-slate-700' },
            { label: "Today's Logs",   value: stats.todayCount,  gradient: 'from-indigo-500 to-indigo-600' },
            { label: 'Total Logins',   value: stats.totalLogins, gradient: 'from-blue-500 to-blue-600' },
            { label: 'Recent By',      value: stats.recentActivity?.[0]?.User?.name ?? '—', gradient: 'from-purple-500 to-purple-600' },
          ].map(c => (
            <div key={c.label} className={`rounded-2xl p-5 text-white shadow-lg relative overflow-hidden bg-gradient-to-br ${c.gradient}`}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{c.label}</p>
              <p className="text-3xl font-extrabold mt-1 truncate">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action count badges */}
      {actionCounts.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-gray-400 self-center font-semibold">Results by action:</span>
          {actionCounts.map(ac => {
            const s = ACTION_STYLES[ac.action] || { color: 'bg-gray-100 text-gray-700', icon: '·', label: ac.action };
            return (
              <span key={ac.action} className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold ${s.color}`}>
                <span>{s.icon}</span> {s.label} ({ac.count})
              </span>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => setShowFilters(p => !p)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <MdFilterList size={18} className="text-slate-500" /> Filters
          </button>
          <div className="flex gap-3">
            <button onClick={handleReset} className="flex items-center gap-1 text-xs text-red-500 font-medium">
              <MdClose size={14} /> Reset
            </button>
            <button onClick={() => fetchLogs(1)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 font-medium">
              <MdRefresh size={14} /> Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Action</label>
                <select value={filters.action} onChange={e => sf('action', e.target.value)} className={inputClass}>
                  <option value="">All Actions</option>
                  {ACTIONS.map(a => <option key={a} value={a}>{ACTION_STYLES[a]?.label || a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Module / Entity</label>
                <select value={filters.entity} onChange={e => sf('entity', e.target.value)} className={inputClass}>
                  <option value="">All Modules</option>
                  {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">From Date</label>
                <input type="date" value={filters.from} onChange={e => sf('from', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">To Date</label>
                <input type="date" value={filters.to} onChange={e => sf('to', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Quick Range</label>
                <div className="flex gap-1.5">
                  {[{ l: 'Today', d: 0 }, { l: '7d', d: 7 }, { l: '30d', d: 30 }].map(q => (
                    <button key={q.l} onClick={() => setQuickDate(q.d)}
                      className="flex-1 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-xl
                        text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-medium">
                      {q.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={filters.search} onChange={e => sf('search', e.target.value)}
                  placeholder="Search user, IP, description..." className={`${inputClass} pl-9`} />
              </div>
              <button onClick={handleSearch} disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-slate-600 to-slate-700
                  hover:from-slate-700 hover:to-slate-800 text-white text-sm font-bold rounded-xl disabled:opacity-60 shadow-md">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdSearch size={18} />}
                Search Logs
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {!searched ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center text-4xl mx-auto mb-4">🔍</div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold text-lg">Search Audit Logs</p>
          <p className="text-gray-400 text-sm mt-2">Use the filters above or click Load All to view recent logs</p>
          <button onClick={() => fetchLogs(1)} className="mt-4 px-6 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl">
            Load All Recent Logs
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {loading ? 'Loading...' : `${pagination?.total ?? 0} log entries`}
            </p>
            {pagination && <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.totalPages}</p>}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-slate-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-500 text-sm">Loading audit logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl mb-3">📋</div>
              <p className="text-gray-500 font-semibold">No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-700 text-white">
                    {['Date & Time','User','Role','Module','Action','Description','IP Address','Device','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {logs.map((log, i) => {
                    const style = ACTION_STYLES[log.action] || { color: 'bg-gray-100 text-gray-700', icon: '·', label: log.action };
                    const isLogin = log.action === 'LOGIN';
                    const isFailed = log.description?.toLowerCase().includes('failed') || log.description?.toLowerCase().includes('invalid');
                    return (
                      <tr key={log.id}
                        className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-900/20
                          ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{formatDateTime(log.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-600
                              flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {log.User?.name?.charAt(0) ?? 'S'}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                              {log.User?.name ?? 'System'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap
                            ${ROLE_COLORS[log.userRole] ?? 'bg-gray-100 text-gray-600'}`}>
                            {log.userRole ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {log.entity}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold w-fit
                            ${style.color}`}>
                            {style.icon} {style.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 max-w-[220px] truncate"
                          title={log.description}>
                          {log.description ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {log.ipAddress ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {log.userAgent?.includes('Chrome') ? '🌐 Chrome' :
                           log.userAgent?.includes('Edge') ? '🌐 Edge' :
                           log.userAgent?.includes('Firefox') ? '🌐 Firefox' :
                           log.userAgent?.includes('Android') ? '📱 Android' :
                           log.userAgent?.includes('iPhone') ? '📱 iOS' : '🌐 Browser'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold
                            ${isFailed ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isFailed ? 'Failed' : 'Success'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedLog(log)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors">
                            <MdVisibility size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && pagination && pagination.totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.totalPages} · {pagination.total} total</p>
              <Pagination page={pagination.page} totalPages={pagination.totalPages}
                onPageChange={pg => { setPage(pg); fetchLogs(pg); }} />
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedLog(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg z-10 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-200">Audit Log Detail</h3>
              <button onClick={() => setSelectedLog(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><MdClose size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Action',    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ACTION_STYLES[selectedLog.action]?.color || 'bg-gray-100 text-gray-700'}`}>{selectedLog.action}</span>],
                  ['Entity',    selectedLog.entity],
                  ['Entity ID', selectedLog.entityId?.substring(0, 16) + '...' || '—'],
                  ['User',      selectedLog.User?.name || 'System'],
                  ['Role',      selectedLog.userRole || '—'],
                  ['IP Address', selectedLog.ipAddress || '—'],
                  ['Time',      formatDateTime(selectedLog.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <div className="text-sm text-gray-700 dark:text-gray-200 font-medium">{value}</div>
                  </div>
                ))}
              </div>
              {selectedLog.description && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200">{selectedLog.description}</p>
                </div>
              )}
              {selectedLog.oldValues && (
                <div>
                  <p className="text-xs text-red-500 uppercase tracking-wider mb-1 font-bold">Before Change</p>
                  <pre className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-xl overflow-x-auto">
                    {JSON.stringify(selectedLog.oldValues, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.newValues && (
                <div>
                  <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1 font-bold">After Change</p>
                  <pre className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl overflow-x-auto">
                    {JSON.stringify(selectedLog.newValues, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clear Modal */}
      {clearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setClearModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
            <h3 className="text-base font-bold text-center mb-2">Clear Old Audit Logs</h3>
            <p className="text-sm text-gray-500 text-center mb-4">All logs before the selected date will be permanently deleted.</p>
            <input type="date" value={clearDate} onChange={e => setClearDate(e.target.value)} className={inputClass + ' mb-4'} />
            <div className="flex gap-3">
              <button onClick={() => setClearModal(false)} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl">Cancel</button>
              <button onClick={handleClear} disabled={clearing || !clearDate}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
                {clearing ? 'Clearing...' : 'Delete Logs'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}