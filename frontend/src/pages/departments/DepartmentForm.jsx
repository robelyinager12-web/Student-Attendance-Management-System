import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { departmentService } from '../../services/department.service';

function DepartmentForm({ initialData, onSuccess, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData]);

  const onSubmit = async (data) => {
    try {
      if (initialData) {
        await departmentService.update(initialData.id, data);
        toast.success('Department updated');
      } else {
        await departmentService.create(data);
        toast.success('Department created');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {[
        ['Department Name', 'name', { required: 'Name is required' }],
        ['Department Code', 'code', { required: 'Code is required' }],
        ['Head of Department', 'headOfDepartment', {}],
      ].map(([label, name, rules]) => (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">
            {label}
          </label>
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
          dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200
            dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
            dark:text-gray-200 text-sm focus:outline-none focus:ring-2
            focus:ring-indigo-500 resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end">
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
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
            text-white text-sm font-medium rounded-lg disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default DepartmentForm;