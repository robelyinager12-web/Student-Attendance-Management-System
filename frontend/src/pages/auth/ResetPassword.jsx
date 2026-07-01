import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/auth.service';
import { passwordRules } from '../../utils/validators';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword({ token, newPassword: data.newPassword });
      toast.success('Password reset successfully. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed or link expired');
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl
      shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🔑</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Reset Password
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Enter your new password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">
            New Password
          </label>
          <input
            type="password"
            {...register('newPassword', passwordRules)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200
              dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
              dark:text-gray-200 text-sm focus:outline-none focus:ring-2
              focus:ring-indigo-500"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700
            text-white font-semibold rounded-lg transition-colors
            disabled:opacity-60"
        >
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;