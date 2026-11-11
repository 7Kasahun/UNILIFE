import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  AlertTriangle,
  User,
  CheckCircle2
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimetablePage() {
  const [entries, setEntries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'daily'
  const [activeDay, setActiveDay] = useState(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return today === 'Sunday' ? 'Monday' : today;
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '',
    day_of_week: 'Monday',
    start_time: '08:30',
    end_time: '10:30',
    classroom: ''
  });
  const [warningMessage, setWarningMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const [tRes, cRes] = await Promise.all([api.getTimetable(), api.getCourses()]);
      if (tRes.success) setEntries(tRes.entries || []);
      if (cRes.success) setCourses(cRes.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const openCreateModal = (day = 'Monday') => {
    setEditingEntry(null);
    setFormData({
      course_id: courses[0]?.id || '',
      day_of_week: day,
      start_time: '08:30',
      end_time: '10:30',
      classroom: ''
    });
    setFormError('');
    setWarningMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setFormData({
      course_id: entry.course_id,
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      classroom: entry.classroom || ''
    });
    setFormError('');
    setWarningMessage('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this class from your timetable?')) return;
    try {
      await api.deleteTimetableEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete entry');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setWarningMessage('');

    if (!formData.course_id) {
      setFormError('Please select a course.');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      setFormError('Ending time must be after starting time.');
      return;
    }

    try {
      setSubmitting(true);
      let res;
      if (editingEntry) {
        res = await api.updateTimetableEntry(editingEntry.id, formData);
      } else {
        res = await api.createTimetableEntry(formData);
      }

      if (res.warning) {
        setWarningMessage(res.warning);
      } else {
        setIsModalOpen(false);
      }
      fetchTimetable();
    } catch (err) {
      setFormError(err.message || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  // Group entries by day
  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = entries.filter(e => e.day_of_week === day);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Class Timetable</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize lecture hours, laboratory sessions, and classrooms with automatic conflict detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'weekly' ? 'bg-white text-navy-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Weekly Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'daily' ? 'bg-white text-navy-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Daily View
            </button>
          </div>

          <button
            type="button"
            onClick={() => openCreateModal(activeDay)}
            disabled={courses.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {courses.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-xs text-amber-800 font-medium">
              You haven't created any courses yet. Add courses before creating your weekly timetable slots.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.href = '/student/courses'}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700"
          >
            Add Courses
          </button>
        </div>
      )}

      {/* Daily View Day Selector Tabs */}
      {viewMode === 'daily' && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeDay === day
                  ? 'bg-navy-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {day}
              <span className="ml-1.5 text-[10px] opacity-70 font-normal">
                ({grouped[day]?.length || 0})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Timetable View */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading timetable...</div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Your timetable is currently empty"
          description="Build your weekly lecture and lab schedule to receive reminders and see your classes on your daily dashboard."
          actionText={courses.length > 0 ? "Add First Class" : "Create Courses First"}
          onAction={() => courses.length > 0 ? openCreateModal('Monday') : window.location.href = '/student/courses'}
        />
      ) : viewMode === 'daily' ? (
        /* Daily View Layout */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-navy-800">{activeDay} Schedule</h3>
            <button
              type="button"
              onClick={() => openCreateModal(activeDay)}
              className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add class on {activeDay}</span>
            </button>
          </div>

          {grouped[activeDay]?.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No classes scheduled for {activeDay}.
            </div>
          ) : (
            <div className="space-y-3">
              {grouped[activeDay].map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-all flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-3 h-12 rounded-full"
                      style={{ backgroundColor: c.color || '#2563EB' }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{c.course_name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{c.course_code}</span>
                        {c.instructor && <span> • {c.instructor}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-navy-800 justify-end">
                        <Clock className="w-3.5 h-3.5 text-brand-blue" />
                        <span>{c.start_time} - {c.end_time}</span>
                      </div>
                      {c.classroom && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 justify-end mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.classroom}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-slate-100"
                        title="Edit slot"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Weekly Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {DAYS.map((day) => {
            const dayEntries = grouped[day] || [];
            return (
              <div
                key={day}
                className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-sm flex flex-col min-h-[260px]"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-navy-800">{day}</span>
                  <button
                    type="button"
                    onClick={() => openCreateModal(day)}
                    className="p-1 text-slate-400 hover:text-brand-blue rounded-md hover:bg-slate-100"
                    title={`Add class to ${day}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  {dayEntries.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] text-slate-300">
                      No classes
                    </div>
                  ) : (
                    dayEntries.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => openEditModal(c)}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: c.color || '#2563EB' }}
                          >
                            {c.course_code}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-600">
                            {c.start_time}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1 group-hover:text-brand-blue">
                          {c.course_name}
                        </h5>
                        {c.classroom && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span className="truncate">{c.classroom}</span>
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEntry ? 'Edit Class Slot' : 'Add Class to Timetable'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
              {formError}
            </div>
          )}

          {warningMessage && (
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-medium border border-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Schedule Conflict Warning</p>
                <p>{warningMessage}</p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-2 text-xs font-semibold text-amber-900 underline block"
                >
                  Keep anyway and close
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Course *
            </label>
            <select
              required
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">-- Choose Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} - {c.course_name} ({c.credit_hours} Cr)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Day of Week *
            </label>
            <select
              required
              value={formData.day_of_week}
              onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Classroom / Lecture Hall / Lab
            </label>
            <input
              type="text"
              placeholder="e.g. Block 42, Room 204 or ICT Lab 1"
              value={formData.classroom}
              onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {editingEntry && (
              <button
                type="button"
                onClick={() => {
                  handleDelete(editingEntry.id);
                  setIsModalOpen(false);
                }}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Delete Slot
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
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
                {submitting ? 'Saving...' : editingEntry ? 'Save Changes' : 'Add Class'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
