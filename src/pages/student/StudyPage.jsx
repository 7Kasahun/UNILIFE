import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Plus,
  Target,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  Save
} from 'lucide-react';

export default function StudyPage() {
  const [sessions, setSessions] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Timer State (Persisted across refreshes)
  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    return localStorage.getItem('unilife_timer_running') === 'true';
  });
  const [timerSeconds, setTimerSeconds] = useState(() => {
    const saved = localStorage.getItem('unilife_timer_seconds');
    return saved ? Number(saved) : 0;
  });
  const [timerTopic, setTimerTopic] = useState(() => {
    return localStorage.getItem('unilife_timer_topic') || '';
  });
  const [timerCourseId, setTimerCourseId] = useState(() => {
    return localStorage.getItem('unilife_timer_course_id') || '';
  });

  const timerIntervalRef = useRef(null);

  // Goal Modal & Manual Session Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [targetHoursInput, setTargetHoursInput] = useState('15');

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    course_id: '',
    topic: '',
    session_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    duration_minutes: '45',
    actual_minutes: '45',
    is_completed: true,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStudyData = async () => {
    try {
      setLoading(true);
      const [sRes, cRes] = await Promise.all([api.getStudySessions(), api.getCourses()]);
      if (sRes.success) {
        setSessions(sRes.sessions || []);
        setWeeklyStats(sRes.weeklyStats || null);
        if (sRes.weeklyStats?.targetHours) {
          setTargetHoursInput(String(sRes.weeklyStats.targetHours));
        }
      }
      if (cRes.success) {
        setCourses(cRes.courses || []);
        if (!timerCourseId && cRes.courses.length > 0) {
          setTimerCourseId(cRes.courses[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyData();
  }, []);

  // Timer interval handling
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          const next = prev + 1;
          localStorage.setItem('unilife_timer_seconds', String(next));
          return next;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    localStorage.setItem('unilife_timer_running', String(isTimerRunning));
    localStorage.setItem('unilife_timer_topic', timerTopic);
    localStorage.setItem('unilife_timer_course_id', String(timerCourseId));

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerTopic, timerCourseId]);

  const handleStartTimer = () => {
    if (!timerTopic.trim()) {
      alert('Please specify what topic or chapter you are studying.');
      return;
    }
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    if (!window.confirm('Reset this timer session?')) return;
    setIsTimerRunning(false);
    setTimerSeconds(0);
    localStorage.removeItem('unilife_timer_seconds');
  };

  const handleSaveTimerSession = async () => {
    if (timerSeconds < 60) {
      alert('You have studied for less than a minute. Timer must record at least 1 minute to save.');
      return;
    }

    const minutesStudied = Math.round(timerSeconds / 60);

    try {
      await api.createStudySession({
        course_id: timerCourseId || null,
        topic: timerTopic || 'Focused Study Session',
        session_date: new Date().toISOString().split('T')[0],
        start_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration_minutes: minutesStudied,
        actual_minutes: minutesStudied,
        is_completed: 1,
        notes: `Logged via UniLife Live Stopwatch (${minutesStudied} minutes)`
      });

      // Reset
      setIsTimerRunning(false);
      setTimerSeconds(0);
      setTimerTopic('');
      localStorage.removeItem('unilife_timer_seconds');
      localStorage.removeItem('unilife_timer_topic');

      alert('🎉 Study session recorded successfully to your weekly total!');
      fetchStudyData();
    } catch (err) {
      alert(err.message || 'Failed to save session');
    }
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    try {
      await api.updateStudyGoal({ target_hours_per_week: Number(targetHoursInput) });
      setIsGoalModalOpen(false);
      fetchStudyData();
    } catch (err) {
      alert(err.message || 'Failed to update goal');
    }
  };

  const handleSaveManualSession = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createStudySession(sessionForm);
      setIsSessionModalOpen(false);
      fetchStudyData();
    } catch (err) {
      alert(err.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this study log record?')) return;
    try {
      await api.deleteStudySession(id);
      fetchStudyData();
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  // Format timer display
  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;
  const formatTime = (val) => String(val).padStart(2, '0');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Study Planner & Live Timer</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Focus sessions, track actual study hours, and monitor weekly study goals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsGoalModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Target className="w-4 h-4 text-brand-blue" />
            <span>Weekly Goal</span>
          </button>
          <button
            type="button"
            onClick={() => setIsSessionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Log Past Session</span>
          </button>
        </div>
      </div>

      {/* Hero: Interactive Live Study Timer */}
      <div className="bg-gradient-to-br from-navy-800 via-blue-900 to-brand-blue text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold">
            <Timer className="w-4 h-4 text-amber-300" />
            <span>Active Study Session Stopwatch</span>
          </div>

          {/* Huge Digital Clock */}
          <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-md">
            {hours > 0 && <span>{formatTime(hours)}:</span>}
            {formatTime(minutes)}:{formatTime(seconds)}
          </div>

          {/* Course & Topic Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left">
            <div>
              <label className="text-[11px] font-semibold text-blue-200 block mb-1">
                Associated Course:
              </label>
              <select
                value={timerCourseId}
                onChange={(e) => setTimerCourseId(e.target.value)}
                disabled={isTimerRunning}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
              >
                <option value="" className="text-slate-900">General Study</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id} className="text-slate-900">
                    {c.course_code} - {c.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-blue-200 block mb-1">
                Study Topic / Target:
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 3 Algorithms"
                value={timerTopic}
                onChange={(e) => setTimerTopic(e.target.value)}
                disabled={isTimerRunning}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {!isTimerRunning ? (
              <button
                type="button"
                onClick={handleStartTimer}
                className="px-6 py-3 rounded-2xl bg-amber-400 text-navy-800 font-bold text-sm hover:bg-amber-300 active:scale-95 transition-all shadow-lg flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{timerSeconds > 0 ? 'Resume Timer' : 'Start Focus Session'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseTimer}
                className="px-6 py-3 rounded-2xl bg-white text-navy-800 font-bold text-sm hover:bg-slate-100 active:scale-95 transition-all shadow-lg flex items-center gap-2"
              >
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </button>
            )}

            {timerSeconds > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleSaveTimerSession}
                  className="px-5 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Session</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Progress Tracker Card */}
      {weeklyStats && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-sm text-navy-800">Weekly Goal Progress</h3>
              <p className="text-xs text-slate-500">
                You have recorded {weeklyStats.totalHours} study hours in the last 7 days.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-navy-800">{weeklyStats.totalHours}</span>
              <span className="text-xs text-slate-400 font-medium"> / {weeklyStats.targetHours}h ({weeklyStats.progressPercent}%)</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-brand-blue h-full rounded-full transition-all duration-500"
                style={{ width: `${weeklyStats.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Study Log History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-navy-800">Recorded Study Sessions</h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading session history...</div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Timer}
            title="No study sessions logged yet"
            description="Start your first study session with the live timer above or log a previous study period."
            actionText="Start Studying Now"
            onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {sessions.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/70 px-2 rounded-xl transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.topic}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.course_name ? `${item.course_name} (${item.course_code}) • ` : ''}
                    Date: {item.session_date} {item.start_time ? `at ${item.start_time}` : ''}
                  </p>
                  {item.notes && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">{item.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-bold text-brand-blue">{item.actual_minutes} mins</span>
                    <span className="text-[10px] text-slate-400 block">Logged</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(item.id)}
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

      {/* Modal: Weekly Goal Target */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Set Weekly Study Goal"
      >
        <form onSubmit={handleUpdateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Study Hours per Week *
            </label>
            <input
              type="number"
              step="1"
              min="1"
              max="100"
              required
              value={targetHoursInput}
              onChange={(e) => setTargetHoursInput(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Recommended for Ethiopian university students: 15 to 25 hours of focused self-study per week.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-blue text-white hover:bg-blue-700"
            >
              Save Goal
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Log Manual Past Session */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Log Completed Study Session"
      >
        <form onSubmit={handleSaveManualSession} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course (Optional)
            </label>
            <select
              value={sessionForm.course_id}
              onChange={(e) => setSessionForm({ ...sessionForm, course_id: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">General Study</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} - {c.course_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Study Topic *
            </label>
            <input
              type="text"
              placeholder="e.g. Operating Systems Concurrency"
              required
              value={sessionForm.topic}
              onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={sessionForm.session_date}
                onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                min="5"
                max="720"
                required
                value={sessionForm.actual_minutes}
                onChange={(e) => setSessionForm({
                  ...sessionForm,
                  actual_minutes: e.target.value,
                  duration_minutes: e.target.value
                })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Session Notes
            </label>
            <textarea
              rows="2"
              placeholder="Summary of what was accomplished..."
              value={sessionForm.notes}
              onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSessionModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-blue text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Log Session'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
