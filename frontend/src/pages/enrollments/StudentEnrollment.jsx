import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { studentEnrollmentService } from '../../services/studentEnrollment.service';
import { departmentService } from '../../services/department.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import {
  MdAdd, MdSearch, MdDelete, MdVisibility,
  MdDownload, MdUpload, MdClose, MdPeople,
  MdFilterList, MdRefresh, MdGroup,
  MdCheckCircle, MdWarning,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
  disabled:opacity-50 disabled:cursor-not-allowed`;

const STATUS_COLORS = {
  ACTIVE:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  DROPPED:   'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400',
  COMPLETED: 'bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-400',
};

// ── Single Enroll Form ───────────────────────────────────────────────────────
function EnrollStudentForm({ onSuccess, onCancel }) {
  const [departments,   setDepartments]   = useState([]);
  const [courses,       setCourses]       = useState([]);
  const [batches,       setBatches]       = useState([]);
  const [sections,      setSections]      = useState([]);
  const [semesters,     setSemesters]     = useState([]);
  const [students,      setStudents]      = useState([]);
  const [selectedDept,  setSelectedDept]  = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSec,   setSelectedSec]   = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [form, setForm] = useState({ studentId: '', courseId: '', sectionId: '', batchId: '', semesterId: '' });

  useEffect(() => {
    departmentService.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedDept) { setCourses([]); setBatches([]); return; }
    api.get(`/courses?departmentId=${selectedDept}`).then(r => setCourses(r.data.data)).catch(() => {});
    api.get(`/batches?departmentId=${selectedDept}`).then(r => setBatches(r.data.data)).catch(() => {});
  }, [selectedDept]);

  useEffect(() => {
    if (!selectedBatch) { setSections([]); setSemesters([]); return; }
    api.get(`/sections?batchId=${selectedBatch}`).then(r => setSections(r.data.data)).catch(() => {});
    api.get(`/academic-years?batchId=${selectedBatch}`).then(r => {
      const cur = r.data.data.find(ay => ay.isCurrent) || r.data.data[0];
      if (cur) api.get(`/semesters?academicYearId=${cur.id}`).then(s => setSemesters(s.data.data)).catch(() => {});
    }).catch(() => {});
    setForm(p => ({ ...p, batchId: selectedBatch }));
  }, [selectedBatch]);

  useEffect(() => {
    if (!selectedSec) { setStudents([]); return; }
    const q = studentSearch ? `&search=${studentSearch}` : '';
    api.get(`/students?sectionId=${selectedSec}&limit=200${q}`)
      .then(r => setStudents(r.data.data.items || [])).catch(() => {});
    setForm(p => ({ ...p, sectionId: selectedSec }));
  }, [selectedSec, studentSearch]);

  const handleSubmit = async () => {
    if (!form.studentId || !form.courseId) return toast.error('Student and course are required');
    setSubmitting(true);
    try {
      await studentEnrollmentService.enroll(form);
      toast.success('Student enrolled successfully');
      onSuccess?.();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to enroll'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</div>
          <span className="text-indigo-600">Select Filters</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
            ${selectedSec ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          <span className={selectedSec ? 'text-indigo-600' : ''}>Pick Student & Course</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
            ${form.studentId && form.courseId ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          <span className={form.studentId && form.courseId ? 'text-indigo-600' : ''}>Confirm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Department *</label>
          <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className={inputClass}>
            <option value="">Select department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Course *</label>
          <select value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} className={inputClass} disabled={!selectedDept}>
            <option value="">{!selectedDept ? 'Select department first' : 'Select course'}</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Batch</label>
          <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className={inputClass} disabled={!selectedDept}>
            <option value="">{!selectedDept ? 'Select department first' : 'Select batch'}</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section</label>
          <select value={selectedSec} onChange={e => setSelectedSec(e.target.value)} className={inputClass} disabled={!selectedBatch}>
            <option value="">{!selectedBatch ? 'Select batch first' : 'Select section'}</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Semester</label>
          <select value={form.semesterId} onChange={e => setForm(p => ({ ...p, semesterId: e.target.value }))} className={inputClass} disabled={!selectedBatch}>
            <option value="">Select semester</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Student *</label>
          <input type="text" value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
            placeholder="Search student name..." className={`${inputClass} mb-1.5`} disabled={!selectedSec} />
          <select value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))} className={inputClass} disabled={!selectedSec}>
            <option value="">{!selectedSec ? 'Select section first' : `${students.length} students available`}</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.User?.name} ({s.studentCode})</option>)}
          </select>
        </div>
      </div>

      {/* Preview card */}
      {form.studentId && form.courseId && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MdCheckCircle size={14} /> Enrollment Preview
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
            <div><span className="font-semibold">Student:</span> {students.find(s => s.id === form.studentId)?.User?.name}</div>
            <div><span className="font-semibold">Course:</span> {courses.find(c => c.id === form.courseId)?.name}</div>
            <div><span className="font-semibold">Batch:</span> {batches.find(b => b.id === selectedBatch)?.name ?? '—'}</div>
            <div><span className="font-semibold">Section:</span> {sections.find(s => s.id === selectedSec)?.name ?? '—'}</div>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
        <button onClick={onCancel} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting || !form.studentId || !form.courseId}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60 flex items-center gap-2">
          {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enrolling...</> : <><MdCheckCircle size={16} /> Enroll Student</>}
        </button>
      </div>
    </div>
  );
}

// ── Bulk Section Enroll Form ─────────────────────────────────────────────────
function BulkEnrollForm({ onSuccess, onCancel }) {
  const [departments,   setDepartments]   = useState([]);
  const [courses,       setCourses]       = useState([]);
  const [batches,       setBatches]       = useState([]);
  const [sections,      setSections]      = useState([]);
  const [semesters,     setSemesters]     = useState([]);
  const [preview,       setPreview]       = useState(null);
  const [selectedDept,  setSelectedDept]  = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [form, setForm] = useState({ courseId: '', sectionId: '', batchId: '', semesterId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    departmentService.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedDept) return;
    api.get(`/courses?departmentId=${selectedDept}`).then(r => setCourses(r.data.data)).catch(() => {});
    api.get(`/batches?departmentId=${selectedDept}`).then(r => setBatches(r.data.data)).catch(() => {});
  }, [selectedDept]);

  useEffect(() => {
    if (!selectedBatch) return;
    api.get(`/sections?batchId=${selectedBatch}`).then(r => setSections(r.data.data)).catch(() => {});
    api.get(`/academic-years?batchId=${selectedBatch}`).then(r => {
      const cur = r.data.data.find(ay => ay.isCurrent) || r.data.data[0];
      if (cur) api.get(`/semesters?academicYearId=${cur.id}`).then(s => setSemesters(s.data.data)).catch(() => {});
    }).catch(() => {});
    setForm(p => ({ ...p, batchId: selectedBatch }));
  }, [selectedBatch]);

  useEffect(() => {
    if (!form.sectionId) { setPreview(null); return; }
    api.get(`/students?sectionId=${form.sectionId}&limit=200`)
      .then(r => setPreview(r.data.data.items || [])).catch(() => {});
  }, [form.sectionId]);

  const handleSubmit = async () => {
    if (!form.sectionId || !form.courseId) return toast.error('Section and course are required');
    setSubmitting(true);
    try {
      const res = await studentEnrollmentService.enrollSection(form);
      const data = res.data.data;
      toast.success(`Enrolled ${data.enrolled} students. ${data.skipped} already enrolled.`);
      onSuccess?.();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to enroll section'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-5">
      <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20
        rounded-xl border border-indigo-200 dark:border-indigo-800">
        <p className="text-sm text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-2">
          <MdGroup size={18} /> Enroll all students in a section into one course at once
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Department *</label>
          <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className={inputClass}>
            <option value="">Select department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Course *</label>
          <select value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} className={inputClass} disabled={!selectedDept}>
            <option value="">{!selectedDept ? 'Select department first' : 'Select course'}</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Batch *</label>
          <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className={inputClass} disabled={!selectedDept}>
            <option value="">{!selectedDept ? 'Select department first' : 'Select batch'}</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section *</label>
          <select value={form.sectionId} onChange={e => setForm(p => ({ ...p, sectionId: e.target.value }))} className={inputClass} disabled={!selectedBatch}>
            <option value="">{!selectedBatch ? 'Select batch first' : 'Select section'}</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Semester</label>
          <select value={form.semesterId} onChange={e => setForm(p => ({ ...p, semesterId: e.target.value }))} className={inputClass} disabled={!selectedBatch}>
            <option value="">Select semester</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Preview */}
      {preview !== null && (
        <div className={`p-4 rounded-xl border ${preview.length > 0
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
          <div className="flex items-center gap-2 mb-2">
            {preview.length > 0
              ? <MdCheckCircle size={18} className="text-emerald-600" />
              : <MdWarning size={18} className="text-amber-600" />}
            <p className={`text-sm font-semibold
              ${preview.length > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {preview.length > 0
                ? `${preview.length} students will be enrolled`
                : 'No active students found in this section'}
            </p>
          </div>
          {preview.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {preview.slice(0, 10).map(s => (
                <span key={s.id} className="text-xs bg-white dark:bg-gray-700 text-gray-600
                  dark:text-gray-300 px-2 py-0.5 rounded-full border border-emerald-200
                  dark:border-emerald-800">
                  {s.User?.name}
                </span>
              ))}
              {preview.length > 10 && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 self-center">
                  +{preview.length - 10} more students
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
        <button onClick={onCancel} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting || !form.sectionId || !form.courseId || preview?.length === 0}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60 flex items-center gap-2">
          {submitting
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enrolling...</>
            : <><MdGroup size={16} /> Enroll {preview?.length ?? 0} Students</>}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentEnrollmentPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [searched,    setSearched]    = useState(false);
  const [modal,       setModal]       = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [deleting,    setDeleting]    = useState(false);
  const [page,        setPage]        = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  // Dropdown data
  const [departments,   setDepartments]   = useState([]);
  const [batches,       setBatches]       = useState([]);
  const [sections,      setSections]      = useState([]);
  const [semesters,     setSemesters]     = useState([]);
  const [courses,       setCourses]       = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [filters, setFilters] = useState({
    academicYearId: '', departmentId: '', batchId: '',
    semesterId: '', sectionId: '', courseId: '',
    status: 'ACTIVE', search: '',
  });

  useEffect(() => {
    departmentService.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
    api.get('/academic-years').then(r => setAcademicYears(r.data.data)).catch(() => {});
    api.get('/courses').then(r => setCourses(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!filters.departmentId) { setBatches([]); return; }
    api.get(`/batches?departmentId=${filters.departmentId}`).then(r => setBatches(r.data.data)).catch(() => {});
    api.get(`/courses?departmentId=${filters.departmentId}`).then(r => setCourses(r.data.data)).catch(() => {});
  }, [filters.departmentId]);

  useEffect(() => {
    if (!filters.batchId) { setSections([]); setSemesters([]); return; }
    api.get(`/sections?batchId=${filters.batchId}`).then(r => setSections(r.data.data)).catch(() => {});
    api.get(`/academic-years?batchId=${filters.batchId}`).then(r => {
      const cur = r.data.data.find(ay => ay.isCurrent) || r.data.data[0];
      if (cur) api.get(`/semesters?academicYearId=${cur.id}`).then(s => setSemesters(s.data.data)).catch(() => {});
    }).catch(() => {});
  }, [filters.batchId]);

  const sf = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const fetchEnrollments = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 20 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await studentEnrollmentService.getAll(params);
      setEnrollments(res.data.data.enrollments || []);
      setPagination(res.data.data.pagination);
      setSearched(true);
    } catch { toast.error('Failed to load enrollments'); }
    finally { setLoading(false); }
  }, [filters, page]);

  const handleSearch = () => { setPage(1); fetchEnrollments(1); };
  const handleReset  = () => {
    setFilters({ academicYearId: '', departmentId: '', batchId: '', semesterId: '', sectionId: '', courseId: '', status: 'ACTIVE', search: '' });
    setEnrollments([]); setPagination(null); setSearched(false); setPage(1);
  };

  const handleStatusChange = async (id, status) => {
    try { await studentEnrollmentService.update(id, { status }); toast.success('Status updated'); fetchEnrollments(page); }
    catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await studentEnrollmentService.remove(deleteId); toast.success('Enrollment removed'); setDeleteId(null); fetchEnrollments(page); }
    catch { toast.error('Failed to remove enrollment'); }
    finally { setDeleting(false); }
  };

  // Stats from results
  const activeCount    = enrollments.filter(e => e.status === 'ACTIVE').length;
  const droppedCount   = enrollments.filter(e => e.status === 'DROPPED').length;
  const completedCount = enrollments.filter(e => e.status === 'COMPLETED').length;

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/home' }, { label: 'Student Enrollment Management' }]} />

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <MdPeople className="text-indigo-600" size={28} /> Student Enrollment Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {searched ? `${pagination?.total ?? 0} enrollment records found` : 'Manage course enrollments for all students'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setModal('single')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-semibold rounded-xl shadow-md transition-colors">
            <MdAdd size={18} /> Enroll Student
          </button>
          <button onClick={() => setModal('bulk')}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700
              text-white text-sm font-semibold rounded-xl shadow-md transition-colors">
            <MdGroup size={18} /> Bulk Enrollment
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-cyan-600
            text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-sm font-semibold rounded-xl">
            <MdUpload size={18} /> Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-600
            text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-semibold rounded-xl">
            <MdDownload size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* ── Summary cards (shown after search) ── */}
      {searched && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Records', value: pagination?.total ?? 0, gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
            { label: 'Active',        value: activeCount,            gradient: 'linear-gradient(135deg,#10b981,#059669)' },
            { label: 'Dropped',       value: droppedCount,           gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)' },
            { label: 'Completed',     value: completedCount,         gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
          ].map(c => (
            <div key={c.label} className="rounded-2xl p-4 text-white shadow-lg relative overflow-hidden"
              style={{ background: c.gradient }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{c.label}</p>
              <p className="text-3xl font-extrabold mt-1">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => setShowFilters(p => !p)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <MdFilterList size={18} className="text-indigo-500" />
            Filter Enrollments
          </button>
          <div className="flex gap-3">
            <button onClick={handleReset} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
              <MdClose size={14} /> Reset
            </button>
            <button onClick={() => fetchEnrollments(1)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 font-medium">
              <MdRefresh size={14} /> Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-5 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Academic Year</label>
                <select value={filters.academicYearId} onChange={e => sf('academicYearId', e.target.value)} className={inputClass}>
                  <option value="">All Years</option>
                  {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
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
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Batch</label>
                <select value={filters.batchId} onChange={e => sf('batchId', e.target.value)} className={inputClass} disabled={!filters.departmentId}>
                  <option value="">All Batches</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Semester</label>
                <select value={filters.semesterId} onChange={e => sf('semesterId', e.target.value)} className={inputClass} disabled={!filters.batchId}>
                  <option value="">All Semesters</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Section</label>
                <select value={filters.sectionId} onChange={e => sf('sectionId', e.target.value)} className={inputClass} disabled={!filters.batchId}>
                  <option value="">All Sections</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex gap-3 flex-wrap">
              <div className="w-52">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Course</label>
                <select value={filters.courseId} onChange={e => sf('courseId', e.target.value)} className={inputClass}>
                  <option value="">All Courses</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </select>
              </div>
              <div className="w-36">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                <select value={filters.status} onChange={e => sf('status', e.target.value)} className={inputClass}>
                  <option value="">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DROPPED">Dropped</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex-1 min-w-48">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Search Student</label>
                <div className="relative">
                  <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={filters.search} onChange={e => sf('search', e.target.value)}
                    placeholder="Search by student name or ID..."
                    className={`${inputClass} pl-9`} />
                  {filters.search && (
                    <button onClick={() => sf('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MdClose size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-end">
                <button onClick={handleSearch} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700
                    text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <MdSearch size={18} />}
                  Search
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Results Table ── */}
      {!searched && !loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-4xl mx-auto mb-4">📋</div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold text-lg">Search for Enrollments</p>
          <p className="text-gray-400 text-sm mt-2">Use the filters above and click Search to view enrollment records</p>
          <div className="flex gap-3 justify-center mt-5">
            <button onClick={() => setModal('single')}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl">
              <MdAdd size={18} /> Enroll a Student
            </button>
            <button onClick={() => setModal('bulk')}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl">
              <MdGroup size={18} /> Bulk Enroll Section
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Table bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {loading ? 'Loading...' : `${pagination?.total ?? enrollments.length} enrollment records`}
            </p>
            {pagination && (
              <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.totalPages}</p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-500 text-sm">Loading enrollments...</span>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl mb-3">📋</div>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">No enrollment records found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-indigo-600 text-white">
                    {[
                      'Student ID','Student Name','Department','Program',
                      'Batch','Year','Semester','Section','Course','Status','Actions'
                    ].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {enrollments.map((enrollment, i) => (
                    <tr key={enrollment.id}
                      className={`transition-colors hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20
                        ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>

                      {/* Student ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-indigo-600
                          bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-lg">
                          {enrollment.Student?.studentCode}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600
                            flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {enrollment.Student?.User?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                              {enrollment.Student?.User?.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {enrollment.Student?.User?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {enrollment.Student?.Department?.name ?? '—'}
                      </td>

                      {/* Program */}
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {enrollment.Student?.Program?.code ?? '—'}
                      </td>

                      {/* Batch */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-cyan-700 bg-cyan-100
                          dark:bg-cyan-900/30 dark:text-cyan-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {enrollment.Batch?.name ?? enrollment.Student?.Batch?.name ?? '—'}
                        </span>
                      </td>

                      {/* Year */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-purple-700 bg-purple-100
                          dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {enrollment.Student?.AcademicYear?.name ?? '—'}
                        </span>
                      </td>

                      {/* Semester */}
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {enrollment.Semester?.name ?? '—'}
                      </td>

                      {/* Section */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-teal-700 bg-teal-100
                          dark:bg-teal-900/30 dark:text-teal-400 px-2 py-0.5 rounded-full">
                          {enrollment.Section?.name ?? '—'}
                        </span>
                      </td>

                      {/* Course */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {enrollment.Course?.name}
                          </p>
                          <p className="text-xs font-mono text-rose-600">{enrollment.Course?.code}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <select
                          value={enrollment.status}
                          onChange={e => handleStatusChange(enrollment.id, e.target.value)}
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold cursor-pointer
                            border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500
                            ${STATUS_COLORS[enrollment.status] ?? STATUS_COLORS.ACTIVE}`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="DROPPED">DROPPED</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <button onClick={() => setDeleteId(enrollment.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove enrollment">
                          <MdDelete size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination && pagination.totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} total enrollments
              </p>
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={pg => { setPage(pg); fetchEnrollments(pg); }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Enroll Single Student Modal ── */}
      <Modal isOpen={modal === 'single'} onClose={() => setModal(null)}
        title="Enroll Student in Course" size="xl">
        <EnrollStudentForm
          onSuccess={() => { setModal(null); if (searched) fetchEnrollments(page); }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* ── Bulk Section Enrollment Modal ── */}
      <Modal isOpen={modal === 'bulk'} onClose={() => setModal(null)}
        title="Bulk Enroll — Entire Section" size="xl">
        <BulkEnrollForm
          onSuccess={() => { setModal(null); if (searched) fetchEnrollments(page); }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* ── Remove enrollment confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30
              flex items-center justify-center text-3xl mx-auto mb-4">
              🗑️
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white text-center mb-2">
              Remove Enrollment
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              This will remove the student from this course. Their attendance records will remain.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600
                  text-sm text-gray-600 dark:text-gray-300 font-semibold rounded-xl
                  hover:bg-gray-100 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white
                  text-sm font-semibold rounded-xl disabled:opacity-60">
                {deleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}