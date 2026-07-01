import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { teacherService } from '../../services/teacher.service';
import { emailRules, nameRules, passwordRules } from '../../utils/validators';

function TeacherForm({ onSuccess, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await teacherService.create(data);
      toast.success('Teacher added successfully');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add teacher');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          ['Full Name', 'name', 'text', nameRules],
          ['Email', 'email', 'email', emailRules],
          ['Password', 'password', 'password', passwordRules],
          ['Phone', 'phone', 'text', {}],
          ['Qualification', 'qualification', 'text', {}],
          ['Experience (years)', 'experience', 'number', {}],
        ].map(([label, name, type, rules]) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700
              dark:text-gray-300 mb-1">
              {label}
            </label>
            <input
              type={type}
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
      </div>

      <div className="flex gap-3 justify-end pt-2">
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
          {isSubmitting ? 'Adding...' : 'Add Teacher'}
        </button>
      </div>
    </form>
  );
}

export default TeacherForm;