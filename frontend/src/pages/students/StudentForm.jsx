import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { studentService } from '../../services/student.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import { emailRules, nameRules, passwordRules } from '../../utils/validators';

function StudentForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await studentService.create(data);
      toast.success('Student created successfully');
      navigate('/students');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create student');
    }
  };

  const field = (label, name, type = 'text', rules = {}) => (
    <div>
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
  );

  return (
    <div className="space-y-5 max-w-2xl">
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
          border-gray-100 dark:border-gray-700 p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Full Name', 'name', 'text', nameRules)}
          {field('Email', 'email', 'email', emailRules)}
          {field('Password', 'password', 'password', passwordRules)}
          {field('Phone', 'phone')}
          {field('Date of Birth', 'dateOfBirth', 'date')}
          {field('Admission Date', 'admissionDate', 'date')}
          {field('Address', 'address')}
          {field('Guardian Name', 'guardianName')}
          {field('Guardian Phone', 'guardianPhone')}
          {field('Year', 'year')}
          {field('Semester', 'semester')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">
            Gender
          </label>
          <select
            {...register('gender')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200
              dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
              dark:text-gray-200 text-sm focus:outline-none focus:ring-2
              focus:ring-indigo-500"
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="flex gap-3 justify-end">
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
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-medium rounded-lg disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Add Student'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentForm;