import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Building,
  BookOpen,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function RegisterPage() {
  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    confirm_password: '',
    university: '',
    department: '',
    degree_program: 'Bachelor of Science (B.Sc.)',
    current_year: 1,
    accept_terms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadOptions() {
      try {
        const [uRes, dRes] = await Promise.all([
          api.getUniversities(),
          api.getDepartments()
        ]);
        if (uRes.success) setUniversities(uRes.universities || []);
        if (dRes.success) setDepartments(dRes.departments || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (form.password !== form.confirm_password) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!form.university.trim() || !form.department.trim()) {
      setErrorMessage('Please enter your university and department / field of study.');
      return;
    }

    if (!form.accept_terms) {
      setErrorMessage('You must accept the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.register(form);
      if (res.success && res.token && res.user) {
        loginStudent(res.token, res.user);
        navigate('/student/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-navy-800 to-brand-blue text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800 tracking-tight">
            Create Free Student Account
          </h1>
          <p className="text-xs text-slate-500">
            Join thousands of Ethiopian students organizing their academic lives with UniLife.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Almaz Tadesse"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  placeholder="e.g. almaz_t"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue font-mono"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="e.g. student@aau.edu.et or personal@gmail.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {/* University & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University or College *
                </label>
                <input
                  type="text"
                  list="uni-options"
                  placeholder="e.g. Addis Ababa University"
                  required
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <datalist id="uni-options">
                  {universities.map((u) => (
                    <option key={u.id} value={u.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Field of Study *
                </label>
                <input
                  type="text"
                  list="dept-options"
                  placeholder="e.g. Computer Science"
                  required
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <datalist id="dept-options">
                  {departments.map((d) => (
                    <option key={d.id} value={d.name} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Degree Program & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Degree / Program
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.Sc. Software Engineering"
                  value={form.degree_program}
                  onChange={(e) => setForm({ ...form, degree_program: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Year of Study
                </label>
                <select
                  value={form.current_year}
                  onChange={(e) => setForm({ ...form, current_year: Number(e.target.value) })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value={1}>Year 1 (Freshman)</option>
                  <option value={2}>Year 2 (Sophomore)</option>
                  <option value={3}>Year 3 (Junior)</option>
                  <option value={4}>Year 4 (Senior)</option>
                  <option value={5}>Year 5 (Final Year)</option>
                  <option value={6}>Postgraduate</option>
                </select>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (min 8 chars) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={form.accept_terms}
                  onChange={(e) => setForm({ ...form, accept_terms: e.target.checked })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue mt-0.5"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-brand-blue font-semibold hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" className="text-brand-blue font-semibold hover:underline">
                    Privacy Policy
                  </Link>
                  . I understand that all academic features are free.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Creating your account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-blue hover:underline">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
