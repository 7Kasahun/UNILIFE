import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginIdentifier.trim() || !password) {
      setErrorMessage('Please provide your email or username, and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.login({
        login_identifier: loginIdentifier.trim(),
        password
      });

      if (res.success && res.token && res.user) {
        loginStudent(res.token, res.user);
        navigate('/student/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid username/email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-navy-800 to-brand-blue text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-navy-800 tracking-tight">
            Sign In to UniLife Ethiopia
          </h1>
          <p className="text-xs text-slate-500">
            Access your private courses, timetable, and study organizers.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address or Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. abebe@aau.edu.et or abebe12"
                  required
                  autoFocus
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-blue font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                />
                <span className="text-slate-600 font-medium">Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold text-xs hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have a student account yet?{' '}
            <Link to="/register" className="font-bold text-brand-blue hover:underline">
              Create Account Free
            </Link>
          </div>
        </div>

        {/* Support Note */}
        <p className="text-center text-[11px] text-slate-400">
          All academic tools are 100% free • UniLife Ethiopia
        </p>
      </div>
    </div>
  );
}
