import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api.js';
import {
  Users,
  UserCheck,
  BookOpen,
  CheckSquare,
  GraduationCap,
  Timer,
  Heart,
  TrendingUp,
  AlertCircle,
  Building,
  Activity
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAnalytics();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-400">Loading live platform metrics...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-950/40 border border-rose-800 rounded-2xl text-center text-rose-300">
        <p className="text-sm font-bold">{error}</p>
      </div>
    );
  }

  const { summary = {}, charts = {} } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Analytics & Insights</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time metrics computed directly from database records. Zero synthetic data.
        </p>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Registered Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{summary.totalStudents || 0}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Today: <span className="text-emerald-400 font-bold">+{summary.newRegsToday || 0}</span> • This Week: <span className="text-blue-300 font-bold">+{summary.newRegsThisWeek || 0}</span>
          </p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Students (30d)</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{summary.activeStudents || 0}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.totalStudents > 0
              ? `${Math.round(((summary.activeStudents || 0) / summary.totalStudents) * 100)}% 30-day activity rate`
              : 'Active accounts'}
          </p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Verified Contributions</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{summary.totalVerifiedDonations || 0} ETB</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.verifiedDonationCount || 0} verified contributions
          </p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Pending Review</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{summary.pendingDonationsCount || 0}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Donation receipts awaiting check
          </p>
        </div>
      </div>

      {/* Feature Usage Stats Grid */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6">
        <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-blue" />
          <span>Platform Feature Utilization</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(charts.featureUsage || []).map((f) => (
            <div key={f.feature} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/60 text-center">
              <span className="text-xl font-black text-white block">{f.count}</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase mt-1 block">{f.feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown: Registration Trends & University Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Registration Daily Trend (7 cols) */}
        <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Recent Student Registration Activity</span>
          </h3>

          {(!charts.registrationTrends || charts.registrationTrends.length === 0) ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No recent registration data within the last 14 days.
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              {charts.registrationTrends.map((t) => (
                <div key={t.date} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/50">
                  <span className="font-mono text-slate-300">{t.date}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-blue h-full rounded-full"
                        style={{ width: `${Math.min(100, t.count * 20)}%` }}
                      />
                    </div>
                    <span className="font-bold text-white w-8 text-right">+{t.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* University Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-400" />
            <span>Students by University</span>
          </h3>

          {(!charts.universityDistribution || charts.universityDistribution.length === 0) ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No registered students yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {charts.universityDistribution.map((u) => (
                <div key={u.university} className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
                    {u.university}
                  </span>
                  <span className="text-xs font-bold text-brand-blue bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                    {u.student_count} students
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
