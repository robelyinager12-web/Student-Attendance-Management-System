import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { departmentService } from '../../services/department.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import {
  MdAdd, MdSearch, MdEdit, MdDelete, MdVisibility,
  MdDownload, MdUpload, MdClose, MdAssignment,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

function CourseForm({ initialData, departments, onSuccess, onCancel }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  useEffect(() => { if (initialData) reset(initialData); else reset({}); }, [initialData]);
  const onSubmit = async (data) => {
    try {
      if (initialData) { await api.put(`/courses/${initialData.id}`, data); toast.success('Course updated'); }
      else             { await api.post('/courses', data);                  toast.success('Course created'); }
      onSuccess?.();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Name *</label>
          <input {...register('name', { required: true })} className={inputClass} placeholder="Data Structures" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code *</label>
          <input {...register('code', { required: true })} className={inputClass} placeholder="SWE201" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label>
          <select {...register('departmentId', { required: true })} className={inputClass}>
            <option value="">Select department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credit Hours</label>
          <input type="number" min="1" max="6" {...register('creditHour')} className={inputClass} placeholder="3" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year Level</label>
          <select {...register('yearLevel')} className={inputClass}>
            <option value="">Select year</option>
            {[1,2,3,4].map(y => <option key={y} value={y}>Year {['I','II','III','IV'][y-1]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
          <select {...register('semester')} className={inputClass}>
            <option value="">Select semester</option>
            <option value="1">Semester I</option>
            <option value="2">Semester II</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea {...register('description')} rows={2} className={`${inputClass} resize-none`} />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save Course'}
        </button>
      </div>
    </form>
  );
}

const YEAR_LABELS = { '1': 'Year I', '2': 'Year II', '3': 'Year III', '4': 'Year IV' };
const SEM_LABELS  = { '1': 'Sem I',  '2': 'Sem II' };
const CREDIT_COLORS = ['','bg-blue-100 text-blue-700','bg-indigo-100 text-indigo-700',
  'bg-purple-100 text-purple-700','bg-rose-100 text-rose-700'];

export default function CourseList() {
  const [courses,     setCourses]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);
  const [filters, setFilters] = useState({ departmentId: '', semester: '', search: '' });

  useEffect(() => {
    departmentService.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
  }, []);

  const fetchCourses = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 20 };
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.semester)     params.semester     = filters.semester;
      if (filters.search)       params.search       = filters.search;
      const res = await api.get('/courses', { params });
      const data = res.data.data;
      setCourses(Array.isArray(data) ? data : data.items || data);
      setTotal(data.total || (Array.isArray(data) ? data.length : 0));
      setTotalPages(data.totalPages || 1);
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchCourses(1); setPage(1); }, [filters]);

  const handleDelete = async () => {
    try { await api.delete(`/courses/${deleteId}`); toast.success('Course deleted'); setDeleteId(null); fetchCourses(page); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/home' }, { label: 'Course Management' }]} />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <MdAssignment className="text-rose-600" size={28} /> Course Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} courses total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold rounded-xl"><MdUpload size={18} /> Import</button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm font-semibold rounded-xl"><MdDownload size={18} /> Export</button>
          <button onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-md">
            <MdAdd size={18} /> Add Course
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Department</label>
            <select value={filters.departmentId} onChange={e => setFilters(p => ({ ...p, departmentId: e.target.value }))} className={inputClass}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Semester</label>
            <select value={filters.semester} onChange={e => setFilters(p => ({ ...p, semester: e.target.value }))} className={inputClass}>
              <option value="">All Semesters</option>
              <option value="1">Semester I</option>
              <option value="2">Semester II</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Search Course</label>
            <div className="relative">
              <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                placeholder="Search by course name or code..." className={`${inputClass} pl-9`} />
              {filters.search && <button onClick={() => setFilters(p => ({ ...p, search: '' }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><MdClose size={16} /></button>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-rose-600 text-white">
                  {['Code','Course Name','Department','Year','Semester','Credits','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {courses.map((course, i) => (
                  <tr key={course.id} className={`transition-colors hover:bg-rose-50/60
                    ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">{course.code}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white whitespace-nowrap">{course.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{course.Department?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {YEAR_LABELS[course.yearLevel] ?? YEAR_LABELS[course.year] ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {SEM_LABELS[course.semester] ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                        ${CREDIT_COLORS[course.creditHour] ?? CREDIT_COLORS[3]}`}>
                        {course.creditHour ?? '—'} cr
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-700">Active</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setEditing(course); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50"><MdEdit size={17} /></button>
                        <button onClick={() => setDeleteId(course.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><MdDelete size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No courses found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={pg => { setPage(pg); fetchCourses(pg); }} />
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Course' : 'Add Course'} size="lg">
        <CourseForm initialData={editing} departments={departments}
          onSuccess={() => { setShowModal(false); setEditing(null); fetchCourses(page); }}
          onCancel={() => { setShowModal(false); setEditing(null); }} />
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">🗑️</div>
            <h3 className="text-base font-bold text-center mb-2">Delete Course</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}