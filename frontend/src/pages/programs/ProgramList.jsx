import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { programService } from '../../services/program.service';
import { departmentService } from '../../services/department.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Modal from '../../components/common/Modal';
import { useForm } from 'react-hook-form';
import {
  MdAdd, MdSearch, MdEdit, MdDelete,
  MdDownload, MdUpload, MdClose, MdBook,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

function ProgramForm({ initialData, departments, onSuccess, onCancel }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  useEffect(() => { if (initialData) reset(initialData); else reset({}); }, [initialData]);
  const onSubmit = async (data) => {
    try {
      if (initialData) { await programService.update(initialData.id, data); toast.success('Program updated'); }
      else             { await programService.create(data);               toast.success('Program created'); }
      onSuccess?.();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Name *</label>
          <input {...register('name', { required: true })} className={inputClass} placeholder="BSc Software Engineering" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Code *</label>
          <input {...register('code', { required: true })} className={inputClass} placeholder="BSE" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label>
          <select {...register('departmentId', { required: true })} className={inputClass}>
            <option value="">Select department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (years)</label>
          <input type="number" min="1" max="6" {...register('duration')} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea {...register('description')} rows={2} className={`${inputClass} resize-none`} />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={isSubmitting}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save Program'}
        </button>
      </div>
    </form>
  );
}

const LEVEL_COLORS = {
  Undergraduate: 'bg-blue-100 text-blue-700',
  Postgraduate:  'bg-purple-100 text-purple-700',
  PhD:           'bg-rose-100 text-rose-700',
};

export default function ProgramList() {
  const [programs,    setPrograms]    = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [filters, setFilters] = useState({ departmentId: '', search: '' });

  useEffect(() => {
    departmentService.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
  }, []);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.departmentId) params.departmentId = filters.departmentId;
      const res = await programService.getAll(params);
      setPrograms(res.data.data);
    } catch { toast.error('Failed to load programs'); }
    finally { setLoading(false); }
  }, [filters.departmentId]);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  const filtered = programs.filter(p =>
    !filters.search ||
    p.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
    p.code?.toLowerCase().includes(filters.search.toLowerCase())
  );

  const handleDelete = async () => {
    try { await programService.delete(deleteId); toast.success('Program deleted'); setDeleteId(null); fetchPrograms(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/home' }, { label: 'Program Management' }]} />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <MdBook className="text-purple-600" size={28} /> Program Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">{programs.length} academic programs</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold rounded-xl"><MdUpload size={18} /> Import</button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm font-semibold rounded-xl"><MdDownload size={18} /> Export</button>
          <button onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-md">
            <MdAdd size={18} /> Add Program
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Department</label>
            <select value={filters.departmentId} onChange={e => setFilters(p => ({ ...p, departmentId: e.target.value }))} className={inputClass}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Search Program</label>
            <div className="relative">
              <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                placeholder="Search by program name or code..." className={`${inputClass} pl-9`} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-600 text-white">
                  {['Code','Program Name','Department','Level','Duration','Students','Courses','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((prog, i) => (
                  <tr key={prog.id} className={`transition-colors hover:bg-purple-50/60
                    ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">{prog.code}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white whitespace-nowrap">{prog.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{prog.Department?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_COLORS['Undergraduate']}`}>
                        Undergraduate
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{prog.duration ? `${prog.duration} Years` : '4 Years'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                        {prog.Students?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">
                        {prog.Courses?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-700">Active</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setEditing(prog); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"><MdEdit size={17} /></button>
                        <button onClick={() => setDeleteId(prog.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><MdDelete size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">No programs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Program' : 'Add Program'} size="lg">
        <ProgramForm initialData={editing} departments={departments}
          onSuccess={() => { setShowModal(false); setEditing(null); fetchPrograms(); }}
          onCancel={() => { setShowModal(false); setEditing(null); }} />
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">🗑️</div>
            <h3 className="text-base font-bold text-center mb-2">Delete Program</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This action cannot be undone.</p>
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