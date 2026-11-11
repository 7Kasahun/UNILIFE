import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Trash2,
  BookOpen,
  CheckSquare,
  GraduationCap,
  Timer
} from 'lucide-react';

export default function CalendarPage() {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  // Modal State for Personal Event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    event_type: 'Personal',
    event_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '11:00',
    description: '',
    location: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await api.getCalendarFeed();
      if (res.success) {
        setFeed(res.feed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in current month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Aggregate events by date string (YYYY-MM-DD)
  const eventsByDate = {};

  if (feed) {
    // 1. Personal Events
    (feed.personalEvents || []).forEach(e => {
      if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
      eventsByDate[e.date].push({ ...e, category: 'personal', badgeColor: 'bg-navy-800 text-white' });
    });

    // 2. Assignment Due Dates
    (feed.assignments || []).forEach(a => {
      if (!eventsByDate[a.date]) eventsByDate[a.date] = [];
      eventsByDate[a.date].push({
        id: `a-${a.id}`,
        title: `Due: ${a.title}`,
        time: a.start_time,
        category: 'assignment',
        badgeColor: 'bg-amber-500 text-white',
        extra: a.course_name
      });
    });

    // 3. Exams
    (feed.exams || []).forEach(e => {
      if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
      eventsByDate[e.date].push({
        id: `e-${e.id}`,
        title: `Exam: ${e.title} (${e.event_type})`,
        time: e.start_time,
        category: 'exam',
        badgeColor: 'bg-purple-600 text-white',
        extra: `${e.course_name} ${e.location ? `• ${e.location}` : ''}`
      });
    });

    // 4. Study Sessions
    (feed.studySessions || []).forEach(s => {
      if (!eventsByDate[s.date]) eventsByDate[s.date] = [];
      eventsByDate[s.date].push({
        id: `s-${s.id}`,
        title: `Study: ${s.title}`,
        time: s.start_time,
        category: 'study',
        badgeColor: 'bg-emerald-600 text-white'
      });
    });
  }

  // Update selected day events when selected date changes or feed loads
  useEffect(() => {
    setSelectedDayEvents(eventsByDate[selectedDateStr] || []);
  }, [selectedDateStr, feed]);

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createPersonalEvent(formData);
      setIsModalOpen(false);
      fetchCalendar();
    } catch (err) {
      alert(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePersonalEvent = async (id) => {
    if (!window.confirm('Delete this calendar event?')) return;
    try {
      await api.deletePersonalEvent(id);
      fetchCalendar();
    } catch (err) {
      alert(err.message || 'Failed to delete event');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Academic Calendar</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified view of university deadlines, examinations, classes, study sessions, and events.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData(prev => ({ ...prev, event_date: selectedDateStr }));
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Personal Event</span>
        </button>
      </div>

      {/* Calendar Controls & Legend */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-xs transition-all"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-xs transition-all"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-xs transition-all"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-base font-bold text-navy-800">
            {monthNames[month]} {year}
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Assignments</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
            <span>Exams</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>Study</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-navy-800 inline-block" />
            <span>Personal</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Month Calendar & Day Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm overflow-x-auto">
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 uppercase py-2 border-b border-slate-100">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1 pt-2">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[72px] sm:min-h-[88px] bg-slate-50/40 rounded-xl" />
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isSelected = selectedDateStr === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`min-h-[72px] sm:min-h-[88px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-blue bg-blue-50/40 ring-2 ring-brand-blue/20'
                      : 'border-slate-100 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-brand-blue text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event indicator pills */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev, idx) => (
                      <div
                        key={idx}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate ${ev.badgeColor || 'bg-slate-800 text-white'}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-semibold text-slate-400 block text-right">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-navy-800">Events for Selected Date</h3>
              <p className="text-xs text-brand-blue font-semibold">{selectedDateStr}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, event_date: selectedDateStr }));
                setIsModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-blue-50 text-brand-blue hover:bg-blue-100"
              title="Add event for this date"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No assignments, exams, or events scheduled for this day.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ev.badgeColor}`}>
                      {ev.category?.toUpperCase()}
                    </span>
                    {ev.category === 'personal' && ev.id && (
                      <button
                        type="button"
                        onClick={() => handleDeletePersonalEvent(ev.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="font-bold text-xs text-slate-900">{ev.title}</h4>

                  {ev.time && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{ev.time}</span>
                    </p>
                  )}

                  {ev.extra && (
                    <p className="text-[11px] text-slate-400 italic">{ev.extra}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Personal Event */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Academic or Personal Event"
      >
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Project Defense or Campus Seminar"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Category
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Personal">Personal</option>
                <option value="Class">Class / Workshop</option>
                <option value="Assignment">Assignment Submission</option>
                <option value="Exam">Exam / Defense</option>
                <option value="Holiday">University Holiday</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. AAU Main Library or Online Zoom"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows="2"
              placeholder="Event details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
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
              {submitting ? 'Saving...' : 'Add Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
