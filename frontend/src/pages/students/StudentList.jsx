import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { studentService } from '../../services/student.service';
import { departmentService } from '../../services/department.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import {
  MdAdd, MdSearch, MdEdit, MdDelete,
  MdVisibility, MdDownload, MdUpload,
  MdFilterList, MdRefresh, MdPeople,
  MdClose,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
  focus:ring-indigo-500`;

const STATUS_COLORS = {
  ACTIVE:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  INACTIVE:  'bg-gray-100    text-gray-600    dark:bg-gray-700       dark:text-gray-400',
  GRADUATED: 'bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-400',
  SUSPENDED: 'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400',
};

const YEAR_LABELS = { 1: 'Year I', 2: 'Year II', 3: 'Year III', 4: 'Year IV', 5: 'Year V' };
const SEM_LABELS  = { 1: 'Sem I',  2: 'Sem II' };

export default function StudentList() {
  const navigate = useNavigate();

  // ── Data ──
  const [students,      setStudents]      = useState([]);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [loading,       setLoading]       = useState(false);
  const [selected,      setSelected]      = useState([]);

  // ── Filter options ──
  const [departments,   setDepartments]   = useState([]);
  const [batches,       setBatches]       = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters,     setSemesters]     = useState([]);
  const [sections,      setSections]      = useState([]);

  // ── Active filters ──
  const [filters, setFilters] = useState({
    academicYearId: '',
    departmentId:   '',
    batchId:        '',
    year:           '',
    semesterId:     '',
    sectionId:      '',
    status:         'ACTIVE',
    search:         '',
  });
  const [showFilters, setShowFilters] = useState(true);

  // ── Delete confirm ──
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Load dropdown data ──
  useEffect(() => {
    departmentService.getAll()
      .then(r => setDepartments(r.data.data)).catch(() => {});
    api.get('/academic-years')
      .then(r => setAcademicYears(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!filters.departmentId) { setBatches([]); return; }
    api.get(`/batches?departmentId=${filters.departmentId}`)
      .then(r => setBatches(r.data.data)).catch(() => {});
  }, [filters.departmentId]);

  useEffect(() => {
    if (!filters.batchId) { setSections([]); setSemesters([]); return; }
    api.get(`/sections?batchId=${filters.batchId}`)
      .then(r => setSections(r.data.data)).catch(() => {});
    api.get(`/academic-years?batchId=${filters.batchId}`)
      .then(r => {
        const current = r.data.data.find(ay => ay.isCurrent) || r.data.data[0];
        if (current) {
          api.get(`/semesters?academicYearId=${current.id}`)
            .then(s => setSemesters(s.data.data)).catch(() => {});
        }
      }).catch(() => {});
  }, [filters.batchId]);

  // ── Fetch students ──
 const fetchStudents = useCallback(async (pg = 1) => {
  setLoading(true);
  setSelected([]);
  try {
    // Only send non-empty filters
    const params = { page: pg, limit: 20 };
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) params[k] = v;
    });

    const res = await studentService.getAll(params);
    const data = res.data.data;

    // Handle both array and paginated response
    if (Array.isArray(data)) {
      setStudents(data);
      setTotal(data.length);
      setTotalPages(1);
    } else {
      setStudents(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    }
  } catch (err) {
    console.error('fetchStudents error:', err.response?.data || err.message);
    toast.error(err.response?.data?.message || 'Failed to load students');
    setStudents([]);
    setTotal(0);
  } finally {
    setLoading(false);
  }
}, [filters]);

  useEffect(() => { fetchStudents(1); setPage(1); }, [filters]);

  const setFilter = (key, val) =>
    setFilters(prev => ({ ...prev, [key]: val }));

  const resetFilters = () => {
    setFilters({
      academicYearId: '', departmentId: '', batchId: '',
      year: '', semesterId: '', sectionId: '',
      status: 'ACTIVE', search: '',
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await studentService.delete(deleteId);
      toast.success('Student deleted');
      setDeleteId(null);
      fetchStudents(page);
    } catch {
      toast.error('Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

const handleExport = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

    const res = await fetch(
      `http://localhost:5000/api/students/export?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) { toast.error('Export failed'); return; }

    const blob = await res.blob();
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'students.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Students exported successfully');
  } catch {
    toast.error('Export failed');
  }
};

  const toggleSelect = id =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelected(
      selected.length === students.length ? [] : students.map(s => s.id)
    );

  const activeFilterCount = Object.entries(filters)
    .filter(([k, v]) => v && k !== 'status').length;

  return (
    <div className="space-y-5">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/home' },
        { label: 'Student Management' },
      ]} />

      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white
            flex items-center gap-2">
            <MdPeople className="text-indigo-600" size={28} />
            Student Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {total} student{total !== 1 ? 's' : ''} found
            {filters.departmentId && departments.find(d => d.id === filters.departmentId)
              ? ` in ${departments.find(d => d.id === filters.departmentId)?.name}`
              : ''}
