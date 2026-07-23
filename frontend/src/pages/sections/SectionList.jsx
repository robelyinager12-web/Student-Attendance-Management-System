import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { sectionService } from '../../services/section.service';
import { departmentService } from '../../services/department.service';
import { batchService } from '../../services/batch.service';
import { academicYearService } from '../../services/academicYear.service';
import { semesterService } from '../../services/semester.service';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useForm } from 'react-hook-form';
import { MdAdd, MdEdit, MdDelete, MdPeople } from 'react-icons/md';
import api from '../../services/api';

function SectionForm({ initialData, departments, batches, academicYears,
  semesters, teachers, onSuccess, onCancel }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (initialData) reset(initialData);
    else reset({});
  }, [initialData]);

  const onSubmit = async (data) => {
    try {
      if (initialData) {
        await sectionService.update(initialData.id, data);
        toast.success('Section updated');
      } else {
        await sectionService.create(data);
        toast.success('Section created');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save section');
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
            dark:text-gray-300 mb-1">Section Name *</label>
          <input {...register('name', { required: 'Name is required' })}
            className={inputClass} placeholder="Section A, Group 1" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Room / Classroom</label>
          <input {...register('room')} className={inputClass} placeholder="Room 101" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Capacity</label>
          <input type="number" min="1" {...register('capacity')}
            className={inputClass} placeholder="50" />
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
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Batch *</label>
          <select {...register('batchId', { required: 'Batch is required' })}
            className={inputClass}>
            <option value="">Select batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Academic Year *</label>
          <select {...register('academicYearId', { required: 'Academic year is required' })}
            className={inputClass}>
            <option value="">Select academic year</option>
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>{ay.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Semester *</label>
          <select {...register('semesterId', { required: 'Semester is required' })}
            className={inputClass}>
            <option value="">Select semester</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Advisor / Homeroom Teacher</label>
          <select {...register('teacherId')} className={inputClass}>
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.User?.name}</option>
            ))}
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

function SectionList() {
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterDept, setFilterDept] = useState('');

  useEffect(() => {
    departmentService.getAll().then((r) => setDepartments(r.data.data)).catch(() => {});
    batchService.getAll().then((r) => setBatches(r.data.data)).catch(() => {});
    academicYearService.getAll().then((r) => setAcademicYears(r.data.data)).catch(() => {});
    semesterService.getAll().then((r) => setSemesters(r.data.data)).catch(() => {});
    api.get('/teachers').then((r) => setTeachers(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchSections();
  }, [filterDept]);

  async function fetchSections() {
    setLoading(true);
    try {
      const params = filterDept ? { departmentId: filterDept } : {};
      const res = await sectionService.getAll(params);
      setSections(res.data.data);
    } catch (err) {
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this section?')) return;
    try {
      await sectionService.delete(id);
      toast.success('Section deleted');
      fetchSections();
    } catch (err) {
      toast.error('Failed to delete section');
    }
  }

  const columns = [
    { key: 'name', label: 'Section' },
    { key: 'department', label: 'Department', render: (r) => r.Department?.name ?? '—' },
    { key: 'batch', label: 'Batch', render: (r) => r.Batch?.name ?? '—' },
    { key: 'year', label: 'Year', render: (r) => r.AcademicYear?.name ?? '—' },
    { key: 'semester', label: 'Semester', render: (r) => r.Semester?.name ?? '—' },
    {
      key: 'students', label: 'Students',
      render: (r) => (
        <span className="flex items-center gap-1 text-indigo-600 font-medium">
          <MdPeople size={16} /> {r.studentCount || 0}
        </span>
      ),
    },
    { key: 'teacher', label: 'Advisor', render: (r) => r.Teacher?.User?.name ?? '—' },
    { key: 'room', label: 'Room', render: (r) => r.room ?? '—' },
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
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Sections' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sections</h1>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600
            hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
          <MdAdd size={18} /> Add Section
        </button>
      </div>
      <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
          bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="">All Departments</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <Table columns={columns} data={sections} loading={loading} />
      <Modal isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Section' : 'Add Section'} size="xl">
        <SectionForm
          initialData={editing}
          departments={departments}
          batches={batches}
          academicYears={academicYears}
          semesters={semesters}
          teachers={teachers}
          onSuccess={() => { setShowModal(false); setEditing(null); fetchSections(); }}
          onCancel={() => { setShowModal(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}

export default SectionList;