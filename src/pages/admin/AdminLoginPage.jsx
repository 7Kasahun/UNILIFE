import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminApi } from '../../services/api.js';
import {
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please provide administrator username/email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminApi.login({
        login_identifier: identifier.trim(),
        password
      });

      if (res.success && res.token && res.admin) {
        loginAdmin(res.token, res.admin);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-blue/20 text-brand-blue flex items-center justify-center mx-auto border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-xs text-slate-400">
            UniLife Ethiopia Management & Analytics Console
          </p>
        </div>

        <div className="bg-slate-800 rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-xl space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 text-rose-300 rounded-xl text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Username or Email
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="admin"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold text-xs hover:bg-blue-600 active:scale-98 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In as Administrator'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-700 text-center">
            <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              ← Return to UniLife Ethiopia Website
            </Link>
          </div>
        </div>

        <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-center text-[11px] text-slate-500">
          Super Admin created via secure server setup command.
          Public registration does not allow admin privileges.
        </div>
      </div>
    </div>
  );
}
