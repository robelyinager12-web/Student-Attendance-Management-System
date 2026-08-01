function LoadingSpinner({ fullScreen = true }) {
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen
        bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-indigo-500
          border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-indigo-500
        border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default LoadingSpinner;