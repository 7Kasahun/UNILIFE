import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import {
  User,
  GraduationCap,
  Building,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  const { student, loginStudent } = useAuth();
  const [profile, setProfile] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    university: '',
    department: '',
    degree_program: '',
    current_year: 1
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [pRes, uRes, dRes] = await Promise.all([
          api.getProfile(),
          api.getUniversities(),
          api.getDepartments()
        ]);

        if (pRes.success && pRes.user) {
          setProfile(pRes.user);
          setForm({
            full_name: pRes.user.full_name || '',
            university: pRes.user.university || '',
            department: pRes.user.department || '',
            degree_program: pRes.user.degree_program || '',
            current_year: pRes.user.current_year || 1
          });
        }
        if (uRes.success) setUniversities(uRes.universities || []);
        if (dRes.success) setDepartments(dRes.departments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      setSaving(true);
      const res = await api.updateProfile(form);
      if (res.success) {
        setMessage('Your profile information has been updated successfully!');
        // Update local session
        const updated = { ...student, ...form };
        const token = localStorage.getItem('unilife_student_token');
        loginStudent(token, updated);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading student profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Student Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your enrolled university details, field of study, and academic year.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-navy-800 to-brand-blue text-white flex items-center justify-center font-black text-2xl uppercase shadow-md shadow-blue-500/20">
            {profile?.full_name ? profile.full_name.charAt(0) : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-800">{profile?.full_name}</h2>
            <p className="text-xs text-slate-500">@{profile?.username} • {profile?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-brand-blue border border-blue-200">
                Year {profile?.current_year || 1} Student
              </span>
              <span className="text-[10px] text-slate-400">
                Joined: {new Date(profile?.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="pt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                University or College *
              </label>
              <input
                type="text"
                list="university-list"
                required
                value={form.university}
                onChange={(e) => setForm({ ...form, university: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <datalist id="university-list">
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
                list="department-list"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <datalist id="department-list">
                {departments.map((d) => (
                  <option key={d.id} value={d.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Degree / Program
              </label>
              <input
                type="text"
                placeholder="e.g. B.Sc. in Software Engineering"
                value={form.degree_program}
                onChange={(e) => setForm({ ...form, degree_program: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Year of Study
              </label>
              <select
                value={form.current_year}
                onChange={(e) => setForm({ ...form, current_year: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value={1}>Year 1 (Freshman)</option>
                <option value={2}>Year 2 (Sophomore)</option>
                <option value={3}>Year 3 (Junior)</option>
                <option value={4}>Year 4 (Senior)</option>
                <option value={5}>Year 5 (Final Year)</option>
                <option value={6}>Postgraduate / Masters / PhD</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
