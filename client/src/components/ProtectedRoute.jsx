import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

/**
 * Reusable ProtectedRoute with role-aware redirection
 * @param {Array<string>} allowedRoles - Optional list of permitted roles (e.g. ['admin'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loading message="Validating authentication session..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, ensure user possesses the role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to their own role dashboard
    const roleDashboardMap = {
      trainee: '/trainee/dashboard',
      trainer: '/trainer/dashboard',
      admin: '/admin/dashboard',
    };

    const targetDashboard = roleDashboardMap[user.role] || '/';
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