</p>
        </div>
      </div>

      {/* ── Filters panel ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border
        border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* Filter header */}
        <div className="flex items-center justify-between px-5 py-3
          border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowFilters(p => !p)}
            className="flex items-center gap-2 text-sm font-semibold
              text-gray-600 dark:text-gray-300">
            <MdFilterList size={18} className="text-indigo-500" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs
                w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <button onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-red-500
                  hover:text-red-600 font-medium">
                <MdClose size={14} /> Clear all
              </button>
            )}
            <button onClick={() => fetchStudents(1)}
              className="flex items-center gap-1 text-xs text-gray-500
                hover:text-indigo-600 font-medium">
              <MdRefresh size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Filter body */}
        {showFilters && (
          <div className="p-5 space-y-4">
            {/* Row 1 — Academic filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Academic Year */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400
                  uppercase tracking-wider mb-1">Academic Year</label>
                <select value={filters.academicYearId}
                  onChange={e => setFilter('academicYearId', e.target.value)}
                  className={inputClass}>
                  <option value="">All Years</option>
                  {academicYears.map(ay => (
                    <option key={ay.id} value={ay.id}>{ay.name}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400
                  uppercase tracking-wider mb-1">Department</label>
                <select value={filters.departmentId}
                  onChange={e => setFilter('departmentId', e.target.value)}
                  className={inputClass}>
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Batch */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400
                  uppercase tracking-wider mb-1">Batch</label>
                <select value={filters.batchId}
                  onChange={e => setFilter('batchId', e.target.value)}
                  className={inputClass}
                  disabled={!filters.departmentId}>
                  <option value="">All Batches</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Year Level */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400
                  uppercase tracking-wider mb-1">Year Level</label>
                <select value={filters.year}
                  onChange={e => setFilter('year', e.target.value)}
                  className={inputClass}>
                  <option value="">All Years</option>
                  {[1,2,3,4,5].map(y => (
                    <option key={y} value={y}>Year {['I','II','III','IV','V'][y-1]}</option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400
                  uppercase tracking-wider mb-1">Semester</label>
                <select value={filters.semesterId}
                  onChange={e => setFilter('semesterId', e.target.value)}
                  className={inputClass}
                  disabled={!filters.batchId}>
                  <option value="">All Semesters</option>
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400
                  uppercase tracking-wider mb-1">Section</label>
                <select value={filters.sectionId}
                  onChange={e => setFilter('sectionId', e.target.value)}
                  className={inputClass}
                  disabled={!filters.batchId}>
                  <option value="">All Sections</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2 — Status + Search */}
            <div className="flex gap-3 flex-wrap">
              {/* Status */}
              <div className="w-44">
                <label className="block text-[10px] font-bold text-gray-400
                  uppercase tracking-wider mb-1">Status</label>
                <select value={filters.status}
                  onChange={e => setFilter('status', e.target.value)}
                  className={inputClass}>
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="GRADUATED">Graduated</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex-1 min-w-48">
                <label className="block text-[10px] font-bold text-gray-400
                  uppercase tracking-wider mb-1">Search Student</label>
                <div className="relative">
                  <MdSearch size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={e => setFilter('search', e.target.value)}
                    placeholder="Search by name, ID, email..."
                    className={`${inputClass} pl-9`}
                  />
                  {filters.search && (
                    <button onClick={() => setFilter('search', '')}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                        text-gray-400 hover:text-gray-600">
                      <MdClose size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Active filter tags */}
            {activeFilterCount > 0 && (
              <div className="flex gap-2 flex-wrap">
                {filters.departmentId && (
                  <span className="flex items-center gap-1 text-xs bg-indigo-100
                    text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400
                    px-2.5 py-1 rounded-full font-medium">
                    Dept: {departments.find(d => d.id === filters.departmentId)?.name}
                    <button onClick={() => setFilter('departmentId', '')}>
                      <MdClose size={12} />
                    </button>
                  </span>
                )}
                {filters.batchId && (
                  <span className="flex items-center gap-1 text-xs bg-cyan-100
                    text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400
                    px-2.5 py-1 rounded-full font-medium">
                    Batch: {batches.find(b => b.id === filters.batchId)?.name}
                    <button onClick={() => setFilter('batchId', '')}>
                      <MdClose size={12} />
                    </button>
                  </span>
                )}
                {filters.year && (
                  <span className="flex items-center gap-1 text-xs bg-purple-100
                    text-purple-700 dark:bg-purple-900/30 dark:text-purple-400
                    px-2.5 py-1 rounded-full font-medium">
                    {YEAR_LABELS[filters.year]}
                    <button onClick={() => setFilter('year', '')}>
                      <MdClose size={12} />
                    </button>
                  </span>
                )}
                {filters.sectionId && (
                  <span className="flex items-center gap-1 text-xs bg-emerald-100
                    text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400
                    px-2.5 py-1 rounded-full font-medium">
                    Section: {sections.find(s => s.id === filters.sectionId)?.name}
                    <button onClick={() => setFilter('sectionId', '')}>
                      <MdClose size={12} />
                    </button>
                  </span>
                )}
                {filters.search && (
                  <span className="flex items-center gap-1 text-xs bg-amber-100
                    text-amber-700 dark:bg-amber-900/30 dark:text-amber-400
                    px-2.5 py-1 rounded-full font-medium">
                    Search: "{filters.search}"
                    <button onClick={() => setFilter('search', '')}>
                      <MdClose size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Student Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border
        border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* Table header bar */}
        <div className="flex items-center justify-between px-5 py-3
          border-b border-gray-100 dark:border-gray-700
          bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center gap-3">
            <input type="checkbox"
              checked={selected.length === students.length && students.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-indigo-600 cursor-pointer"
            />
            {selected.length > 0 && (
              <span className="text-xs font-semibold text-indigo-600">
                {selected.length} selected
              </span>
            )}
            {!loading && (
              <span className="text-xs text-gray-400">
                Showing {students.length} of {total} students
              </span>
            )}
          </div>
          {selected.length > 0 && (
            <button className="text-xs text-red-500 hover:text-red-600
              font-semibold flex items-center gap-1">
              <MdDelete size={14} /> Delete selected
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500
              border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-500 text-sm">Loading students...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700
              flex items-center justify-center text-3xl mb-3">👥</div>
            <p className="text-gray-500 dark:text-gray-400 font-semibold">
              No students found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your filters or add new students
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={resetFilters}
                className="text-sm text-indigo-600 underline font-medium">
                Clear filters
              </button>
              <button onClick={() => navigate('/students/new')}
                className="px-4 py-2 bg-indigo-600 text-white text-sm
                  font-semibold rounded-xl">
                Add Student
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox"
                      checked={selected.length === students.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-white cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-14">
                    Photo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {students.map((student, i) => {
                  const isChecked = selected.includes(student.id);
                  return (
                    <tr key={student.id}
                      className={`transition-colors
                        ${isChecked
                          ? 'bg-indigo-50 dark:bg-indigo-900/20'
                          : i % 2 === 0
                            ? 'bg-white dark:bg-gray-800'
                            : 'bg-gray-50/50 dark:bg-gray-800/50'
                        }
                        hover:bg-indigo-50/70 dark:hover:bg-indigo-900/20`}>

                      {/* Checkbox */}
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(student.id)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />
                      </td>

                      {/* Photo */}
                      <td className="px-4 py-3">
                        {student.photo ? (
                          <img src={student.photo} alt=""
                            className="w-9 h-9 rounded-full object-cover
                              border-2 border-indigo-200 shadow-sm" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br
                            from-indigo-400 to-indigo-600 flex items-center
                            justify-center text-white text-sm font-bold
                            border-2 border-indigo-200 shadow-sm">
                            {student.User?.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </td>

                      {/* Student ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-indigo-600
                          bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-lg">
                          {student.studentCode}
                        </span>
                      </td>

                      {/* Full Name */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white
                            whitespace-nowrap">
                            {student.User?.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">
                            {student.User?.email}
                          </p>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600 dark:text-gray-300
                          whitespace-nowrap">
                          {student.Department?.name ?? '—'}
                        </span>
                      </td>

                      {/* Batch */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-gray-600
                          dark:text-gray-300 whitespace-nowrap">
                          {student.Batch?.name ?? student.Batch?.year ?? '—'}
                        </span>
                      </td>

                      {/* Year */}
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full
                          bg-purple-100 text-purple-700 dark:bg-purple-900/30
                          dark:text-purple-400 font-semibold whitespace-nowrap">
                          {student.AcademicYear?.name ??
                            (student.year ? YEAR_LABELS[student.year] : '—')}
                        </span>
                      </td>

                      {/* Semester */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400
                          whitespace-nowrap">
                          {student.Semester?.name ??
                            (student.semester ? SEM_LABELS[student.semester] : '—')}
                        </span>
                      </td>

                      {/* Section */}
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full
                          bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30
                          dark:text-cyan-400 font-semibold">
                          {student.Section?.name ?? '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full
                          font-semibold whitespace-nowrap
                          ${STATUS_COLORS[student.status] ?? STATUS_COLORS.INACTIVE}`}>
                          {student.status}
                        </span>
                      </td>

                     {/* Actions */}
<td className="px-4 py-3">
  <div className="flex items-center justify-center gap-1.5">
    <button
      onClick={() => navigate(`/students/${student.id}`)}
      title="View Profile"
      className="p-1.5 rounded-lg text-blue-600
        hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
      <MdVisibility size={17} />
    </button>
    <button
      onClick={() => navigate(`/students/${student.id}/edit`)}
      title="Edit Student"
      className="p-1.5 rounded-lg text-indigo-600
        hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
      <MdEdit size={17} />
    </button>
    <button
      onClick={() => setDeleteId(student.id)}
      title="Delete Student"
      className="p-1.5 rounded-lg text-red-500
        hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
      <MdDelete size={17} />
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

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700
            flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Page {page} of {totalPages} · {total} total students
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={pg => { setPage(pg); fetchStudents(pg); }}
            />
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl
            shadow-2xl p-6 w-full max-w-sm z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30
              flex items-center justify-center text-3xl mx-auto mb-4">
              🗑️
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white
              text-center mb-2">
              Delete Student
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              This will permanently delete the student and all their attendance
              records. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600
                  text-gray-600 dark:text-gray-300 text-sm font-semibold
                  rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white
                  text-sm font-semibold rounded-xl disabled:opacity-60">
                {deleting ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}