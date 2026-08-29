import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { CheckCircle2, Lock, Mail, AlertTriangle, ShieldAlert } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deactivationNotice, setDeactivationNotice] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  useEffect(() => {
    const notice = sessionStorage.getItem('deactivationNotice');
    if (notice) {
      setDeactivationNotice(notice);
      sessionStorage.removeItem('deactivationNotice');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDeactivationNotice(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const data = await login({ email: email.trim(), password });
      
      const roleDashboardMap = {
        trainee: '/trainee/dashboard',
        trainer: '/trainer/dashboard',
        admin: '/admin/dashboard',
      };

      const destination = roleDashboardMap[data.user.role] || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.isDeactivated) {
        setDeactivationNotice(
          err.response.data.message || 'Your account has been deactivated by an administrator.'
        );
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Invalid email or password. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-[#F7F9FB]">
      <div className="max-w-md w-full bg-white border border-[#D7E0E7] rounded-lg p-8 shadow-sm space-y-6">
        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img
              src="/LOGO-PRAGATI.jpg"
              alt="PRAGATI Logo"
              className="w-12 h-12 object-contain mx-auto rounded"
            />
          </Link>
          <h1 className="text-sm font-bold uppercase tracking-widest text-[#526575]">
            PRAGATI
          </h1>
          <h2 className="text-2xl font-bold text-[#172B3A] tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-[#526575]">
            Sign in to continue your learning journey.
          </p>
        </div>

        {/* Deactivation Notice Banner */}
        {deactivationNotice && (
          <div className="border border-red-300 bg-red-50/90 text-red-950 p-4 rounded-lg space-y-2 text-xs animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-red-900 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>Account Deactivated</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {deactivationNotice}
            </p>
            <div className="pt-1 text-[11px] text-red-800 font-medium">
              If you believe this was done in error, please contact your organization administrator to reactivate your account.
            </div>
          </div>
        )}

        {/* Success Alert if redirected from Registration */}
        {successMessage && (
          <div className="border border-green-200 bg-green-50 text-[#16834B] text-xs px-4 py-3 rounded flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16834B] flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#D7E0E7] rounded focus:outline-none focus:ring-2 focus:ring-[#005A8D] focus:border-[#005A8D]"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#D7E0E7] rounded focus:outline-none focus:ring-2 focus:ring-[#005A8D] focus:border-[#005A8D]"
                disabled={loading}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>

        {/* Register Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-[#526575]">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#005A8D] hover:text-[#0B3D62] underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
