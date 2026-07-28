import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { departmentService } from '../../services/department.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Modal from '../../components/common/Modal';
import { useForm } from 'react-hook-form';
import {
  MdAdd, MdSearch, MdEdit, MdDelete, MdVisibility,
  MdDownload, MdUpload, MdFilterList, MdClose, MdLibraryBooks,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

function DeptForm({ initialData, onSuccess, onCancel }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  useEffect(() => { if (initialData) reset(initialData); else reset({}); }, [initialData]);
  const onSubmit = async (data) => {
    try {
      if (initialData) { await departmentService.update(initialData.id, data); toast.success('Department updated'); }
      else             { await departmentService.create(data);               toast.success('Department created'); }
      onSuccess?.();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department Name *</label>
          <input {...register('name', { required: true })} className={inputClass} placeholder="Software Engineering" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department Code *</label>
          <input {...register('code', { required: true })} className={inputClass} placeholder="SWE" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Head of Department</label>
          <input {...register('headOfDepartment')} className={inputClass} placeholder="Dr. Name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input {...register('email')} className={inputClass} placeholder="dept@injibara.edu.et" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input {...register('phone')} className={inputClass} placeholder="+251-58-xxx-xxxx" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea {...register('description')} rows={2} className={`${inputClass} resize-none`} />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
        <button type="submit" disabled={isSubmitting}
          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save Department'}
        </button>
      </div>
    </form>
  );
}

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [search,      setSearch]      = useState('');

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data.data);
    } catch { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDepartments(); }, []);

  const filtered = departments.filter(d =>
    !search ||
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    try {
      await departmentService.delete(deleteId);
      toast.success('Department deleted');
      setDeleteId(null);
      fetchDepartments();
    } catch { toast.error('Failed to delete department'); }
  };

  const DEPT_GRADIENTS = [
    'from-indigo-500 to-indigo-600',
    'from-blue-500   to-blue-600',
    'from-cyan-500   to-cyan-600',
    'from-purple-500 to-purple-600',
    'from-emerald-500 to-emerald-600',
    'from-rose-500   to-rose-600',
    'from-amber-500  to-amber-600',
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/home' }, { label: 'Department Management' }]} />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <MdLibraryBooks className="text-green-600" size={28} /> Department Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">{departments.length} departments · College of Technology</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold rounded-xl">
            <MdUpload size={18} /> Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm font-semibold rounded-xl">
            <MdDownload size={18} /> Export Excel
          </button>
          <button onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-md">
            <MdAdd size={18} /> Add Department
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by department name or code..."
              className={`${inputClass} pl-9`} />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <MdClose size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-600 text-white">
                  {['Code','Department Name','Head of Department','Teachers','Students','Courses','Sections','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((dept, i) => (
                  <tr key={dept.id} className={`transition-colors hover:bg-green-50/60 dark:hover:bg-green-900/20
                    ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl
                        bg-gradient-to-br ${DEPT_GRADIENTS[i % DEPT_GRADIENTS.length]}
                        text-white text-xs font-extrabold`}>
                        {dept.code}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 dark:text-white whitespace-nowrap">{dept.name}</p>
                      {dept.email && <p className="text-xs text-gray-400 mt-0.5">{dept.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {dept.headOfDepartment ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                        {dept.Teachers?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                        {dept.Students?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                        {dept.Courses?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">
                        {dept.Sections?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setEditing(dept); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
                          <MdEdit size={17} />
                        </button>
                        <button onClick={() => setDeleteId(dept.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                          <MdDelete size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">No departments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Department' : 'Add Department'} size="lg">
        <DeptForm initialData={editing}
          onSuccess={() => { setShowModal(false); setEditing(null); fetchDepartments(); }}
          onCancel={() => { setShowModal(false); setEditing(null); }} />
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">🗑️</div>
            <h3 className="text-base font-bold text-center mb-2">Delete Department</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This will delete the department and all its data.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-100">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}