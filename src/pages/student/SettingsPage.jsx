import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Globe,
  Bell,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { logoutStudent } = useAuth();
  const navigate = useNavigate();

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Preference state
  const [preferences, setPreferences] = useState({
    language: 'en',
    email_notifications: true,
    push_notifications: true
  });
  const [prefSuccess, setPrefSuccess] = useState('');

  // Account deletion state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    try {
      setChangingPassword(true);
      const res = await api.changePassword(passwordForm);
      if (res.success) {
        setPasswordSuccess('Password has been changed successfully.');
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setPrefSuccess('');
    try {
      await api.updateSettings(preferences);
      setPrefSuccess('Preferences updated.');
      setTimeout(() => setPrefSuccess(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save preferences');
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm account deletion.');
      return;
    }

    if (!window.confirm('⚠️ WARNING: Are you completely sure you want to permanently delete your UniLife account? All your courses, assignments, study sessions, and notes will be permanently erased.')) {
      return;
    }

    try {
      setDeleting(true);
      const res = await api.deleteAccount({ password: deletePassword });
      if (res.success) {
        alert(res.message);
        logoutStudent();
        navigate('/');
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your password security, notifications, language, and data privacy.
        </p>
      </div>

      {/* Security: Change Password */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 bg-blue-50 text-brand-blue rounded-xl">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-navy-800">Security & Password</h3>
            <p className="text-[11px] text-slate-400">Ensure your account is protected with a strong password.</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              className="w-full sm:max-w-md text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (min 8 chars) *
              </label>
              <input
                type="password"
                required
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="px-4 py-2 bg-brand-blue text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {changingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Language & Notifications */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-navy-800">Language & Preferences</h3>
            <p className="text-[11px] text-slate-400">Localization and alert channels.</p>
          </div>
        </div>

        {prefSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
            {prefSuccess}
          </div>
        )}

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Display Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              className="w-full sm:max-w-xs text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue font-medium"
            >
              <option value="en">English (Default)</option>
              <option value="am">Amharic (አማርኛ) — Preview Scaffolding</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Full UTF-8 Amharic localization support is ready in the architecture.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_notifications}
                onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })}
                className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
              />
              <span className="text-xs font-semibold text-slate-700">Email Submission & Exam Alerts</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.push_notifications}
                onChange={(e) => setPreferences({ ...preferences, push_notifications: e.target.checked })}
                className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
              />
              <span className="text-xs font-semibold text-slate-700">Browser & PWA In-App Notifications</span>
            </label>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900 transition-colors"
          >
            Save Preferences
          </button>
        </form>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-rose-200">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-rose-900">Danger Zone: Account Deletion</h3>
            <p className="text-[11px] text-rose-700">Permanent and irreversible removal of your account and records.</p>
          </div>
        </div>

        {deleteError && (
          <div className="p-3 bg-white text-rose-800 rounded-xl text-xs font-semibold border border-rose-300">
            {deleteError}
          </div>
        )}

        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <p className="text-xs text-rose-800 leading-relaxed">
            Deleting your account will permanently wipe all your enrolled courses, assignments, study logs, grades, and private notes.
            To proceed, enter your current password below.
          </p>

          <div>
            <input
              type="password"
              placeholder="Enter your current password to confirm"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full sm:max-w-md text-xs px-3 py-2.5 rounded-xl border border-rose-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={deleting}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting account...' : 'Permanently Delete My Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
