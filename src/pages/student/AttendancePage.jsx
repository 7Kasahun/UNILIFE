import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { StatusBadge, StatCard } from '../../components/Cards.jsx';
import {
  UserCheck,
  Plus,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trash2,
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function AttendancePage() {
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    course_id: '',
    class_date: new Date().toISOString().split('T')[0],
    status: 'Attended',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const query = selectedCourseFilter ? `?course_id=${selectedCourseFilter}` : '';
      const [aRes, cRes] = await Promise.all([
        api.getAttendance(query),
        api.getCourses()
      ]);
      if (aRes.success) setData(aRes);
      if (cRes.success) {
        setCourses(cRes.courses || []);
        if (!formData.course_id && cRes.courses.length > 0) {
          setFormData(prev => ({ ...prev, course_id: cRes.courses[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedCourseFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance entry?')) return;
    try {
      await api.deleteAttendance(id);
      fetchAttendance();
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.course_id || !formData.class_date || !formData.status) {
      setFormError('Course, class date, and status are required.');
      return;
    }

    try {
      setSubmitting(true);
      await api.recordAttendance(formData);
      setIsModalOpen(false);
      setFormData({
        course_id: courses[0]?.id || '',
        class_date: new Date().toISOString().split('T')[0],
        status: 'Attended',
        notes: ''
      });
      fetchAttendance();
    } catch (err) {
      setFormError(err.message || 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const records = data?.records || [];
  const overall = data?.overall || { totalRecorded: 0, attended: 0, absent: 0, excused: 0, attendancePercentage: '100.0' };
  const byCourse = data?.byCourse || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Personal Attendance Tracker</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log lectures and lab attendance to stay disciplined and satisfy the 75%+ or 80%+ exam sitting requirements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={courses.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Record Class Attendance</span>
        </button>
      </div>

      {/* Official Disclaimer Banner */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <p className="font-bold">Personal Academic Tracker Disclaimer</p>
          <p className="mt-0.5">
            {overall.disclaimer || 'This is a personal student organizer for your own habits and study monitoring. It is not an official university registrar attendance record.'}
          </p>
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${overall.attendancePercentage}%`}
          subtitle="Overall Attended"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Attended"
          value={overall.attended}
          subtitle="Classes Present"
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          title="Absent / Missed"
          value={overall.absent}
          subtitle="Unattended"
          icon={XCircle}
          color="amber"
        />
        <StatCard
          title="Excused"
          value={overall.excused}
          subtitle="With Permission"
          icon={HelpCircle}
          color="purple"
        />
      </div>

      {/* Course-by-Course Attendance Rates */}
      {byCourse.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-navy-800">Attendance Rate by Course</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {byCourse.map((c) => {
              const pct = Number(c.percentage);
              const isWarning = pct < 80;
              return (
                <div
                  key={c.course_id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: c.color || '#2563EB' }}
                    >
                      {c.course_code}
                    </span>
                    <span className={`text-xs font-black ${isWarning ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {c.percentage}%
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mt-2 line-clamp-1">{c.course_name}</h4>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between text-[11px] text-slate-500">
                    <span>{c.attended} / {c.total} attended</span>
                    {isWarning && (
                      <span className="text-rose-600 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Under 80%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <h3 className="font-bold text-sm text-navy-800">Attendance Log History</h3>
          <div className="w-full sm:w-auto">
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="">Filter by Course: All</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} - {c.course_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading attendance history...</div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No attendance records found"
            description="Log your first class session attendance to calculate your course participation rates."
            actionText={courses.length > 0 ? "Record Attendance" : "Add Course First"}
            onAction={() => courses.length > 0 ? setIsModalOpen(true) : window.location.href = '/student/courses'}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <StatusBadge status={r.status} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{r.course_name} ({r.course_code})</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{r.class_date}</span>
                      {r.notes && <span>• Note: {r.notes}</span>}
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="p-1 rounded text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Class Attendance"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course *
            </label>
            <select
              required
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} - {c.course_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class Date *
              </label>
              <input
                type="date"
                required
                value={formData.class_date}
                onChange={(e) => setFormData({ ...formData, class_date: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue font-bold"
              >
                <option value="Attended">Attended (Present)</option>
                <option value="Absent">Absent (Missed)</option>
                <option value="Excused">Excused (Permitted)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Lab experiment session 2 or sick leave"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-blue text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Record Attendance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
