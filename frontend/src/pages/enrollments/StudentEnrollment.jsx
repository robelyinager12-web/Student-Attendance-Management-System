import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { studentEnrollmentService } from '../../services/studentEnrollment.service';
import { departmentService } from '../../services/department.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatDate';
import api from '../../services/api';
import {
  MdAdd, MdDelete, MdPeople, MdBook,
  MdSearch, MdRefresh, MdCheckCircle,
  MdFilterList, MdGroup,
} from 'react-icons/md';

const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
  focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`;

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  DROPPED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

// ── Enroll Single Student Form ───────────────────────────────────────────────
function EnrollStudentForm({ onSuccess, onCancel }) {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    departmentService.getAll()
      .then((r) => setDepartments(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedDept) { setCourses([]); setBatches([]); return; }
    api.get(`/courses?departmentId=${selectedDept}`)
      .then((r) => setCourses(r.data.data)).catch(() => {});
    api.get(`/batches?departmentId=${selectedDept}`)
      .then((r) => setBatches(r.data.data)).catch(() => {});
  }, [selectedDept]);

  useEffect(() => {
    if (!selectedBatch) { setSections([]); setSemesters([]); return; }
    api.get(`/sections?batchId=${selectedBatch}`)
      .then((r) => setSections(r.data.data)).catch(() => {});
    api.get(`/academic-years?batchId=${selectedBatch}`)
      .then((r) => {
        const current = r.data.data.find((ay) => ay.isCurrent) || r.data.data[0];
        if (current) {
          api.get(`/semesters?academicYearId=${current.id}`)
            .then((s) => setSemesters(s.data.data)).catch(() => {});
        }
      }).catch(() => {});
  }, [selectedBatch]);

  useEffect(() => {
    if (!selectedSection) { setStudents([]); return; }
    const params = `sectionId=${selectedSection}&limit=200`;
    const search = studentSearch ? `&search=${studentSearch}` : '';
    api.get(`/students?${params}${search}`)
      .then((r) => setStudents(r.data.data.items || [])).catch(() => {});
  }, [selectedSection, studentSearch]);

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedCourse) {
      return toast.error('Student and course are required');
    }
    setSubmitting(true);
    try {
      await studentEnrollmentService.enroll({
        studentId: selectedStudent,
        courseId: selectedCourse,
        sectionId: selectedSection || undefined,
        batchId: selectedBatch || undefined,
        semesterId: selectedSemester || undefined,
      });
      toast.success('Student enrolled successfully');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Department *</label>
          <select value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setSelectedBatch(''); }}
            className={inputClass}>
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Course *</label>
          <select value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={inputClass}
            disabled={!selectedDept}>
            <option value="">
              {!selectedDept ? 'Select department first' : 'Select course'}
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Batch</label>
          <select value={selectedBatch}
            onChange={(e) => { setSelectedBatch(e.target.value); setSelectedSection(''); }}
            className={inputClass}
            disabled={!selectedDept}>
            <option value="">Select batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Section</label>
          <select value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className={inputClass}
            disabled={!selectedBatch}>
            <option value="">Select section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Semester</label>
          <select value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className={inputClass}
            disabled={!selectedBatch}>
            <option value="">Select semester</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Student *</label>
          <input
            type="text"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="Search student..."
            className={`${inputClass} mb-2`}
            disabled={!selectedSection}
          />
          <select value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className={inputClass}
            disabled={!selectedSection}>
            <option value="">
              {!selectedSection ? 'Select section first' : 'Select student'}
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.User?.name} ({s.studentCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t
        border-gray-100 dark:border-gray-700">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-200
            dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedStudent || !selectedCourse}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
            text-white text-sm font-medium rounded-lg disabled:opacity-60">
          {submitting ? 'Enrolling...' : 'Enroll Student'}
        </button>
      </div>
    </div>
  );
}

// ── Enroll Entire Section Form ────────────────────────────────────────────────
function EnrollSectionForm({ onSuccess, onCancel }) {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    departmentService.getAll()
      .then((r) => setDepartments(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedDept) { setCourses([]); setBatches([]); return; }
    api.get(`/courses?departmentId=${selectedDept}`)
      .then((r) => setCourses(r.data.data)).catch(() => {});
    api.get(`/batches?departmentId=${selectedDept}`)
      .then((r) => setBatches(r.data.data)).catch(() => {});
  }, [selectedDept]);

  useEffect(() => {
    if (!selectedBatch) { setSections([]); setSemesters([]); return; }
    api.get(`/sections?batchId=${selectedBatch}`)
      .then((r) => setSections(r.data.data)).catch(() => {});
    api.get(`/academic-years?batchId=${selectedBatch}`)
      .then((r) => {
        const current = r.data.data.find((ay) => ay.isCurrent) || r.data.data[0];
        if (current) {
          api.get(`/semesters?academicYearId=${current.id}`)
            .then((s) => setSemesters(s.data.data)).catch(() => {});
        }
      }).catch(() => {});
  }, [selectedBatch]);

  useEffect(() => {
    if (!selectedSection) { setPreview(null); return; }
    api.get(`/students?sectionId=${selectedSection}&limit=200`)
      .then((r) => setPreview(r.data.data.items || [])).catch(() => {});
  }, [selectedSection]);

  const handleSubmit = async () => {
    if (!selectedSection || !selectedCourse) {
      return toast.error('Section and course are required');
    }
    setSubmitting(true);
    try {
      const res = await studentEnrollmentService.enrollSection({
        courseId: selectedCourse,
        sectionId: selectedSection,
        batchId: selectedBatch || undefined,
        semesterId: selectedSemester || undefined,
      });
      const data = res.data.data;
      toast.success(
        `Enrolled ${data.enrolled} students. ${data.skipped} already enrolled.`
      );
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll section');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">
          Enroll all students in a section into one course at once
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Department *</label>
          <select value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setSelectedBatch(''); }}
            className={inputClass}>
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Course *</label>
          <select value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={inputClass}
            disabled={!selectedDept}>
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Batch *</label>
          <select value={selectedBatch}
            onChange={(e) => { setSelectedBatch(e.target.value); setSelectedSection(''); }}
            className={inputClass}
            disabled={!selectedDept}>
            <option value="">Select batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Section *</label>
          <select value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className={inputClass}
            disabled={!selectedBatch}>
            <option value="">Select section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Semester</label>
          <select value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className={inputClass}
            disabled={!selectedBatch}>
            <option value="">Select semester</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      {preview !== null && (
        <div className={`p-4 rounded-xl border ${
          preview.length > 0
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center gap-2">
            {preview.length > 0
              ? <MdCheckCircle size={20} className="text-green-600 shrink-0" />
              : <MdPeople size={20} className="text-yellow-600 shrink-0" />
            }
            <p className={`text-sm font-medium ${
              preview.length > 0
                ? 'text-green-700 dark:text-green-400'
                : 'text-yellow-700 dark:text-yellow-400'
            }`}>
              {preview.length > 0
                ? `${preview.length} students will be enrolled from this section`
                : 'No active students found in this section'
              }
            </p>
          </div>
          {preview.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {preview.slice(0, 8).map((s) => (
                <span key={s.id} className="text-xs bg-white dark:bg-gray-700
                  text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full
                  border border-green-200 dark:border-green-800">
                  {s.User?.name}
                </span>
              ))}
              {preview.length > 8 && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  +{preview.length - 8} more
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2 border-t
        border-gray-100 dark:border-gray-700">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-200
            dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedSection || !selectedCourse ||
            preview?.length === 0}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
            text-white text-sm font-medium rounded-lg disabled:opacity-60">
          {submitting
            ? 'Enrolling...'
            : `Enroll ${preview?.length || 0} Students`
          }
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function StudentEnrollmentPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [modal, setModal] = useState(null);
  const [page, setPage] = useState(1);

  // Filter state
  const [filters, setFilters] = useState({
    courseId: '',
    sectionId: '',
    batchId: '',
    semesterId: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(true);

  // Dropdown options
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    departmentService.getAll()
      .then((r) => setDepartments(r.data.data)).catch(() => {});
    api.get('/courses').then((r) => setCourses(r.data.data)).catch(() => {});
    api.get('/batches').then((r) => setBatches(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!filters.batchId) { setSections([]); setSemesters([]); return; }
    api.get(`/sections?batchId=${filters.batchId}`)
      .then((r) => setSections(r.data.data)).catch(() => {});
    api.get(`/academic-years?batchId=${filters.batchId}`)
      .then((r) => {
        const current = r.data.data.find((ay) => ay.isCurrent) || r.data.data[0];
        if (current) {
          api.get(`/semesters?academicYearId=${current.id}`)
            .then((s) => setSemesters(s.data.data)).catch(() => {});
        }
      }).catch(() => {});
  }, [filters.batchId]);

  const fetchEnrollments = useCallback(async (currentPage = page) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 20 };
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      const res = await studentEnrollmentService.getAll(params);
      setEnrollments(res.data.data.enrollments);
      setPagination(res.data.data.pagination);
      setSearched(true);
    } catch (err) {
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const handleSearch = () => {
    setPage(1);
    fetchEnrollments(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchEnrollments(newPage);
  };

  const handleReset = () => {
    setFilters({
      courseId: '', sectionId: '',
      batchId: '', semesterId: '', status: '',
    });
    setEnrollments([]);
    setPagination(null);
    setSearched(false);
    setPage(1);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await studentEnrollmentService.update(id, { status });
      toast.success(`Enrollment ${status.toLowerCase()}`);
      fetchEnrollments(page);
    } catch (err) {
      toast.error('Failed to update enrollment');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this enrollment?')) return;
    try {
      await studentEnrollmentService.remove(id);
      toast.success('Enrollment removed');
      fetchEnrollments(page);
    } catch (err) {
      toast.error('Failed to remove enrollment');
    }
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Student Enrollments' },
      ]} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Student Enrollments
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Enroll students into courses by section or individually
          </p>
        </div>
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
          <button
            onClick={() => setModal('section')}
            className="flex items-center gap-2 px-4 py-2 border border-indigo-600
              text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20
              text-sm font-medium rounded-lg"
          >
            <MdGroup size={18} /> Enroll Section
          </button>
          <button
            onClick={() => setModal('single')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600
              hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
          >
            <MdAdd size={18} /> Enroll Student
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            Filter Enrollments
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">Course</label>
              <select
                value={filters.courseId}
                onChange={(e) => setFilters((p) => ({ ...p, courseId: e.target.value }))}
                className={inputClass}>
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">Batch</label>
              <select
                value={filters.batchId}
                onChange={(e) => setFilters((p) => ({
                  ...p, batchId: e.target.value, sectionId: '',
                }))}
                className={inputClass}>
                <option value="">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">Section</label>
              <select
                value={filters.sectionId}
                onChange={(e) => setFilters((p) => ({ ...p, sectionId: e.target.value }))}
                className={inputClass}
                disabled={!filters.batchId}>
                <option value="">All Sections</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">Semester</label>
              <select
                value={filters.semesterId}
                onChange={(e) => setFilters((p) => ({ ...p, semesterId: e.target.value }))}
                className={inputClass}
                disabled={!filters.batchId}>
                <option value="">All Semesters</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                className={inputClass}>
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="DROPPED">Dropped</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
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

      {/* ── Results ── */}
      {searched && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 overflow-hidden">

          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {pagination?.total ?? 0} enrollments found
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-500
                border-t-transparent rounded-full animate-spin" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-16">
              <MdBook size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No enrollments found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your filters or enroll some students
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b
                    border-gray-100 dark:border-gray-700">
                    {[
                      'Student', 'Student ID', 'Course',
                      'Section', 'Batch', 'Semester',
                      'Enrolled', 'Status', 'Actions',
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
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-700
                          dark:text-gray-200 whitespace-nowrap">
                          {enrollment.Student?.User?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {enrollment.Student?.User?.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400
                        text-xs whitespace-nowrap">
                        {enrollment.Student?.studentCode}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 dark:text-gray-300
                          whitespace-nowrap">
                          {enrollment.Course?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {enrollment.Course?.code}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400
                        whitespace-nowrap">
                        {enrollment.Section?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400
                        whitespace-nowrap">
                        {enrollment.Batch?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400
                        whitespace-nowrap">
                        {enrollment.Semester?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400
                        text-xs whitespace-nowrap">
                        {formatDate(enrollment.enrolledAt)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={enrollment.status}
                          onChange={(e) =>
                            handleStatusChange(enrollment.id, e.target.value)
                          }
                          className={`text-xs px-2 py-1 rounded-full font-medium
                            border-0 cursor-pointer
                            ${statusColors[enrollment.status]}`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="DROPPED">DROPPED</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemove(enrollment.id)}
                          className="p-1.5 rounded-lg text-red-500
                            hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Remove enrollment"
                        >
                          <MdDelete size={16} />
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

      {/* Initial empty state */}
      {!searched && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-16 text-center">
          <MdBook size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Search enrollments or enroll new students
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => setModal('section')}
              className="flex items-center gap-2 px-4 py-2 border
                border-indigo-600 text-indigo-600 hover:bg-indigo-50
                dark:hover:bg-indigo-900/20 text-sm font-medium rounded-lg"
            >
              <MdGroup size={18} /> Enroll Whole Section
            </button>
            <button
              onClick={() => setModal('single')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600
                hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
            >
              <MdAdd size={18} /> Enroll One Student
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <Modal
        isOpen={modal === 'single'}
        onClose={() => setModal(null)}
        title="Enroll Student in Course"
        size="xl"
      >
        <EnrollStudentForm
          onSuccess={() => { setModal(null); fetchEnrollments(page); }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal
        isOpen={modal === 'section'}
        onClose={() => setModal(null)}
        title="Enroll Entire Section in Course"
        size="xl"
      >
        <EnrollSectionForm
          onSuccess={() => { setModal(null); fetchEnrollments(page); }}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  );
}

export default StudentEnrollmentPage;