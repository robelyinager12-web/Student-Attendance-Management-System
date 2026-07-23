import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { batchService } from '../../services/batch.service';
import { departmentService } from '../../services/department.service';
import { programService } from '../../services/program.service';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useForm } from 'react-hook-form';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

function BatchForm({ initialData, departments, programs, onSuccess, onCancel }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (initialData) reset(initialData);
    else reset({});
  }, [initialData]);

  const onSubmit = async (data) => {
    try {
      if (initialData) {
        await batchService.update(initialData.id, data);
        toast.success('Batch updated');
      } else {
        await batchService.create(data);
        toast.success('Batch created');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save batch');
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
            dark:text-gray-300 mb-1">Batch Year *</label>
          <input type="number" min="2000" max="2100"
            {...register('year', { required: 'Year is required' })}
            className={inputClass} placeholder="2024" />
          {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Batch Name</label>
          <input {...register('name')} className={inputClass}
            placeholder="Batch 2024 (auto-generated if empty)" />
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
            dark:text-gray-300 mb-1">Program</label>
          <select {...register('programId')} className={inputClass}>
            <option value="">Select program</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Status</label>
          <select {...register('status')} className={inputClass}>
            <option value="ACTIVE">Active</option>
            <option value="GRADUATED">Graduated</option>
            <option value="INACTIVE">Inactive</option>
          </select>
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

function BatchList() {
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterDept, setFilterDept] = useState('');

  useEffect(() => {
    departmentService.getAll().then((r) => setDepartments(r.data.data)).catch(() => {});
    programService.getAll().then((r) => setPrograms(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [filterDept]);

  async function fetchBatches() {
    setLoading(true);
    try {
      const params = filterDept ? { departmentId: filterDept } : {};
      const res = await batchService.getAll(params);
      setBatches(res.data.data);
    } catch (err) {
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this batch?')) return;
    try {
      await batchService.delete(id);
      toast.success('Batch deleted');
      fetchBatches();
    } catch (err) {
      toast.error('Failed to delete batch');
    }
  }

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700',
    GRADUATED: 'bg-blue-100 text-blue-700',
    INACTIVE: 'bg-gray-100 text-gray-600',
  };

  const columns = [
    { key: 'name', label: 'Batch' },
    { key: 'year', label: 'Year' },
    { key: 'department', label: 'Department', render: (r) => r.Department?.name ?? '—' },
    { key: 'program', label: 'Program', render: (r) => r.Program?.name ?? '—' },
    {
      key: 'status', label: 'Status',
      render: (r) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium
          ${statusColors[r.status]}`}>
          {r.status}
        </span>
      ),
    },
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
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Batches' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Batches</h1>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600
            hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
          <MdAdd size={18} /> Add Batch
        </button>
      </div>
      <select
        value={filterDept}
        onChange={(e) => setFilterDept(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
          bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="">All Departments</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <Table columns={columns} data={batches} loading={loading} />
      <Modal isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Batch' : 'Add Batch'} size="lg">
        <BatchForm
          initialData={editing}
          departments={departments}
          programs={programs}
          onSuccess={() => { setShowModal(false); setEditing(null); fetchBatches(); }}
          onCancel={() => { setShowModal(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}

export default BatchList;