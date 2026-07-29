import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { useForm } from 'react-hook-form';
import { formatDate } from '../../utils/formatDate';
import api from '../../services/api';
import {
  MdNotifications, MdSearch, MdFilterList, MdClose,
  MdRefresh, MdDownload, MdSend, MdBroadcastOnHome,
  MdScheduleSend, MdVisibility, MdDelete,
  MdCheckCircle, MdWarning, MdInfo, MdError,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2.5 rounded-xl border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
  focus:ring-indigo-500 disabled:opacity-50`;

const PRIORITY_COLORS = {
  Critical: 'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400',
  High:     'bg-orange-100  text-orange-700  dark:bg-orange-900/30  dark:text-orange-400',
  Normal:   'bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-400',
  Low:      'bg-gray-100    text-gray-600    dark:bg-gray-700       dark:text-gray-300',
};

const STATUS_COLORS = {
  Unread: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Read:   'bg-gray-100   text-gray-600   dark:bg-gray-700       dark:text-gray-300',
  Sent:   'bg-emerald-100 text-emerald-700',
  Failed: 'bg-red-100   text-red-700',
};

const PRIORITY_ICONS = {
  Critical: <MdError size={14} className="text-red-600" />,
  High:     <MdWarning size={14} className="text-orange-600" />,
  Normal:   <MdInfo size={14} className="text-blue-600" />,
  Low:      <MdInfo size={14} className="text-gray-400" />,
};

function SendNotificationForm({ onSuccess, onCancel }) {
  const [departments, setDepartments] = useState([]);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  useEffect(() => { api.get('/departments').then(r => setDepartments(r.data.data)).catch(() => {}); }, []);
  const onSubmit = async (data) => {
    try {
      await api.post('/notifications', data);
      toast.success('Notification sent successfully');
      onSuccess?.();
    } catch { toast.error('Failed to send notification'); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient Type</label>
          <select {...register('recipientType')} className={inputClass}>
            <option value="ALL">All Users</option>
            <option value="ADMIN">Admins</option>
            <option value="TEACHER">Teachers</option>
            <option value="STUDENT">Students</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
          <select {...register('priority')} className={inputClass}>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department (optional)</label>
          <select {...register('departmentId')} className={inputClass}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
          <select {...register('type')} className={inputClass}>
            <option value="GENERAL">General</option>
            <option value="ATTENDANCE">Attendance</option>
            <option value="ACADEMIC">Academic</option>
            <option value="SECURITY">Security</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
          <input {...register('title', { required: true })} className={inputClass} placeholder="Notification title" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
          <textarea {...register('message', { required: true })} rows={3} className={`${inputClass} resize-none`} placeholder="Notification message..." />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
          <MdSend size={16} /> {isSubmitting ? 'Sending...' : 'Send Notification'}
        </button>
      </div>
    </form>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [pagination,    setPagination]    = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [searched,      setSearched]      = useState(false);
  const [page,          setPage]          = useState(1);
  const [showFilters,   setShowFilters]   = useState(true);
  const [modal,         setModal]         = useState(null);
  const [viewNotif,     setViewNotif]     = useState(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0, unread: 0, read: 0, scheduled: 0, failed: 0, today: 0,
  });

  const [filters, setFilters] = useState({
    role: '', type: '', priority: '', status: '',
    departmentId: '', from: '', to: '', search: '',
  });
  const [departments, setDepartments] = useState([]);
  const sf = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data.data)).catch(() => {});
    // Load initial notifications
    fetchNotifications(1);
  }, []);

  const fetchNotifications = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 20 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await api.get('/notifications', { params });
      const data = res.data.data;
      const items = Array.isArray(data) ? data : data.items || data.notifications || [];
      setNotifications(items);
      setPagination(data.pagination || null);
      // Build stats
      setStats({
        total:     items.length,
        unread:    items.filter(n => !n.isRead).length,
        read:      items.filter(n =>  n.isRead).length,
        scheduled: 0, failed: 0,
        today: items.filter(n => new Date(n.createdAt).toDateString() === new Date().toDateString()).length,
      });
      setSearched(true);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  }, [filters, page]);

  const handleSearch = () => { setPage(1); fetchNotifications(1); };
  const handleReset  = () => {
    setFilters({ role: '', type: '', priority: '', status: '', departmentId: '', from: '', to: '', search: '' });
    setPage(1); fetchNotifications(1);
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(p => p.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      toast.success('Notification deleted');
      fetchNotifications(page);
    } catch { toast.error('Failed to delete'); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      toast.success('All notifications marked as read');
      fetchNotifications(page);
    } catch {}
  };

  // Build mock priority & type from message content
  const getPriority = (n) => {
    const msg = (n.message || n.title || '').toLowerCase();
    if (msg.includes('failed') || msg.includes('security') || msg.includes('critical')) return 'Critical';
    if (msg.includes('absent') || msg.includes('warning') || msg.includes('low')) return 'High';
    if (msg.includes('success') || msg.includes('submitted')) return 'Normal';
    return 'Normal';
  };

  const getType = (n) => {
    const msg = (n.message || n.title || '').toLowerCase();
    if (msg.includes('attendance') || msg.includes('absent') || msg.includes('present')) return 'Attendance';
    if (msg.includes('login') || msg.includes('password') || msg.includes('security')) return 'Security';
    if (msg.includes('course') || msg.includes('grade') || msg.includes('semester')) return 'Academic';
    return 'General';
  };

  const statCards = [
    { label: 'Total',         value: stats.total,     gradient: 'from-indigo-500 to-indigo-600' },
    { label: 'Unread',        value: stats.unread,    gradient: 'from-red-500 to-red-600' },
    { label: 'Read',          value: stats.read,      gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Scheduled',     value: stats.scheduled, gradient: 'from-amber-500 to-amber-600' },
    { label: 'Failed',        value: stats.failed,    gradient: 'from-slate-500 to-slate-600' },
    { label: "Today's",       value: stats.today,     gradient: 'from-blue-500 to-blue-600' },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/home' }, { label: 'Notifications' }]} />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <MdNotifications className="text-indigo-600" size={28} /> Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all system notifications and messages</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setModal('send')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-semibold rounded-xl shadow-md">
            <MdSend size={18} /> Send Notification
          </button>
          <button onClick={() => setModal('broadcast')}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700
              text-white text-sm font-semibold rounded-xl shadow-md">
            <MdBroadcastOnHome size={18} /> Broadcast
          </button>
          <button onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-600
              text-emerald-600 hover:bg-emerald-50 text-sm font-semibold rounded-xl">
            <MdCheckCircle size={18} /> Mark All Read
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-600
            text-emerald-600 hover:bg-emerald-50 text-sm font-semibold rounded-xl">
            <MdDownload size={18} /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {statCards.map(c => (
          <div key={c.label} className={`rounded-2xl p-4 text-white shadow-lg relative overflow-hidden bg-gradient-to-br ${c.gradient}`}>
            <div className="absolute top-0 right-0 w-14 h-14 rounded-full bg-white/10 -translate-y-4 translate-x-4" />
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{c.label}</p>
            <p className="text-2xl font-extrabold mt-0.5">{c.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => setShowFilters(p => !p)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <MdFilterList size={18} className="text-indigo-500" /> Filters
          </button>
          <div className="flex gap-3">
            <button onClick={handleReset} className="flex items-center gap-1 text-xs text-red-500 font-medium"><MdClose size={14} /> Reset</button>
            <button onClick={() => fetchNotifications(1)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 font-medium"><MdRefresh size={14} /> Refresh</button>
          </div>
        </div>

        {showFilters && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role</label>
                <select value={filters.role} onChange={e => sf('role', e.target.value)} className={inputClass}>
                  <option value="">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Department</label>
                <select value={filters.departmentId} onChange={e => sf('departmentId', e.target.value)} className={inputClass}>
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                <select value={filters.type} onChange={e => sf('type', e.target.value)} className={inputClass}>
                  <option value="">All Types</option>
                  <option value="ATTENDANCE">Attendance</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="SECURITY">Security</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Priority</label>
                <select value={filters.priority} onChange={e => sf('priority', e.target.value)} className={inputClass}>
                  <option value="">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                <select value={filters.status} onChange={e => sf('status', e.target.value)} className={inputClass}>
                  <option value="">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">From Date</label>
                <input type="date" value={filters.from} onChange={e => sf('from', e.target.value)} className={inputClass} style={{ width: 'auto' }} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">To Date</label>
                <input type="date" value={filters.to} onChange={e => sf('to', e.target.value)} className={inputClass} style={{ width: 'auto' }} />
              </div>
              <div className="flex-1 min-w-48">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Search</label>
                <div className="relative">
                  <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={filters.search} onChange={e => sf('search', e.target.value)}
                    placeholder="Search notifications..." className={`${inputClass} pl-9`} />
                  {filters.search && <button onClick={() => sf('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><MdClose size={16} /></button>}
                </div>
              </div>
              <div className="flex items-end">
                <button onClick={handleSearch} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600
                    hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-xl disabled:opacity-60 shadow-md">
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdSearch size={18} />}
                  Search
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {loading ? 'Loading...' : `${notifications.length} notifications`}
          </p>
          {pagination && <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.totalPages}</p>}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-500 text-sm">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-3xl mb-3">🔔</div>
            <p className="text-gray-500 font-semibold">No notifications found</p>
            <button onClick={() => setModal('send')}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl">
              <MdSend size={16} /> Send First Notification
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  {['Date','Recipient','Role','Module','Message','Priority','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notif, i) => {
                  const priority = getPriority(notif);
                  const type     = getType(notif);
                  const isUnread = !notif.isRead;
                  return (
                    <tr key={notif.id}
                      className={`transition-colors hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20
                        ${isUnread ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{formatDate(notif.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600
                            flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {notif.User?.name?.charAt(0) ?? '?'}
                          </div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {notif.User?.name ?? 'All Users'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap
                          ${notif.User?.role === 'ADMIN'   ? 'bg-purple-100 text-purple-700' :
                            notif.User?.role === 'TEACHER' ? 'bg-blue-100   text-blue-700'   :
                                                             'bg-green-100  text-green-700'}`}>
                          {notif.User?.role ?? 'All'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                          {type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm max-w-[240px] truncate ${isUnread ? 'font-bold text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
                          title={notif.message}>
                          {isUnread && <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mr-1.5 mb-0.5" />}
                          {notif.message || notif.title}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold w-fit
                          ${PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.Normal}`}>
                          {PRIORITY_ICONS[priority]} {priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                          ${isUnread ? STATUS_COLORS.Unread : STATUS_COLORS.Read}`}>
                          {isUnread ? 'Unread' : 'Read'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setViewNotif(notif); if (isUnread) markRead(notif.id); }}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="View">
                            <MdVisibility size={16} />
                          </button>
                          <button onClick={() => deleteNotif(notif.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                            <MdDelete size={16} />
                          </button>
                        </div>
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
            <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.totalPages}</p>
            <Pagination page={pagination.page} totalPages={pagination.totalPages}
              onPageChange={pg => { setPage(pg); fetchNotifications(pg); }} />
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      <Modal isOpen={modal === 'send'} onClose={() => setModal(null)} title="Send Notification" size="xl">
        <SendNotificationForm
          onSuccess={() => { setModal(null); fetchNotifications(1); }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* Broadcast Modal */}
      <Modal isOpen={modal === 'broadcast'} onClose={() => setModal(null)} title="Broadcast Message to All Users" size="xl">
        <SendNotificationForm
          onSuccess={() => { setModal(null); fetchNotifications(1); }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* View Notification Detail */}
      {viewNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewNotif(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md z-10">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-200">Notification Detail</h3>
              <button onClick={() => setViewNotif(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><MdClose size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0
                  ${PRIORITY_COLORS[getPriority(viewNotif)]?.replace('text-', 'bg-').split(' ')[0] || 'bg-indigo-100'}`}>
                  {PRIORITY_ICONS[getPriority(viewNotif)]}
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{viewNotif.title || 'Notification'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(viewNotif.createdAt)}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                  {viewNotif.message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  ['Recipient', viewNotif.User?.name ?? 'All Users'],
                  ['Role',      viewNotif.User?.role ?? 'All'],
                  ['Type',      getType(viewNotif)],
                  ['Priority',  getPriority(viewNotif)],
                  ['Status',    !viewNotif.isRead ? 'Unread' : 'Read'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">{value}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setViewNotif(null)}
                className="w-full py-2.5 border border-gray-200 dark:border-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}