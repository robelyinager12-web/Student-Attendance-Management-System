import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center
      bg-gray-50 dark:bg-gray-900 text-center p-6">
      <div className="text-8xl mb-4">🔍</div>
      <h1 className="text-9xl font-bold text-indigo-600">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mt-4">
        Page Not Found
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 border border-gray-200 dark:border-gray-600
            text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100
            dark:hover:bg-gray-800 text-sm"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
            text-white rounded-lg text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default NotFound;