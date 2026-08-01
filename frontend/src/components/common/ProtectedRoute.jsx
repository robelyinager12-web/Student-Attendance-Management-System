import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // Wait for auth check to finish before deciding
  if (loading) {
    return <LoadingSpinner />;
  }

  // Not logged in — go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role — go back to dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;