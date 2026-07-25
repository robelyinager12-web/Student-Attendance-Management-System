import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { courseAssignmentService } from '../../services/courseAssignment.service';
import { departmentService } from '../../services/department.service';
import { teacherService } from '../../services/teacher.service';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useForm } from 'react-hook-form';
import { MdAdd, MdDelete, MdToggleOn, MdToggleOff } from 'react-icons/md';
import api from '../../services/api';

function AssignCourseForm({ departments, onSuccess, onCancel }) {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    teacherService.getAll()
      .then((r) => setTeachers(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedDept) return;
    api.get(`/courses?departmentId=${selectedDept}`)
      .then((r) => setCourses(r.data.data)).catch(() => {});
    api.get(`/batches?departmentId=${selectedDept}`)
      .then((r) => setBatches(r.data.data)).catch(() => {});
  }, [selectedDept]);

  useEffect(() => {
    if (!selectedBatch) return;
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

  const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
    focus:ring-indigo-500 disabled:opacity-50`;

  const onSubmit = async (data) => {
    try {
      await courseAssignmentService.assign(data);
      toast.success('Course assigned to teacher successfully');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign course');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-700
          dark:text-gray-300 mb-1">Department</label>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className={inputClass}>
          <option value="">Select department first</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Course *</label>
          <select {...register('courseId', { required: 'Course is required' })}
            className={inputClass}
            disabled={!selectedDept}>
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
          {errors.courseId && (
            <p className="text-red-500 text-xs mt-1">{errors.courseId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Teacher *</label>
          <select {...register('teacherId', { required: 'Teacher is required' })}
            className={inputClass}>
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.User?.name} ({t.teacherCode})
              </option>
            ))}
          </select>
          {errors.teacherId && (
            <p className="text-red-500 text-xs mt-1">{errors.teacherId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Batch</label>
          <select
            {...register('batchId')}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
            }}
            className={inputClass}
            disabled={!selectedDept}>
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Section</label>
          <select {...register('sectionId')} className={inputClass}
            disabled={!selectedBatch}>
            <option value="">All Sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Semester</label>
          <select {...register('semesterId')} className={inputClass}
            disabled={!selectedBatch}>
            <option value="">Select semester</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
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
        <button type="submit" disabled={isSubmitting}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
            text-white text-sm font-medium rounded-lg disabled:opacity-60">
          {isSubmitting ? 'Assigning...' : 'Assign Course'}
        </button>
      </div>
    </form>
  );
}

function CourseAssignment() {
  const [assignments, setAssignments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterTeacher, setFilterTeacher] = useState('');
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    departmentService.getAll()
      .then((r) => setDepartments(r.data.data)).catch(() => {});
    teacherService.getAll()
      .then((r) => setTeachers(r.data.data)).catch(() => {});
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    setLoading(true);
    try {
      const params = filterTeacher ? { teacherId: filterTeacher } : {};
      const res = await courseAssignmentService.getAll(params);
      setAssignments(res.data.data);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id) {
    if (!window.confirm('Remove this course assignment?')) return;
    try {
      await courseAssignmentService.remove(id);
      toast.success('Assignment removed');
      fetchAssignments();
    } catch (err) {
      toast.error('Failed to remove assignment');
    }
  }

  async function handleToggle(id) {
    try {
      await courseAssignmentService.toggle(id);
      toast.success('Assignment status updated');
      fetchAssignments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  }

  const columns = [
    {
      key: 'course', label: 'Course',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-200">
            {r.Course?.name}
          </p>
          <p className="text-xs text-gray-400">{r.Course?.code}</p>
        </div>
      ),
    },
    {
      key: 'teacher', label: 'Teacher',
      render: (r) => (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            {r.Teacher?.User?.name}
          </p>
          <p className="text-xs text-gray-400">{r.Teacher?.teacherCode}</p>
        </div>
      ),
    },
    { key: 'batch', label: 'Batch', render: (r) => r.Batch?.name ?? 'All Batches' },
    { key: 'section', label: 'Section', render: (r) => r.Section?.name ?? 'All Sections' },
    { key: 'semester', label: 'Semester', render: (r) => r.Semester?.name ?? '—' },
    {
      key: 'status', label: 'Status',
      render: (r) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium
          ${r.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
          }`}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleToggle(row.id)}
            className={`p-1.5 rounded-lg ${row.isActive
              ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={row.isActive ? 'Deactivate' : 'Activate'}>
            {row.isActive
              ? <MdToggleOn size={20} />
              : <MdToggleOff size={20} />
            }
          </button>
          <button onClick={() => handleRemove(row.id)}
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
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Course Assignments' },
      ]} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Course Assignments
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Assign teachers to courses for specific batches and sections
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600
            hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
          <MdAdd size={18} /> Assign Course
        </button>
      </div>

      {/* Filter */}
      <select
        value={filterTeacher}
        onChange={(e) => { setFilterTeacher(e.target.value); fetchAssignments(); }}
        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
          bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="">All Teachers</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.User?.name}</option>
        ))}
      </select>

      <Table columns={columns} data={assignments} loading={loading} />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Assign Course to Teacher"
        size="xl"
      >
        <AssignCourseForm
          departments={departments}
          onSuccess={() => { setShowModal(false); fetchAssignments(); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}

export default CourseAssignment;