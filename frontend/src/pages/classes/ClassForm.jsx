import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { classService } from '../../services/class.service';
import { departmentService } from '../../services/department.service';

function ClassForm({ onSuccess, onCancel }) {
  const [departments, setDepartments] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    departmentService.getAll().then((r) => setDepartments(r.data.data));
  }, []);

  const onSubmit = async (data) => {
    try {
      await classService.create(data);
      toast.success('Class created');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create class');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {[
        ['Class Name', 'name', { required: 'Name is required' }],
        ['Section', 'section', {}],
        ['Academic Year', 'academicYear', { required: 'Academic year is required' }],
        ['Semester', 'semester', {}],
      ].map(([label, name, rules]) => (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">{label}</label>
          <input
            {...register(name, rules)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200
              dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
              dark:text-gray-200 text-sm focus:outline-none focus:ring-2
              focus:ring-indigo-500"
          />
          {errors[name] && (
            <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
          )}
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700
          dark:text-gray-300 mb-1">Department</label>
        <select
          {...register('departmentId', { required: 'Department is required' })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200
            dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
            dark:text-gray-200 text-sm focus:outline-none focus:ring-2
            focus:ring-indigo-500"
        >
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        {errors.departmentId && (
          <p className="text-red-500 text-xs mt-1">{errors.departmentId.message}</p>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-200
            dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
            text-white text-sm font-medium rounded-lg disabled:opacity-60">
          {isSubmitting ? 'Creating...' : 'Create Class'}
        </button>
      </div>
    </form>
  );
}

export default ClassForm;