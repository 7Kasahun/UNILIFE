import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import {
  GraduationCap,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [devToken, setDevToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setSubmitting(true);
      const res = await api.forgotPassword({ email: email.trim() });
      if (res.success) {
        setSuccessMsg(res.message);
        if (res.devResetToken) {
          setDevToken(res.devResetToken);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error processing request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-navy-800 to-brand-blue text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-navy-800 tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your student account email address to receive password reset instructions.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
              {devToken && (
                <div className="p-2.5 bg-white rounded-lg border border-emerald-100 mt-2 font-mono text-[11px] text-slate-700">
                  <span className="font-bold text-navy-800 block mb-1">Local Testing Reset Link:</span>
                  <Link
                    to={`/reset-password?token=${devToken}`}
                    className="text-brand-blue underline break-all font-semibold"
                  >
                    Click here to reset password directly
                  </Link>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email Address *
              </label>
              <input
                type="email"
                placeholder="e.g. abebe@aau.edu.et"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold text-xs hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50"
            >
              {submitting ? 'Sending Request...' : 'Send Reset Instructions'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-navy-800 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
