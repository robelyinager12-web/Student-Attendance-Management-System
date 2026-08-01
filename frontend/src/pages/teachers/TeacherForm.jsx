import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { teacherService } from '../../services/teacher.service';
import { departmentService } from '../../services/department.service';
import { emailRules, nameRules, passwordRules } from '../../utils/validators';

function TeacherForm({ onSuccess, onCancel }) {
  const [departments, setDepartments] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    departmentService.getAll()
      .then((r) => setDepartments(r.data.data))
      .catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    try {
      await teacherService.create(data);
      toast.success('Teacher added successfully');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add teacher');
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
    focus:ring-indigo-500`;

  const labelClass = `block text-sm font-medium text-gray-700
    dark:text-gray-300 mb-1`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Section — Account Info */}
      <div>
        <h2 className="text-sm font-semibold text-indigo-600
          uppercase tracking-wider mb-4">
          Account Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              {...register('name', nameRules)}
              className={inputClass}
              placeholder="Mr. John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              {...register('email', emailRules)}
              className={inputClass}
              placeholder="teacher@school.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Password *</label>
            <input
              type="password"
              {...register('password', passwordRules)}
              className={inputClass}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input
              {...register('phone')}
              className={inputClass}
              placeholder="09xxxxxxxx"
            />
          </div>
        </div>
      </div>

      {/* Section — Professional Info */}
      <div>
        <h2 className="text-sm font-semibold text-indigo-600
          uppercase tracking-wider mb-4">
          Professional Information
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
            <label className={labelClass}>Subject *</label>
            <select
              {...register('subject', { required: 'Subject is required' })}
              className={inputClass}
            >
              <option value="">Select subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Economics">Economics</option>
              <option value="Civics">Civics</option>
              <option value="Physical Education">Physical Education</option>
              <option value="Art">Art</option>
              <option value="Music">Music</option>
              <option value="Other">Other</option>
            </select>
            {errors.subject && (
              <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Qualification</label>
            <select {...register('qualification')} className={inputClass}>
              <option value="">Select qualification</option>
              <option value="Certificate">Certificate</option>
              <option value="Diploma">Diploma</option>
              <option value="BSc">BSc</option>
              <option value="BA">BA</option>
              <option value="MSc">MSc</option>
              <option value="MA">MA</option>
              <option value="MBA">MBA</option>
              <option value="PhD">PhD</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Experience (years)</label>
            <input
              type="number"
              min="0"
              max="50"
              {...register('experience')}
              className={inputClass}
              placeholder="e.g. 5"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-2 border-t
        border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
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
          {isSubmitting ? 'Adding...' : 'Add Teacher'}
        </button>
      </div>
    </form>
  );
}

export default TeacherForm;