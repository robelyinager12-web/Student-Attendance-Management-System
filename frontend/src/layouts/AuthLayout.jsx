import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900
      via-indigo-800 to-indigo-600 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
}

export default AuthLayout;