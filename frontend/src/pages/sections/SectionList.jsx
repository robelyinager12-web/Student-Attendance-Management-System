import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { sectionService } from '../../services/section.service';
import { departmentService } from '../../services/department.service';
import { batchService } from '../../services/batch.service';
import { academicYearService } from '../../services/academicYear.service';
import { semesterService } from '../../services/semester.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import {
  MdAdd, MdSearch, MdEdit, MdDelete, MdVisibility,
  MdDownload, MdUpload, MdClose, MdClass, MdPeople,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

function SectionForm({ initialData, departments, batches, academicYears, semesters, teachers, onSuccess, onCancel }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  useEffect(() => { if (initialData) reset(initialData); else reset({}); }, [initialData]);
  const onSubmit = async (data) => {
    try {
      if (initialData) { await sectionService.update(initialData.id, data); toast.success('Section updated'); }
      else             { await sectionService.create(data);                toast.success('Section created'); }
      onSuccess?.();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Name *</label>
          <input {...register('name', { required: true })} className={inputClass} placeholder="Section A" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room / Classroom</label>
          <input {...register('room')} className={inputClass} placeholder="Lab 201" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
          <input type="number" {...register('capacity')} className={inputClass} placeholder="50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label>
          <select {...register('departmentId', { required: true })} className={inputClass}>
            <option value="">Select department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch *</label>
          <select {...register('batchId', { required: true })} className={inputClass}>
            <option value="">Select batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Year *</label>
          <select {...register('academicYearId', { required: true })} className={inputClass}>
            <option value="">Select academic year</option>
            {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester *</label>
          <select {...register('semesterId', { required: true })} className={inputClass}>
            <option value="">Select semester</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Advisor</label>
          <select {...register('teacherId')} className={inputClass}>
            <option value="">Select advisor</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.User?.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save Section'}
        </button>
      </div>
    </form>
  );
}

export default function SectionList() {
  const [sections,      setSections]      = useState([]);
  const [departments,   setDepartments]   = useState([]);
  const [batches,       setBatches]       = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters,     setSemesters]     = useState([]);
  const [teachers,      setTeachers]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [editing,       setEditing]       = useState(null);
  const [deleteId,      setDeleteId]      = useState(null);
  const [page,          setPage]          = useState(1);
  const [filters, setFilters] = useState({ departmentId: '', batchId: '', semesterId: '', search: '' });

  useEffect(() => {
    departmentService.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
    academicYearService.getAll().then(r => setAcademicYears(r.data.data)).catch(() => {});
    api.get('/teachers').then(r => setTeachers(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (filters.departmentId) {
      batchService.getAll({ departmentId: filters.departmentId }).then(r => setBatches(r.data.data)).catch(() => {});
    }
  }, [filters.departmentId]);

  useEffect(() => {
    if (filters.batchId) {
      api.get(`/sections?batchId=${filters.batchId}`).then(r => setSemesters([])).catch(() => {});
    }
  }, [filters.batchId]);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.batchId)      params.batchId      = filters.batchId;
      if (filters.semesterId)   params.semesterId   = filters.semesterId;
      const res = await sectionService.getAll(params);
      setSections(res.data.data);
    } catch { toast.error('Failed to load sections'); }
    finally { setLoading(false); }
  }, [filters.departmentId, filters.batchId, filters.semesterId]);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const filtered = sections.filter(s =>
    !filters.search ||
    s.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
    s.Department?.name?.toLowerCase().includes(filters.search.toLowerCase())
  );

  const handleDelete = async () => {
    try { await sectionService.delete(deleteId); toast.success('Section deleted'); setDeleteId(null); fetchSections(); }
    catch { toast.error('Failed to delete'); }
  };

  const SECTION_COLORS = ['bg-indigo-500','bg-cyan-500','bg-purple-500','bg-teal-500','bg-blue-500'];

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/home' }, { label: 'Section Management' }]} />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <MdClass className="text-teal-600" size={28} /> Section Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">{sections.length} sections total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold rounded-xl"><MdUpload size={18} /> Import</button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm font-semibold rounded-xl"><MdDownload size={18} /> Export</button>
          <button onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-md">
            <MdAdd size={18} /> Add Section
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
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Batch</label>
            <select value={filters.batchId} onChange={e => setFilters(p => ({ ...p, batchId: e.target.value }))} className={inputClass} disabled={!filters.departmentId}>
              <option value="">All Batches</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Search Section</label>
            <div className="relative">
              <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                placeholder="Search by section name or department..." className={`${inputClass} pl-9`} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal-600 text-white">
                  {['Section','Department','Batch','Year','Semester','Students','Class Advisor','Room','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((section, i) => (
                  <tr key={section.id} className={`transition-colors hover:bg-teal-50/60
                    ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl ${SECTION_COLORS[i % SECTION_COLORS.length]}
                          flex items-center justify-center text-white text-sm font-extrabold`}>
                          {section.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{section.Department?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{section.Batch?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {section.AcademicYear?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{section.Semester?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                        <MdPeople size={12} /> {section.studentCount ?? section.Students?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {section.Teacher?.User?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{section.room ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-700">Active</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setEditing(section); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50"><MdEdit size={17} /></button>
                        <button onClick={() => setDeleteId(section.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><MdDelete size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-12 text-gray-400">No sections found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Section' : 'Add Section'} size="xl">
        <SectionForm initialData={editing} departments={departments} batches={batches}
          academicYears={academicYears} semesters={semesters} teachers={teachers}
          onSuccess={() => { setShowModal(false); setEditing(null); fetchSections(); }}
          onCancel={() => { setShowModal(false); setEditing(null); }} />
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">🗑️</div>
            <h3 className="text-base font-bold text-center mb-2">Delete Section</h3>
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