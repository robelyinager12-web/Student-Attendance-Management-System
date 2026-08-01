import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { batchService } from '../../services/batch.service';
import { academicYearService } from '../../services/academicYear.service';
import { semesterService } from '../../services/semester.service';
import { departmentService } from '../../services/department.service';
import Modal from '../../components/common/Modal';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useForm } from 'react-hook-form';
import {
  MdAdd, MdEdit, MdDelete, MdExpandMore,
  MdExpandLess, MdStar, MdStarBorder,
} from 'react-icons/md';

const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
  focus:ring-indigo-500`;

// ── Academic Year Form ──────────────────────────────────────────────────────
function AcademicYearForm({ initialData, batches, onSuccess, onCancel }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (initialData) reset(initialData);
    else reset({});
  }, [initialData]);

  const onSubmit = async (data) => {
    try {
      data.isCurrent = data.isCurrent === 'true' || data.isCurrent === true;
      if (initialData) {
        await academicYearService.update(initialData.id, data);
        toast.success('Academic year updated');
      } else {
        await academicYearService.create(data);
        toast.success('Academic year created');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Year Number *</label>
          <select {...register('year', { required: true })} className={inputClass}>
            <option value="">Select year</option>
            {[1, 2, 3, 4, 5].map((y) => (
              <option key={y} value={y}>Year {['I', 'II', 'III', 'IV', 'V'][y - 1]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Name</label>
          <input {...register('name')} className={inputClass}
            placeholder="Year I (auto-generated)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Batch *</label>
          <select {...register('batchId', { required: 'Batch is required' })}
            className={inputClass}>
            <option value="">Select batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} — {b.Department?.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Is Current Year?</label>
          <select {...register('isCurrent')} className={inputClass}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Start Date</label>
          <input type="date" {...register('startDate')} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">End Date</label>
          <input type="date" {...register('endDate')} className={inputClass} />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
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

// ── Semester Form ────────────────────────────────────────────────────────────
function SemesterForm({ initialData, academicYears, onSuccess, onCancel }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (initialData) reset(initialData);
    else reset({});
  }, [initialData]);

  const onSubmit = async (data) => {
    try {
      data.isCurrent = data.isCurrent === 'true' || data.isCurrent === true;
      if (initialData) {
        await semesterService.update(initialData.id, data);
        toast.success('Semester updated');
      } else {
        await semesterService.create(data);
        toast.success('Semester created');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Semester Number *</label>
          <select {...register('number', { required: true })} className={inputClass}>
            <option value="">Select</option>
            <option value="1">Semester I</option>
            <option value="2">Semester II</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Name</label>
          <input {...register('name')} className={inputClass}
            placeholder="Semester I (auto-generated)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Academic Year *</label>
          <select {...register('academicYearId', { required: true })} className={inputClass}>
            <option value="">Select academic year</option>
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                {ay.name} — {ay.Batch?.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Is Current?</label>
          <select {...register('isCurrent')} className={inputClass}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Start Date</label>
          <input type="date" {...register('startDate')} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">End Date</label>
          <input type="date" {...register('endDate')} className={inputClass} />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
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

// ── Main Page ────────────────────────────────────────────────────────────────
function AcademicStructure() {
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [filterDept, setFilterDept] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [expandedYears, setExpandedYears] = useState({});
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    departmentService.getAll().then((r) => setDepartments(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!filterDept) { setBatches([]); setFilterBatch(''); return; }
    batchService.getAll({ departmentId: filterDept })
      .then((r) => setBatches(r.data.data)).catch(() => {});
  }, [filterDept]);

  useEffect(() => {
    const params = filterBatch ? { batchId: filterBatch } : {};
    academicYearService.getAll(params)
      .then((r) => setAcademicYears(r.data.data)).catch(() => {});
    semesterService.getAll()
      .then((r) => setSemesters(r.data.data)).catch(() => {});
  }, [filterBatch]);

  function refresh() {
    const params = filterBatch ? { batchId: filterBatch } : {};
    academicYearService.getAll(params).then((r) => setAcademicYears(r.data.data)).catch(() => {});
    semesterService.getAll().then((r) => setSemesters(r.data.data)).catch(() => {});
  }

  function toggleYear(id) {
    setExpandedYears((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function deleteAY(id) {
    if (!window.confirm('Delete this academic year and all its semesters?')) return;
    try {
      await academicYearService.delete(id);
      toast.success('Academic year deleted');
      refresh();
    } catch (err) {
      toast.error('Failed to delete');
    }
  }

  async function deleteSem(id) {
    if (!window.confirm('Delete this semester?')) return;
    try {
      await semesterService.delete(id);
      toast.success('Semester deleted');
      refresh();
    } catch (err) {
      toast.error('Failed to delete');
    }
  }

  const getSemestersForYear = (ayId) =>
    semesters.filter((s) => s.academicYearId === ayId);

  return (
    <div className="space-y-5">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Academic Structure' },
      ]} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Academic Structure
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditing(null); setModal('year'); }}
            className="flex items-center gap-2 px-4 py-2 border border-indigo-600
              text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20
              text-sm font-medium rounded-lg">
            <MdAdd size={18} /> Add Year
          </button>
          <button
            onClick={() => { setEditing(null); setModal('semester'); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600
              hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
            <MdAdd size={18} /> Add Semester
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
            bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
            bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={!filterDept}>
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Academic Years Tree */}
      {academicYears.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-400">No academic years found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Select a department and batch or add a new academic year.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {academicYears.map((ay) => (
            <div key={ay.id} className="bg-white dark:bg-gray-800 rounded-xl
              border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Year header */}
              <div className="flex items-center justify-between p-4
                hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
                onClick={() => toggleYear(ay.id)}>
                <div className="flex items-center gap-3">
                  {expandedYears[ay.id]
                    ? <MdExpandLess size={20} className="text-indigo-600" />
                    : <MdExpandMore size={20} className="text-gray-400" />
                  }
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-700
                        dark:text-gray-200">
                        {ay.name}
                      </p>
                      {ay.isCurrent && (
                        <span className="flex items-center gap-1 text-xs
                          bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          <MdStar size={12} /> Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {ay.Batch?.name} · {getSemestersForYear(ay.id).length} semesters
                      {ay.startDate && ` · ${ay.startDate} to ${ay.endDate}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setEditing(ay); setModal('year'); }}
                    className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50
                      dark:hover:bg-indigo-900/20">
                    <MdEdit size={16} />
                  </button>
                  <button onClick={() => deleteAY(ay.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50
                      dark:hover:bg-red-900/20">
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>

              {/* Semesters */}
              {expandedYears[ay.id] && (
                <div className="border-t border-gray-100 dark:border-gray-700">
                  {getSemestersForYear(ay.id).length === 0 ? (
                    <p className="text-sm text-gray-400 px-12 py-4">
                      No semesters yet.
                      <button
                        onClick={() => { setEditing(null); setModal('semester'); }}
                        className="text-indigo-600 hover:underline ml-1">
                        Add one
                      </button>
                    </p>
                  ) : (
                    getSemestersForYear(ay.id).map((sem) => (
                      <div key={sem.id} className="flex items-center
                        justify-between px-12 py-3 hover:bg-gray-50
                        dark:hover:bg-gray-700/30 border-b border-gray-50
                        dark:border-gray-700/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-700 dark:text-gray-200">
                                {sem.name}
                              </p>
                              {sem.isCurrent && (
                                <span className="text-xs bg-green-100 text-green-700
                                  px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            {sem.startDate && (
                              <p className="text-xs text-gray-400">
                                {sem.startDate} → {sem.endDate}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditing(sem); setModal('semester'); }}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50
                              dark:hover:bg-indigo-900/20">
                            <MdEdit size={16} />
                          </button>
                          <button onClick={() => deleteSem(sem.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50
                              dark:hover:bg-red-900/20">
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Academic Year Modal */}
      <Modal isOpen={modal === 'year'}
        onClose={() => { setModal(null); setEditing(null); }}
        title={editing ? 'Edit Academic Year' : 'Add Academic Year'}
        size="lg">
        <AcademicYearForm
          initialData={editing}
          batches={batches.length > 0 ? batches : []}
          onSuccess={() => { setModal(null); setEditing(null); refresh(); }}
          onCancel={() => { setModal(null); setEditing(null); }}
        />
      </Modal>

      {/* Semester Modal */}
      <Modal isOpen={modal === 'semester'}
        onClose={() => { setModal(null); setEditing(null); }}
        title={editing ? 'Edit Semester' : 'Add Semester'}
        size="lg">
        <SemesterForm
          initialData={editing}
          academicYears={academicYears}
          onSuccess={() => { setModal(null); setEditing(null); refresh(); }}
          onCancel={() => { setModal(null); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}

export default AcademicStructure;