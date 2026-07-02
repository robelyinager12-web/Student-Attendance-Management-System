import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { emailRules, passwordRules } from '../../utils/validators';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const loggedInUser = await login(data.email, data.password);

      toast.success(`Welcome back, ${loggedInUser.name}!`);

      if (loggedInUser.role === 'ADMIN') {
        navigate('/dashboard/admin', { replace: true });
      } else if (loggedInUser.role === 'TEACHER') {
        navigate('/dashboard/teacher', { replace: true });
      } else {
        navigate('/dashboard/student', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl
      shadow-2xl p-8">

      <div className="text-center mb-8">
        <div className="text-5xl mb-3">📚</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Sign in to your SAMS account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Email */}
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

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            {...register('password', passwordRules)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200
              dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
              dark:text-gray-200 text-sm focus:outline-none focus:ring-2
              focus:ring-indigo-500"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot password */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-indigo-600 hover:text-indigo-700
              dark:text-indigo-400"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700
            text-white font-semibold rounded-lg transition-colors
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

      </form>
    </div>
  );
}

export default Login;