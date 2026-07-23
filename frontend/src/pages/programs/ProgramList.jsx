import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { programService } from '../../services/program.service';
import { departmentService } from '../../services/department.service';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useForm } from 'react-hook-form';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

function ProgramForm({ initialData, departments, onSuccess, onCancel }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (initialData) reset(initialData);
    else reset({});
  }, [initialData]);

  const onSubmit = async (data) => {
    try {
      if (initialData) {
        await programService.update(initialData.id, data);
        toast.success('Program updated');
      } else {
        await programService.create(data);
        toast.success('Program created');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save program');
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
    focus:ring-indigo-500`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Program Name *</label>
          <input {...register('name', { required: 'Name is required' })}
            className={inputClass} placeholder="BSc Software Engineering" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Program Code *</label>
          <input {...register('code', { required: 'Code is required' })}
            className={inputClass} placeholder="BSE" />
          {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Department *</label>
          <select {...register('departmentId', { required: 'Department is required' })}
            className={inputClass}>
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {errors.departmentId && <p className="text-red-500 text-xs mt-1">{errors.departmentId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Duration (years)</label>
          <input type="number" min="1" max="6"
            {...register('duration')} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Description</label>
          <textarea {...register('description')} rows={2}
            className={`${inputClass} resize-none`} />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-200
            dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
        <button type="submit" disabled={isSubmitting}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
            text-white text-sm font-medium rounded-lg disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}

function ProgramList() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchPrograms();
    departmentService.getAll().then((r) => setDepartments(r.data.data)).catch(() => {});
  }, []);

  async function fetchPrograms() {
    setLoading(true);
    try {
      const res = await programService.getAll();
      setPrograms(res.data.data);
    } catch (err) {
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this program?')) return;
    try {
      await programService.delete(id);
      toast.success('Program deleted');
      fetchPrograms();
    } catch (err) {
      toast.error('Failed to delete program');
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Program Name' },
    { key: 'department', label: 'Department', render: (r) => r.Department?.name ?? '—' },
    { key: 'duration', label: 'Duration', render: (r) => r.duration ? `${r.duration} years` : '—' },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditing(row); setShowModal(true); }}
            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50
              dark:hover:bg-indigo-900/20">
            <MdEdit size={18} />
          </button>
          <button onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50
              dark:hover:bg-red-900/20">
            <MdDelete size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Programs' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Programs</h1>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600
            hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
          <MdAdd size={18} /> Add Program
        </button>
      </div>
      <Table columns={columns} data={programs} loading={loading} />
      <Modal isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Program' : 'Add Program'} size="lg">
        <ProgramForm
          initialData={editing}
          departments={departments}
          onSuccess={() => { setShowModal(false); setEditing(null); fetchPrograms(); }}
          onCancel={() => { setShowModal(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}

export default ProgramList;