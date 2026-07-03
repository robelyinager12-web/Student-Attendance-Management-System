import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { studentService } from '../../services/student.service';
import { departmentService } from '../../services/department.service';
import { courseService } from '../../services/course.service';
import { classService } from '../../services/class.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import { emailRules, nameRules, passwordRules } from '../../utils/validators';

function StudentForm() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    departmentService.getAll().then((r) => setDepartments(r.data.data)).catch(() => {});
    courseService.getAll().then((r) => setCourses(r.data.data)).catch(() => {});
    classService.getAll().then((r) => setClasses(r.data.data)).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    try {
      await studentService.create(data);
      toast.success('Student created successfully');
      navigate('/students');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create student');
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
    focus:ring-indigo-500`;

  const labelClass = `block text-sm font-medium text-gray-700
    dark:text-gray-300 mb-1`;

  return (
    <div className="space-y-5 max-w-3xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Students', href: '/students' },
        { label: 'Add Student' },
      ]} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Add New Student
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6 space-y-6"
      >
        {/* Section — Account Info */}
        <div>
          <h2 className="text-sm font-semibold text-indigo-600 uppercase
            tracking-wider mb-4">
            Account Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input {...register('name', nameRules)} className={inputClass} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" {...register('email', emailRules)} className={inputClass} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Password *</label>
              <input type="password" {...register('password', passwordRules)} className={inputClass} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input {...register('phone')} className={inputClass} placeholder="09xxxxxxxx" />
            </div>
          </div>
        </div>

        {/* Section — Personal Info */}
        <div>
          <h2 className="text-sm font-semibold text-indigo-600 uppercase
            tracking-wider mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Gender</label>
              <select {...register('gender')} className={inputClass}>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" {...register('dateOfBirth')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input {...register('address')} className={inputClass} placeholder="City, Region" />
            </div>
            <div>
              <label className={labelClass}>Admission Date</label>
              <input type="date" {...register('admissionDate')} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Section — Academic Info */}
        <div>
          <h2 className="text-sm font-semibold text-indigo-600 uppercase
            tracking-wider mb-4">
            Academic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department</label>
              <select {...register('departmentId')} className={inputClass}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Course</label>
              <select {...register('courseId')} className={inputClass}>
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Class *</label>
              <select
                {...register('classId', { required: 'Class is required' })}
                className={inputClass}
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section ? `— Section ${c.section}` : ''}
                  </option>
                ))}
              </select>
              {errors.classId && (
                <p className="text-red-500 text-xs mt-1">{errors.classId.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Year</label>
              <select {...register('year')} className={inputClass}>
                <option value="">Select year</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Semester</label>
              <select {...register('semester')} className={inputClass}>
                <option value="">Select semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section — Guardian Info */}
        <div>
          <h2 className="text-sm font-semibold text-indigo-600 uppercase
            tracking-wider mb-4">
            Guardian Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Guardian Name</label>
              <input {...register('guardianName')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Guardian Phone</label>
              <input {...register('guardianPhone')} className={inputClass} placeholder="09xxxxxxxx" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-2 border-t
          border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="px-5 py-2.5 rounded-lg border border-gray-200
              dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-medium rounded-lg disabled:opacity-60"
          >
            {isSubmitting ? 'Adding Student...' : 'Add Student'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentForm;