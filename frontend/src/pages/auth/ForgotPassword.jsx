import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/auth.service';
import { emailRules } from '../../utils/validators';

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      toast.success('Password reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl
      shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🔐</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Forgot Password
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Enter your email to receive a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            {...register('email', emailRules)}
            placeholder="you@school.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200
              dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
              dark:text-gray-200 text-sm focus:outline-none focus:ring-2
              focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700
            text-white font-semibold rounded-lg transition-colors
            disabled:opacity-60"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Remember your password?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;