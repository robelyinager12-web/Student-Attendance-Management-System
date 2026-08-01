import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendance.service';
import { courseAssignmentService } from '../../services/courseAssignment.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatDate';
import api from '../../services/api';
import {
  MdSearch, MdRefresh, MdDownload, MdPrint,
  MdFilterList, MdClose, MdEdit, MdDelete,
  MdVisibility, MdBarChart, MdCheckCircle,
  MdCancel, MdSchedule, MdOutlineRule,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2.5 rounded-xl border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
  focus:ring-indigo-500 disabled:opacity-50`;

const STATUS_COLORS = {
  PRESENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ABSENT:  'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400',
  LATE:    'bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400',
  EXCUSED: 'bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-400',
};

const PCT_COLOR = (pct) => parseFloat(pct) >= 75 ? 'text-emerald-600' : parseFloat(pct) >= 60 ? 'text-amber-600' : 'text-red-600';
const PCT_BG    = (pct) => parseFloat(pct) >= 75 ? 'bg-emerald-500' : parseFloat(pct) >= 60 ? 'bg-amber-500' : 'bg-red-500';

export default function AttendanceHistory() {
  const { user } = useAuth();
  const isAdmin   = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';

  const [records,     setRecords]     = useState([]);
  const [summary,     setSummary]     = useState(null);
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [searched,    setSearched]    = useState(false);
  const [page,        setPage]        = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [editRecord,  setEditRecord]  = useState(null);
  const [editStatus,  setEditStatus]  = useState('');
  const [editRemark,  setEditRemark]  = useState('');
  const [saving,      setSaving]      = useState(false);
  const [viewSession, setViewSession] = useState(null);

  // Dropdown data
  const [academicYears,   setAcademicYears]   = useState([]);
  const [departments,     setDepartments]     = useState([]);
  const [batches,         setBatches]         = useState([]);
  const [sections,        setSections]        = useState([]);
  const [semesters,       setSemesters]       = useState([]);
  const [courses,         setCourses]         = useState([]);
  const [teachers,        setTeachers]        = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);

  const [filters, setFilters] = useState({
    academicYearId: '', semesterId: '', departmentId: '',
    batchId: '', sectionId: '', courseId: '',
    teacherId: '', status: '', from: '', to: '', search: '',
  });

  const sf = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  useEffect(() => {
    api.get('/academic-years').then(r => setAcademicYears(r.data.data)).catch(() => {});
    if (isAdmin) {
      api.get('/departments').then(r => setDepartments(r.data.data)).catch(() => {});
      api.get('/teachers').then(r => setTeachers(r.data.data)).catch(() => {});
    }
    if (isTeacher) {
      courseAssignmentService.getMyCourses().then(r => {
        setAssignedCourses(r.data.data);
        const uniqueCourses = r.data.data.map(a => a.Course).filter(Boolean);
        setCourses(uniqueCourses);
      }).catch(() => {});
    }
  }, [isAdmin, isTeacher]);

  useEffect(() => {
    if (!filters.academicYearId) return;
    api.get(`/semesters?academicYearId=${filters.academicYearId}`).then(r => setSemesters(r.data.data)).catch(() => {});
  }, [filters.academicYearId]);

  useEffect(() => {
    if (!filters.departmentId) { setBatches([]); setCourses([]); return; }
    api.get(`/batches?departmentId=${filters.departmentId}`).then(r => setBatches(r.data.data)).catch(() => {});
    api.get(`/courses?departmentId=${filters.departmentId}`).then(r => setCourses(r.data.data)).catch(() => {});
  }, [filters.departmentId]);

  useEffect(() => {
    if (!filters.batchId) { setSections([]); return; }
    api.get(`/sections?batchId=${filters.batchId}`).then(r => setSections(r.data.data)).catch(() => {});
  }, [filters.batchId]);

  const fetchHistory = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 20 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await attendanceService.getHistory(params);
      setRecords(res.data.data.records || []);
      setSummary(res.data.data.summary);
      setPagination(res.data.data.pagination);
      setSearched(true);
    } catch { toast.error('Failed to load attendance history'); }
    finally { setLoading(false); }
  }, [filters, page]);

  const handleSearch = () => { setPage(1); fetchHistory(1); };
  const handleReset  = () => {
    setFilters({ academicYearId: '', semesterId: '', departmentId: '', batchId: '', sectionId: '', courseId: '', teacherId: '', status: '', from: '', to: '', search: '' });
    setRecords([]); setSummary(null); setPagination(null); setSearched(false); setPage(1);
  };

  const setQuickDate = (days) => {
    const today = new Date();
    const to    = today.toISOString().split('T')[0];
    let from;
    if (days === 0) { from = to; }
    else { const d = new Date(today); d.setDate(d.getDate() - days); from = d.toISOString().split('T')[0]; }
    setFilters(p => ({ ...p, from, to }));
  };

  const handleSaveEdit = async () => {
    if (!editRecord) return;
    setSaving(true);
    try {
      await attendanceService.update(editRecord.id, { status: editStatus, remark: editRemark });
      toast.success('Attendance updated');
      setEditRecord(null);
      fetchHistory(page);
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try { await attendanceService.delete(id); toast.success('Record deleted'); fetchHistory(page); }
    catch { toast.error('Failed to delete'); }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('format', format);
      const res = await fetch(`http://localhost:5000/api/reports/class?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { toast.error('Export failed'); return; }
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `attendance.${format === 'excel' ? 'xlsx' : format}`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch { toast.error('Export failed'); }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/home' }, { label: 'Attendance History' }]} />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <MdBarChart className="text-blue-600" size={28} /> Attendance History
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {searched && summary ? `${pagination?.total ?? 0} records · ${summary.percentage}% average attendance` : 'Search and filter attendance records'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {searched && (
            <>
              <button onClick={() => handleExport('excel')}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm font-semibold rounded-xl">
                <MdDownload size={18} /> Export Excel
              </button>
              <button onClick={() => handleExport('pdf')}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-red-500 text-red-500 hover:bg-red-50 text-sm font-semibold rounded-xl">
                <MdDownload size={18} /> Export PDF
              </button>
              <button onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-400 text-gray-600 hover:bg-gray-100 text-sm font-semibold rounded-xl">
                <MdPrint size={18} /> Print
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total',   value: summary.total,   gradient: 'from-indigo-500 to-indigo-600' },
            { label: 'Present', value: summary.present, gradient: 'from-emerald-500 to-emerald-600' },
            { label: 'Absent',  value: summary.absent,  gradient: 'from-red-500 to-red-600' },
            { label: 'Late',    value: summary.late,    gradient: 'from-amber-500 to-amber-600' },
            { label: 'Excused', value: summary.excused, gradient: 'from-blue-500 to-blue-600' },
            { label: 'Rate',    value: `${summary.percentage}%`, gradient: parseFloat(summary.percentage) >= 75 ? 'from-emerald-600 to-teal-600' : 'from-red-600 to-red-700' },
          ].map(c => (
            <div key={c.label} className={`rounded-2xl p-4 text-white shadow-lg relative overflow-hidden bg-gradient-to-br ${c.gradient}`}>
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/10 -translate-y-4 translate-x-4" />
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{c.label}</p>
              <p className="text-2xl font-extrabold mt-1">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => setShowFilters(p => !p)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <MdFilterList size={18} className="text-blue-500" /> Filters
          </button>
          <div className="flex gap-3">
            <button onClick={handleReset} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
              <MdClose size={14} /> Reset
            </button>
            <button onClick={() => fetchHistory(1)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 font-medium">
              <MdRefresh size={14} /> Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-5 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Academic Year *</label>
                <select value={filters.academicYearId} onChange={e => sf('academicYearId', e.target.value)} className={inputClass}>
                  <option value="">All Years</option>
                  {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Semester *</label>
                <select value={filters.semesterId} onChange={e => sf('semesterId', e.target.value)} className={inputClass} disabled={!filters.academicYearId}>
                  <option value="">All Semesters</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Department *</label>
                  <select value={filters.departmentId} onChange={e => sf('departmentId', e.target.value)} className={inputClass}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
              {isAdmin && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Batch</label>
                  <select value={filters.batchId} onChange={e => sf('batchId', e.target.value)} className={inputClass} disabled={!filters.departmentId}>
                    <option value="">All Batches</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Section</label>
                <select value={filters.sectionId} onChange={e => sf('sectionId', e.target.value)} className={inputClass} disabled={isAdmin && !filters.batchId}>
                  <option value="">All Sections</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Course</label>
                <select value={filters.courseId} onChange={e => sf('courseId', e.target.value)} className={inputClass}>
                  <option value="">All Courses</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </select>
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Teacher</label>
                  <select value={filters.teacherId} onChange={e => sf('teacherId', e.target.value)} className={inputClass}>
                    <option value="">All Teachers</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.User?.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                <select value={filters.status} onChange={e => sf('status', e.target.value)} className={inputClass}>
                  <option value="">All Statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="EXCUSED">Excused</option>
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
            </div>

            {/* Quick dates + Search + Action */}
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-48">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Search</label>
                <div className="relative">
                  <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={filters.search} onChange={e => sf('search', e.target.value)}
                    placeholder="Search student name or ID..." className={`${inputClass} pl-9`} />
                  {filters.search && <button onClick={() => sf('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><MdClose size={16} /></button>}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap items-end">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Quick Range</label>
                  <div className="flex gap-1.5">
                    {[{ label: 'Today', days: 0 }, { label: '7d', days: 7 }, { label: '30d', days: 30 }].map(q => (
                      <button key={q.label} onClick={() => setQuickDate(q.days)}
                        className="text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                          text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20
                          hover:border-indigo-300 font-medium transition-colors">
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleSearch} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600
                    hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl
                    disabled:opacity-60 shadow-md transition-all">
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdSearch size={18} />}
                  Search
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results table */}
      {!searched ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-4xl mx-auto mb-4">📅</div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold text-lg">Set Filters & Search</p>
          <p className="text-gray-400 text-sm mt-2">Use the filters above to search attendance records</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {loading ? 'Loading...' : `${pagination?.total ?? 0} records found`}
            </p>
            {pagination && <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.totalPages}</p>}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-500 text-sm">Loading attendance records...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl mb-3">📭</div>
              <p className="text-gray-500 font-semibold">No records found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    {['Date','Course','Teacher','Department','Program','Section','Present','Absent','Late','Rate','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {records.map((rec, i) => {
                    const pct = rec.percentage ?? '—';
                    return (
                      <tr key={rec.id}
                        className={`transition-colors hover:bg-blue-50/60 dark:hover:bg-blue-900/20
                          ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                        <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                          {formatDate(rec.date)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800 dark:text-white whitespace-nowrap">{rec.Course?.name ?? '—'}</p>
                          <p className="text-xs font-mono text-rose-600">{rec.Course?.code}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {rec.Teacher?.User?.name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {rec.Student?.Department?.name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {rec.Student?.Program?.code ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-teal-700 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400 px-2 py-0.5 rounded-full">
                            {rec.Section?.name ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                            {rec.status === 'PRESENT' ? '✓' : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                            {rec.status === 'ABSENT' ? '✗' : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                            {rec.status === 'LATE' ? '⏱' : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[rec.status]}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {rec.Student?.User?.name}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setEditRecord(rec); setEditStatus(rec.status); setEditRemark(rec.remark || ''); }}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
                              <MdEdit size={16} />
                            </button>
                            {isAdmin && (
                              <button onClick={() => handleDelete(rec.id)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                                <MdDelete size={16} />
                              </button>
                            )}
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
              <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.totalPages} · {pagination.total} total</p>
              <Pagination page={pagination.page} totalPages={pagination.totalPages}
                onPageChange={pg => { setPage(pg); fetchHistory(pg); }} />
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditRecord(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
            <h3 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-1">Edit Attendance</h3>
            <p className="text-xs text-gray-400 mb-4">{editRecord.Student?.User?.name} · {formatDate(editRecord.date)}</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {Object.entries(STATUS_COLORS).map(([s, c]) => (
                <button key={s} onClick={() => setEditStatus(s)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all
                    ${editStatus === s ? c : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}>
                  {s}
                </button>
              ))}
            </div>
            <input value={editRemark} onChange={e => setEditRemark(e.target.value)}
              placeholder="Remark (optional)" className={inputClass + ' mb-4'} />
            <div className="flex gap-3">
              <button onClick={() => setEditRecord(null)} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}