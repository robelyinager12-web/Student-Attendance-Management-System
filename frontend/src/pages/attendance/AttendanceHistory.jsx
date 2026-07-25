import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendance.service';
import { courseAssignmentService } from '../../services/courseAssignment.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatDate';
import { ATTENDANCE_STATUS_COLORS } from '../../utils/constants';
import api from '../../services/api';
import {
  MdSearch, MdFilterList, MdDownload,
  MdRefresh, MdPeople, MdCheckCircle,
  MdCancel, MdSchedule, MdOutlineRule,
  MdEdit, MdDelete,
} from 'react-icons/md';

const statusIcons = {
  PRESENT: <MdCheckCircle size={14} className="text-green-500" />,
  ABSENT: <MdCancel size={14} className="text-red-500" />,
  LATE: <MdSchedule size={14} className="text-yellow-500" />,
  EXCUSED: <MdOutlineRule size={14} className="text-blue-500" />,
};

const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
  focus:ring-indigo-500 disabled:opacity-50`;

function SummaryCard({ label, value, color }) {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  };

  return (
    <div className={`rounded-xl p-4 text-center ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
    </div>
  );
}

function AttendanceHistory() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';

  // Filter state
  const [filters, setFilters] = useState({
    courseId: '',
    sectionId: '',
    batchId: '',
    semesterId: '',
    studentId: '',
    status: '',
    from: '',
    to: '',
  });
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);

  // Data state
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Dropdown data
  const [courses, setCourses] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);

  // Edit modal
  const [editRecord, setEditRecord] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editRemark, setEditRemark] = useState('');
  const [saving, setSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    if (isTeacher) {
      courseAssignmentService.getMyCourses()
        .then((r) => setAssignedCourses(r.data.data))
        .catch(() => {});
    } else {
      api.get('/courses').then((r) => setCourses(r.data.data)).catch(() => {});
      api.get('/departments').then((r) => setDepartments(r.data.data)).catch(() => {});
      api.get('/batches').then((r) => setBatches(r.data.data)).catch(() => {});
    }
  }, [isTeacher]);

  // Load sections when batch changes
  useEffect(() => {
    if (!filters.batchId) { setSections([]); return; }
    api.get(`/sections?batchId=${filters.batchId}`)
      .then((r) => setSections(r.data.data)).catch(() => {});
  }, [filters.batchId]);

  // Load semesters when batch changes
  useEffect(() => {
    if (!filters.batchId) { setSemesters([]); return; }
    api.get(`/academic-years?batchId=${filters.batchId}`)
      .then((r) => {
        const current = r.data.data.find((ay) => ay.isCurrent) || r.data.data[0];
        if (current) {
          api.get(`/semesters?academicYearId=${current.id}`)
            .then((s) => setSemesters(s.data.data)).catch(() => {});
        }
      }).catch(() => {});
  }, [filters.batchId]);

  // Load students when section changes
  useEffect(() => {
    if (!filters.sectionId) { setStudents([]); return; }
    api.get(`/students?sectionId=${filters.sectionId}&limit=200`)
      .then((r) => setStudents(r.data.data.items || []))
      .catch(() => {});
  }, [filters.sectionId]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const fetchHistory = useCallback(async (currentPage = page) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 20 };
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      const res = await attendanceService.getHistory(params);
      setRecords(res.data.data.records);
      setSummary(res.data.data.summary);
      setPagination(res.data.data.pagination);
      setSearched(true);
    } catch (err) {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const handleSearch = () => {
    setPage(1);
    fetchHistory(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchHistory(newPage);
  };

  const handleReset = () => {
    setFilters({
      courseId: '', sectionId: '', batchId: '',
      semesterId: '', studentId: '', status: '',
      from: '', to: '',
    });
    setRecords([]);
    setSummary(null);
    setPagination(null);
    setSearched(false);
    setPage(1);
  };

  const handleExport = async (format) => {
    try {
      const params = { ...filters, format };
      const token = localStorage.getItem('accessToken');
      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();

      const url = `http://localhost:5000/api/reports/class?${queryString}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        toast.error('Export failed');
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `attendance-history.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const openEdit = (record) => {
    setEditRecord(record);
    setEditStatus(record.status);
    setEditRemark(record.remark || '');
  };

  const handleSaveEdit = async () => {
    if (!editRecord) return;
    setSaving(true);
    try {
      await attendanceService.update(editRecord.id, {
        status: editStatus,
        remark: editRemark,
      });
      toast.success('Attendance updated');
      setEditRecord(null);
      fetchHistory(page);
    } catch (err) {
      toast.error('Failed to update attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await attendanceService.delete(id);
      toast.success('Record deleted');
      fetchHistory(page);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const courseOptions = isTeacher
    ? assignedCourses.map((a) => ({ id: a.courseId, name: `${a.Course?.code} — ${a.Course?.name}` }))
    : courses.map((c) => ({ id: c.id, name: `${c.code} — ${c.name}` }));

  return (
    <div className="space-y-5 max-w-6xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Attendance History' },
      ]} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Attendance History
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters((p) => !p)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200
              dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm
              font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <MdFilterList size={18} />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          {searched && (
            <>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center gap-2 px-3 py-2 border
                  border-green-600 text-green-600 text-sm font-medium
                  rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <MdDownload size={18} /> Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2 px-3 py-2 border
                  border-red-500 text-red-500 text-sm font-medium
                  rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <MdDownload size={18} /> PDF
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-2 px-3 py-2 border
                  border-gray-400 text-gray-600 dark:text-gray-300 text-sm
                  font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MdDownload size={18} /> CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            Filter Attendance Records
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Course */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Course
              </label>
              <select
                value={filters.courseId}
                onChange={(e) => updateFilter('courseId', e.target.value)}
                className={inputClass}
              >
                <option value="">All Courses</option>
                {courseOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Batch — admin only */}
            {isAdmin && (
              <div>
                <label className="block text-xs font-semibold text-gray-500
                  dark:text-gray-400 uppercase tracking-wider mb-1">
                  Batch
                </label>
                <select
                  value={filters.batchId}
                  onChange={(e) => updateFilter('batchId', e.target.value)}
                  className={inputClass}
                >
                  <option value="">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Section */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Section
              </label>
              <select
                value={filters.sectionId}
                onChange={(e) => updateFilter('sectionId', e.target.value)}
                className={inputClass}
                disabled={isAdmin && !filters.batchId}
              >
                <option value="">All Sections</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Semester */}
            {semesters.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-500
                  dark:text-gray-400 uppercase tracking-wider mb-1">
                  Semester
                </label>
                <select
                  value={filters.semesterId}
                  onChange={(e) => updateFilter('semesterId', e.target.value)}
                  className={inputClass}
                >
                  <option value="">All Semesters</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className={inputClass}
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="EXCUSED">Excused</option>
              </select>
            </div>

            {/* Student filter */}
            {students.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-500
                  dark:text-gray-400 uppercase tracking-wider mb-1">
                  Student
                </label>
                <select
                  value={filters.studentId}
                  onChange={(e) => updateFilter('studentId', e.target.value)}
                  className={inputClass}
                >
                  <option value="">All Students</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.User?.name} ({s.studentCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date range */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => updateFilter('from', e.target.value)}
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
                onChange={(e) => updateFilter('to', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Quick date range buttons */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-gray-400 self-center">Quick:</span>
            {[
              { label: 'Today', days: 0 },
              { label: 'Last 7 days', days: 7 },
              { label: 'Last 30 days', days: 30 },
              { label: 'This month', days: -1 },
            ].map(({ label, days }) => (
              <button
                key={label}
                onClick={() => {
                  const today = new Date();
                  const to = today.toISOString().split('T')[0];
                  let from;
                  if (days === 0) {
                    from = to;
                  } else if (days === -1) {
                    from = new Date(today.getFullYear(), today.getMonth(), 1)
                      .toISOString().split('T')[0];
                  } else {
                    const d = new Date(today);
                    d.setDate(d.getDate() - days);
                    from = d.toISOString().split('T')[0];
                  }
                  setFilters((prev) => ({ ...prev, from, to }));
                }}
                className="text-xs px-3 py-1.5 rounded-full border
                  border-gray-200 dark:border-gray-600 text-gray-600
                  dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600
                hover:bg-indigo-700 text-white text-sm font-medium rounded-lg
                disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white
                  border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdSearch size={18} />
              )}
              {loading ? 'Searching...' : 'Search'}
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

      {/* ── Summary Cards ── */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard label="Total Records" value={summary.total} color="indigo" />
          <SummaryCard label="Present" value={summary.present} color="green" />
          <SummaryCard label="Absent" value={summary.absent} color="red" />
          <SummaryCard label="Late" value={summary.late} color="yellow" />
          <SummaryCard label="Excused" value={summary.excused} color="blue" />
          <SummaryCard
            label="Attendance %"
            value={`${summary.percentage}%`}
            color={parseFloat(summary.percentage) >= 75 ? 'green' : 'red'}
          />
        </div>
      )}

      {/* ── Results Table ── */}
      {searched && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 overflow-hidden">

          {/* Table header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700
            flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {loading ? 'Loading...' : `${pagination?.total ?? 0} records found`}
            </p>
            {pagination && (
              <p className="text-xs text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-500
                border-t-transparent rounded-full animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16">
              <MdPeople size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No attendance records found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b
                    border-gray-100 dark:border-gray-700">
                    {[
                      'Date', 'Student', 'Student ID',
                      'Course', 'Section', 'Status', 'Remark',
                      isAdmin && 'Teacher', 'Actions',
                    ].filter(Boolean).map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs
                        font-semibold text-gray-500 dark:text-gray-400
                        uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {records.map((record) => (
                    <tr key={record.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30
                        transition-colors">
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300
                        whitespace-nowrap font-medium">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 dark:text-gray-200 font-medium
                          whitespace-nowrap">
                          {record.Student?.User?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {record.Student?.User?.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400
                        text-xs whitespace-nowrap">
                        {record.Student?.studentCode}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 dark:text-gray-300
                          whitespace-nowrap">
                          {record.Course?.name ?? '—'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {record.Course?.code}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400
                        whitespace-nowrap">
                        {record.Section?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs
                          px-2.5 py-1 rounded-full font-medium w-fit
                          ${ATTENDANCE_STATUS_COLORS[record.status]}`}>
                          {statusIcons[record.status]}
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400
                        text-xs max-w-32 truncate">
                        {record.remark || '—'}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400
                          text-xs whitespace-nowrap">
                          {record.Teacher?.User?.name ?? '—'}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEdit(record)}
                            className="p-1.5 rounded-lg text-indigo-600
                              hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            title="Edit"
                          >
                            <MdEdit size={16} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="p-1.5 rounded-lg text-red-500
                                hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete"
                            >
                              <MdDelete size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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
          <MdSearch size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Set your filters above and click Search
          </p>
          <p className="text-gray-400 text-sm mt-1">
            You can filter by course, section, date range, student, and status
          </p>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setEditRecord(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl
            shadow-xl p-6 w-full max-w-sm z-10">

            <h3 className="text-base font-semibold text-gray-700
              dark:text-gray-200 mb-1">
              Edit Attendance
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {editRecord.Student?.User?.name} · {formatDate(editRecord.date)}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700
                  dark:text-gray-300 mb-1">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setEditStatus(s)}
                      className={`flex items-center justify-center gap-1.5
                        py-2 rounded-lg border text-xs font-medium transition-all
                        ${editStatus === s
                          ? ATTENDANCE_STATUS_COLORS[s]
                          : 'border-gray-200 dark:border-gray-600 text-gray-500'
                        }`}
                    >
                      {statusIcons[s]} {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700
                  dark:text-gray-300 mb-1">Remark (optional)</label>
                <input
                  type="text"
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  placeholder="Add a note..."
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setEditRecord(null)}
                className="flex-1 py-2.5 border border-gray-200
                  dark:border-gray-600 text-sm text-gray-600
                  dark:text-gray-300 rounded-lg hover:bg-gray-100
                  dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700
                  text-white text-sm font-medium rounded-lg disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceHistory;