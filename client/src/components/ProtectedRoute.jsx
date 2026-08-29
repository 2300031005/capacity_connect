import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';
import { ShieldAlert, RefreshCw, LogOut } from 'lucide-react';

/**
 * Reusable ProtectedRoute with role-aware redirection and deactivation handling
 * @param {Array<string>} allowedRoles - Optional list of permitted roles (e.g. ['admin'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated, deactivationNotice, restoreSession, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loading message="Validating authentication session..." size="lg" />
      </div>
    );
  }

  // If user is currently deactivated
  if (deactivationNotice && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-8 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <ShieldAlert className="w-7 h-7" />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Account Deactivated</h2>
            <p className="text-xs text-slate-500">
              Your account is currently disabled by an administrator.
            </p>
          </div>

          <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs text-red-900 text-left leading-relaxed">
            {deactivationNotice}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => restoreSession()}
              className="w-full sm:w-auto px-4 py-2 bg-[#005A8D] hover:bg-[#0B3D62] text-white rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Check Reactivation</span>
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log In as Different User</span>
            </button>
          </div>
        </div>
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
