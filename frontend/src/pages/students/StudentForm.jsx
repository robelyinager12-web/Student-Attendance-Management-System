import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { studentService } from '../../services/student.service';
import { departmentService } from '../../services/department.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import api from '../../services/api';
import { MdSave, MdArrowBack } from 'react-icons/md';

const inputClass = `w-full px-4 py-2.5 rounded-xl border-2 border-gray-200
  dark:border-gray-600 focus:border-indigo-500 focus:outline-none
  bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-700
  text-sm text-gray-700 dark:text-gray-200 transition-all
  disabled:opacity-50 disabled:cursor-not-allowed`;

const selectClass = `w-full px-4 py-2.5 rounded-xl border-2 border-gray-200
  dark:border-gray-600 focus:border-indigo-500 focus:outline-none
  bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200
  transition-all disabled:opacity-50 disabled:cursor-not-allowed`;

const YEAR_LABELS = ['I','II','III','IV','V'];

export default function StudentForm() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = Boolean(id);

  const [departments,   setDepartments]   = useState([]);
  const [programs,      setPrograms]      = useState([]);
  const [batches,       setBatches]       = useState([]);
  const [sections,      setSections]      = useState([]);
  const [semesters,     setSemesters]     = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loadingData,   setLoadingData]   = useState(isEdit);

  const {
    register, handleSubmit, reset, watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const selectedDept  = watch('departmentId');
  const selectedBatch = watch('batchId');

  // Load departments and academic years once
  useEffect(() => {
    departmentService.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
    api.get('/academic-years').then(r => setAcademicYears(r.data.data)).catch(() => {});
  }, []);

  // Load programs + batches when dept changes
  useEffect(() => {
    if (!selectedDept) { setPrograms([]); setBatches([]); return; }
    api.get(`/programs?departmentId=${selectedDept}`).then(r => setPrograms(r.data.data)).catch(() => {});
    api.get(`/batches?departmentId=${selectedDept}`).then(r => setBatches(r.data.data)).catch(() => {});
  }, [selectedDept]);

  // Load sections + semesters when batch changes
  useEffect(() => {
    if (!selectedBatch) { setSections([]); setSemesters([]); return; }
    api.get(`/sections?batchId=${selectedBatch}`).then(r => setSections(r.data.data)).catch(() => {});
    api.get(`/academic-years?batchId=${selectedBatch}`).then(r => {
      const cur = r.data.data.find(ay => ay.isCurrent) || r.data.data[0];
      if (cur) api.get(`/semesters?academicYearId=${cur.id}`).then(s => setSemesters(s.data.data)).catch(() => {});
    }).catch(() => {});
  }, [selectedBatch]);

  // Load existing data for edit
  useEffect(() => {
    if (!isEdit) return;
    studentService.getById(id).then(r => {
      const s = r.data.data;
      reset({
        name:           s.User?.name        || '',
        email:          s.User?.email       || '',
        studentCode:    s.studentCode       || '',
        gender:         s.gender            || '',
        year:           s.year              || '',
        status:         s.status            || 'ACTIVE',
        departmentId:   s.departmentId      || '',
        programId:      s.programId         || '',
        batchId:        s.batchId           || '',
        academicYearId: s.academicYearId    || '',
        semesterId:     s.semesterId        || '',
        sectionId:      s.sectionId         || '',
      });
    }).catch(() => toast.error('Failed to load student data'))
      .finally(() => setLoadingData(false));
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await studentService.update(id, {
          studentCode:    data.studentCode    || undefined,
          gender:         data.gender         || undefined,
          year:           data.year           ? parseInt(data.year) : undefined,
          status:         data.status,
          departmentId:   data.departmentId   || undefined,
          programId:      data.programId      || undefined,
          batchId:        data.batchId        || undefined,
          academicYearId: data.academicYearId || undefined,
          semesterId:     data.semesterId     || undefined,
          sectionId:      data.sectionId      || undefined,
        });
        toast.success('Student updated successfully');
      } else {
        // Create new — first create User, then Student
        await api.post('/auth/register', {
          name:     data.name,
          email:    data.email,
          password: data.password || 'password123',
          role:     'STUDENT',
        }).then(async r => {
          const userId = r.data.data.id;
          await api.post('/students', {
            userId,
            studentCode:    data.studentCode    || undefined,
            gender:         data.gender         || undefined,
            year:           data.year           ? parseInt(data.year) : undefined,
            status:         data.status         || 'ACTIVE',
            departmentId:   data.departmentId   || undefined,
            programId:      data.programId      || undefined,
            batchId:        data.batchId        || undefined,
            academicYearId: data.academicYearId || undefined,
            semesterId:     data.semesterId     || undefined,
            sectionId:      data.sectionId      || undefined,
          });
        });
        toast.success('Student created successfully');
      }
      navigate('/students');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save student');
    }
  };

  if (loadingData) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/home' },
        { label: 'Students',  href: '/students' },
        { label: isEdit ? 'Edit Student' : 'Add Student' },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">
            {isEdit ? 'Edit Student' : 'Add New Student'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isEdit ? 'Update student information' : 'Create a new student account'}
          </p>
        </div>
        <button onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-sm text-gray-500
            hover:text-gray-700 font-semibold">
          <MdArrowBack size={18} /> Back
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-800 rounded-2xl border
          border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-6">

        {/* ── Account Info ── */}
        {!isEdit && (
          <div>
            <h2 className="text-sm font-bold text-indigo-600 uppercase
              tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block" />
              Account Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500
                  uppercase tracking-wider mb-1">Full Name *</label>
                <input {...register('name', { required: 'Name is required' })}
                  placeholder="e.g. Abel Bekele Tadesse"
                  className={inputClass} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500
                  uppercase tracking-wider mb-1">Email *</label>
                <input type="email"
                  {...register('email', { required: 'Email is required' })}
                  placeholder="student@injibara.edu.et"
                  className={inputClass} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500
                  uppercase tracking-wider mb-1">Password</label>
                <input type="password" {...register('password')}
                  placeholder="Leave empty for default: password123"
                  className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">
                  Default password: <code className="bg-gray-100 px-1 rounded">password123</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Student Info ── */}
        <div>
          <h2 className="text-sm font-bold text-indigo-600 uppercase
            tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block" />
            Student Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500
                uppercase tracking-wider mb-1">Student ID / Code</label>
              <input {...register('studentCode')}
                placeholder="e.g. INU1501051"
                className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500
                uppercase tracking-wider mb-1">Gender</label>
              <select {...register('gender')} className={selectClass}>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500
                uppercase tracking-wider mb-1">Status</label>
              <select {...register('status')} className={selectClass}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="GRADUATED">Graduated</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Academic Placement ── */}
        <div>
          <h2 className="text-sm font-bold text-indigo-600 uppercase
            tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-cyan-500 inline-block" />
            Academic Placement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500
                uppercase tracking-wider mb-1">Department</label>
              <select {...register('departmentId')} className={selectClass}>
                <option value="">Select department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500
                uppercase tracking-wider mb-1">Program</label>
              <select {...register('programId')} className={selectClass}
                disabled={!selectedDept}>
                <option value="">Select program</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500
                uppercase tracking-wider mb-1">Batch</label>
              <select {...register('batchId')} className={selectClass}
                disabled={!selectedDept}>
                <option value="">Select batch</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500
                uppercase tracking-wider mb-1">Year Level</label>
              <select {...register('year')} className={selectClass}>
                <option value="">Select year</option>
                {YEAR_LABELS.map((y, i) => (
                  <option key={i+1} value={i+1}>Year {y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500
                uppercase tracking-wider mb-1">Semester</label>
              <select {...register('semesterId')} className={selectClass}
                disabled={!selectedBatch}>
                <option value="">Select semester</option>
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500
                uppercase tracking-wider mb-1">Section</label>
              <select {...register('sectionId')} className={selectClass}
                disabled={!selectedBatch}>
                <option value="">Select section</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100
          dark:border-gray-700">
          <button type="button" onClick={() => navigate('/students')}
            className="px-6 py-2.5 border-2 border-gray-200 dark:border-gray-600
              text-sm text-gray-600 dark:text-gray-300 font-semibold rounded-xl
              hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}
            className="flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r
              from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700
              text-white text-sm font-bold rounded-xl shadow-lg disabled:opacity-60
              transition-all">
            {isSubmitting
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              : <><MdSave size={18} /> {isEdit ? 'Update Student' : 'Create Student'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}