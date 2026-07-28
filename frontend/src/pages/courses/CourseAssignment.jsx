import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { courseAssignmentService } from '../../services/courseAssignment.service';
import { departmentService } from '../../services/department.service';
import { teacherService } from '../../services/teacher.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import {
  MdAdd, MdSearch, MdDelete, MdVisibility,
  MdDownload, MdUpload, MdClose, MdAssignment,
  MdToggleOn, MdToggleOff,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

function AssignForm({ departments, onSuccess, onCancel }) {
  const [courses,   setCourses]   = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [batches,   setBatches]   = useState([]);
  const [sections,  setSections]  = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    teacherService.getAll().then(r => setTeachers(r.data.data)).catch(() => {});
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
      const current = r.data.data.find(ay => ay.isCurrent) || r.data.data[0];
      if (current) api.get(`/semesters?academicYearId=${current.id}`).then(s => setSemesters(s.data.data)).catch(() => {});
    }).catch(() => {});
  }, [selectedBatch]);

  const onSubmit = async (data) => {
    try {
      await courseAssignmentService.assign(data);
      toast.success('Course assigned successfully');
      onSuccess?.();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign'); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
          <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className={inputClass}>
            <option value="">Select department first</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course *</label>
          <select {...register('courseId', { required: true })} className={inputClass} disabled={!selectedDept}>
            <option value="">Select course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teacher *</label>
          <select {...register('teacherId', { required: true })} className={inputClass}>
            <option value="">Select teacher</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.User?.name} ({t.teacherCode})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch</label>
          <select {...register('batchId')} onChange={e => setSelectedBatch(e.target.value)} className={inputClass} disabled={!selectedDept}>
            <option value="">All Batches</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
          <select {...register('sectionId')} className={inputClass} disabled={!selectedBatch}>
            <option value="">All Sections</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
          <select {...register('semesterId')} className={inputClass} disabled={!selectedBatch}>
            <option value="">Select semester</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
          {isSubmitting ? 'Assigning...' : 'Assign Course'}
        </button>
      </div>
    </form>
  );
}

export default function CourseAssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers,    setTeachers]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);
  const [filters, setFilters] = useState({ teacherId: '', departmentId: '', search: '' });

  useEffect(() => {
    departmentService.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
    teacherService.getAll().then(r => setTeachers(r.data.data)).catch(() => {});
  }, []);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.teacherId)    params.teacherId    = filters.teacherId;
      if (filters.departmentId) params.departmentId = filters.departmentId;
      const res = await courseAssignmentService.getAll(params);
      setAssignments(res.data.data);
    } catch { toast.error('Failed to load assignments'); }
    finally { setLoading(false); }
  }, [filters.teacherId, filters.departmentId]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const filtered = assignments.filter(a =>
    !filters.search ||
    a.Course?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
    a.Teacher?.User?.name?.toLowerCase().includes(filters.search.toLowerCase())
  );

  const handleToggle = async (id) => {
    try { await courseAssignmentService.toggle(id); toast.success('Status updated'); fetchAssignments(); }
    catch { toast.error('Failed to update'); }
  };

  const handleRemove = async () => {
    try { await courseAssignmentService.remove(deleteId); toast.success('Assignment removed'); setDeleteId(null); fetchAssignments(); }
    catch { toast.error('Failed to remove'); }
  };

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/home' }, { label: 'Course Assignments' }]} />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <MdAssignment className="text-amber-600" size={28} /> Course Assignments
          </h1>
          <p className="text-sm text-gray-500 mt-1">{assignments.length} assignments · Assign teachers to courses</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm font-semibold rounded-xl"><MdDownload size={18} /> Export</button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-md">
            <MdAdd size={18} /> Assign Course
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Teacher</label>
            <select value={filters.teacherId} onChange={e => setFilters(p => ({ ...p, teacherId: e.target.value }))} className={inputClass}>
              <option value="">All Teachers</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.User?.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Department</label>
            <select value={filters.departmentId} onChange={e => setFilters(p => ({ ...p, departmentId: e.target.value }))} className={inputClass}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Search Assignment</label>
            <div className="relative">
              <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                placeholder="Search by course name or teacher..." className={`${inputClass} pl-9`} />
              {filters.search && <button onClick={() => setFilters(p => ({ ...p, search: '' }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><MdClose size={16} /></button>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-600 text-white">
                  {['Course','Teacher','Department','Batch','Section','Semester','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((a, i) => (
                  <tr key={a.id} className={`transition-colors hover:bg-amber-50/60
                    ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 dark:text-white whitespace-nowrap">{a.Course?.name}</p>
                      <p className="text-xs text-amber-600 font-mono">{a.Course?.code}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                          flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {a.Teacher?.User?.name?.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {a.Teacher?.User?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {a.Course?.Department?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {a.Batch?.name ?? 'All'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        {a.Section?.name ?? 'All'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {a.Semester?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(a.id)}
                        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
                          ${a.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {a.isActive ? <><MdToggleOn size={16} /> Active</> : <><MdToggleOff size={16} /> Inactive</>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDeleteId(a.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><MdDelete size={17} /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No assignments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Assign Course to Teacher" size="xl">
        <AssignForm departments={departments}
          onSuccess={() => { setShowModal(false); fetchAssignments(); }}
          onCancel={() => setShowModal(false)} />
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">🗑️</div>
            <h3 className="text-base font-bold text-center mb-2">Remove Assignment</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Remove this teacher from this course?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl">Cancel</button>
              <button onClick={handleRemove} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}