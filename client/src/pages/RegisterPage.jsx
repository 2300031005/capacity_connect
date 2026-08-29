import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { User, Mail, Lock, Building, Briefcase } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'trainee',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { name, email, department, role, password, confirmPassword } = formData;

    // Client-side validations
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email format (e.g. name@example.com).');
      return;
    }

    if (role !== 'trainee' && role !== 'trainer') {
      setError('Please select a valid role (Trainee or Trainer).');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        department: department.trim(),
        role,
        password,
      });

      // Redirect to login on successful registration with message
      navigate('/login', {
        state: { message: 'Registration successful! Please sign in with your new credentials.' },
        replace: true,
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please check your information and try again.'
      );
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
            Create Your Account
          </h2>
          <p className="text-xs text-[#526575]">
            Start your capacity-building journey.
          </p>
        </div>

        {/* Error Alert */}
        {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#D7E0E7] rounded focus:outline-none focus:ring-2 focus:ring-[#005A8D] focus:border-[#005A8D]"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Address */}
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
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#D7E0E7] rounded focus:outline-none focus:ring-2 focus:ring-[#005A8D] focus:border-[#005A8D]"
                disabled={loading}
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1" htmlFor="department">
              Department <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building className="w-4 h-4" />
              </div>
              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Software Engineering"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#D7E0E7] rounded focus:outline-none focus:ring-2 focus:ring-[#005A8D] focus:border-[#005A8D]"
                disabled={loading}
              />
            </div>
          </div>

          {/* Role Selection (Trainee or Trainer Only) */}
          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1" htmlFor="role">
              Account Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#D7E0E7] rounded focus:outline-none focus:ring-2 focus:ring-[#005A8D] focus:border-[#005A8D] bg-white"
                disabled={loading}
              >
                <option value="trainee">Trainee (Learner & Skill Building)</option>
                <option value="trainer">Trainer (Instructor & Curriculum Author)</option>
              </select>
            </div>
            <p className="text-[11px] text-[#526575] mt-1">
              Admin accounts cannot be registered publicly.
            </p>
          </div>

          {/* Password */}
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
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#D7E0E7] rounded focus:outline-none focus:ring-2 focus:ring-[#005A8D] focus:border-[#005A8D]"
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#D7E0E7] rounded focus:outline-none focus:ring-2 focus:ring-[#005A8D] focus:border-[#005A8D]"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-[#526575]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#005A8D] hover:text-[#0B3D62] underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
