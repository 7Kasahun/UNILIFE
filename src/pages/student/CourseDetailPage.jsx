import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/Cards.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import {
  BookOpen,
  ArrowLeft,
  CheckSquare,
  GraduationCap,
  FileText,
  UserCheck,
  Timer,
  Clock,
  User,
  Plus
} from 'lucide-react';

export default function CourseDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const res = await api.getCourseDetail(id);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading course details...</div>;
  }

  if (!data || !data.course) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-slate-800">Course not found</p>
        <Link to="/student/courses" className="text-xs text-brand-blue underline mt-2 inline-block">
          Return to courses
        </Link>
      </div>
    );
  }

  const { course, assignments = [], examinations = [], notes = [], studySessions = [], attendance = {} } = data;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Link>
      </div>

      {/* Course Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-lg text-white mb-2 inline-block"
              style={{ backgroundColor: course.color || '#2563EB' }}
            >
              {course.course_code}
            </span>
            <h1 className="text-2xl font-bold text-navy-800">{course.course_name}</h1>
            {course.description && (
              <p className="text-xs text-slate-500 mt-2 max-w-2xl leading-relaxed">
                {course.description}
              </p>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2 min-w-[200px] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Credit Hours:</span>
              <span className="font-bold text-slate-800">{course.credit_hours} Cr</span>
            </div>
            {course.instructor && (
              <div className="flex justify-between">
                <span className="text-slate-400">Instructor:</span>
                <span className="font-semibold text-slate-700">{course.instructor}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="font-medium text-slate-700">{course.department || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Semester:</span>
              <span className="font-medium text-slate-700">{course.semester || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Attendance Summary Pill */}
        {attendance.stats && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-500 font-medium">Course Attendance:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {attendance.stats.attendancePercentage}% ({attendance.stats.attendedClasses} / {attendance.stats.totalClasses} classes attended)
            </span>
            <span className="text-slate-400">
              Missed: {attendance.stats.missedClasses} • Excused: {attendance.stats.excusedClasses}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'assignments', label: `Assignments (${assignments.length})`, icon: CheckSquare },
          { id: 'exams', label: `Exams (${examinations.length})`, icon: GraduationCap },
          { id: 'notes', label: `Notes (${notes.length})`, icon: FileText },
          { id: 'attendance', label: `Attendance (${attendance.records?.length || 0})`, icon: UserCheck },
          { id: 'study', label: `Study Sessions (${studySessions.length})`, icon: Timer }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'assignments' && (
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No assignments for this course"
                description="Keep track of your coursework deadlines, homework, and projects."
                actionText="Go to Assignments"
                onAction={() => window.location.href = '/student/assignments'}
              />
            ) : (
              assignments.map((a) => (
                <div
                  key={a.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                      <StatusBadge status={a.priority} />
                      <StatusBadge status={a.status} />
                    </div>
                    {a.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description}</p>
                    )}
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-500 block">Due Date:</span>
                    <span className="font-semibold text-slate-800">{new Date(a.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="space-y-3">
            {examinations.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No examinations scheduled"
                description="Add quizzes, midterms, or finals to track countdowns and preparation status."
                actionText="Go to Exam Planner"
                onAction={() => window.location.href = '/student/exams'}
              />
            ) : (
              examinations.map((e) => (
                <div
                  key={e.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{e.title}</h4>
                      <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        {e.exam_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Time: {e.exam_time || '09:00'} {e.location ? `• Location: ${e.location}` : ''}
                    </p>
                  </div>
                  <div className="text-right text-xs font-bold text-navy-800">
                    {e.exam_date}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-3">
            {notes.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No course notes yet"
                description="Capture lecture summaries, formulas, and key points for revision."
                actionText="Go to Notes"
                onAction={() => window.location.href = '/student/notes'}
              />
            ) : (
              notes.map((n) => (
                <Link
                  key={n.id}
                  to="/student/notes"
                  className="bg-white p-4 rounded-xl border border-slate-200 block hover:border-blue-200 transition-colors"
                >
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  {n.tags && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-1 inline-block">
                      {n.tags}
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-3">
            {(!attendance.records || attendance.records.length === 0) ? (
              <EmptyState
                icon={UserCheck}
                title="No attendance records"
                description="Track every lecture you attended, missed, or excused."
                actionText="Go to Attendance Tracker"
                onAction={() => window.location.href = '/student/attendance'}
              />
            ) : (
              attendance.records.map((r) => (
                <div
                  key={r.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={r.status} />
                    <span className="text-xs font-semibold text-slate-800">{r.class_date}</span>
                    {r.notes && <span className="text-xs text-slate-400">({r.notes})</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'study' && (
          <div className="space-y-3">
            {studySessions.length === 0 ? (
              <EmptyState
                icon={Timer}
                title="No study sessions recorded"
                description="Start a timed study session for this course using the built-in stopwatch."
                actionText="Launch Study Timer"
                onAction={() => window.location.href = '/student/study'}
              />
            ) : (
              studySessions.map((s) => (
                <div
                  key={s.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{s.topic}</h4>
                    <span className="text-[11px] text-slate-400">{s.session_date}</span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-brand-blue">{s.actual_minutes} mins</span>
                    <span className="text-slate-400 text-[10px] block">Planned: {s.duration_minutes}m</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
