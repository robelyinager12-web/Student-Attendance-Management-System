import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { batchService } from '../../services/batch.service';
import { departmentService } from '../../services/department.service';
import { programService } from '../../services/program.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Modal from '../../components/common/Modal';
import { useForm } from 'react-hook-form';
import {
  MdAdd, MdSearch, MdEdit, MdDelete, MdVisibility,
  MdDownload, MdUpload, MdClose, MdGroup,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

const STATUS_COLORS = {
  ACTIVE:     'bg-emerald-100 text-emerald-700',
  GRADUATED:  'bg-blue-100    text-blue-700',
  GRADUATING: 'bg-amber-100   text-amber-700',
  INACTIVE:   'bg-gray-100    text-gray-600',
};

function BatchForm({ initialData, departments, programs, onSuccess, onCancel }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  useEffect(() => { if (initialData) reset(initialData); else reset({ status: 'ACTIVE' }); }, [initialData]);
  const onSubmit = async (data) => {
    try {
      if (initialData) { await batchService.update(initialData.id, data); toast.success('Batch updated'); }
      else             { await batchService.create(data);                toast.success('Batch created'); }
      onSuccess?.();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Year *</label>
          <input type="number" min="2000" max="2100" {...register('year', { required: true })} className={inputClass} placeholder="2026" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Name</label>
          <input {...register('name')} className={inputClass} placeholder="2026 Intake (auto if empty)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label>
          <select {...register('departmentId', { required: true })} className={inputClass}>
            <option value="">Select department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program</label>
          <select {...register('programId')} className={inputClass}>
            <option value="">Select program</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select {...register('status')} className={inputClass}>
            <option value="ACTIVE">Active</option>
            <option value="GRADUATED">Graduated</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save Batch'}
        </button>
      </div>
    </form>
  );
}

export default function BatchList() {
  const [batches,     setBatches]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs,    setPrograms]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [filters, setFilters] = useState({ departmentId: '', status: '', search: '' });

  useEffect(() => {
    departmentService.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
    programService.getAll().then(r => setPrograms(r.data.data)).catch(() => {});
  }, []);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.status)       params.status       = filters.status;
      const res = await batchService.getAll(params);
      setBatches(res.data.data);
    } catch { toast.error('Failed to load batches'); }
    finally { setLoading(false); }
  }, [filters.departmentId, filters.status]);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const filtered = batches.filter(b =>
    !filters.search ||
    b.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
    b.Department?.name?.toLowerCase().includes(filters.search.toLowerCase())
  );

  const handleDelete = async () => {
    try { await batchService.delete(deleteId); toast.success('Batch deleted'); setDeleteId(null); fetchBatches(); }
    catch { toast.error('Failed to delete'); }
  };

  const YEAR_LABELS = ['I','II','III','IV'];

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/home' }, { label: 'Batch Management' }]} />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <MdGroup className="text-cyan-600" size={28} /> Batch Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">{batches.length} batches total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold rounded-xl"><MdUpload size={18} /> Import</button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm font-semibold rounded-xl"><MdDownload size={18} /> Export</button>
          <button onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl shadow-md">
            <MdAdd size={18} /> Add Batch
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
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
            <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className={inputClass}>
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="GRADUATED">Graduated</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Search Batch</label>
            <div className="relative">
              <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                placeholder="Search by batch name or department..." className={`${inputClass} pl-9`} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cyan-600 text-white">
                  {['Batch','Academic Year','Department','Program','Students','Current Year','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((batch, i) => {
                  const currentYear = batch.AcademicYears?.find(ay => ay.isCurrent);
                  return (
                    <tr key={batch.id} className={`transition-colors hover:bg-cyan-50/60
                      ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600
                            flex items-center justify-center text-white text-xs font-bold">
                            {batch.year?.toString().slice(-2)}
                          </div>
                          <span className="font-semibold text-gray-800 dark:text-white">{batch.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                        {batch.year}/{parseInt(batch.year) + 1}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {batch.Department?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {batch.Program?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                          {batch.Students?.length ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                          {currentYear?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                          ${STATUS_COLORS[batch.status] ?? STATUS_COLORS.INACTIVE}`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { setEditing(batch); setShowModal(true); }}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50"><MdEdit size={17} /></button>
                          <button onClick={() => setDeleteId(batch.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><MdDelete size={17} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No batches found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Batch' : 'Add Batch'} size="lg">
        <BatchForm initialData={editing} departments={departments} programs={programs}
          onSuccess={() => { setShowModal(false); setEditing(null); fetchBatches(); }}
          onCancel={() => { setShowModal(false); setEditing(null); }} />
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">🗑️</div>
            <h3 className="text-base font-bold text-center mb-2">Delete Batch</h3>
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