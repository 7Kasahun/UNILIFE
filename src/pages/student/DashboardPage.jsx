import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { StatCard, StatusBadge } from '../../components/Cards.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import {
  BookOpen,
  CheckSquare,
  GraduationCap,
  Timer,
  Calculator,
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardData();
      if (res.success) {
        const payload = res.data || res.dashboard || {};
        
        // Ensure student courses are loaded
        let studentCourses = payload.courses;
        if (!studentCourses || !Array.isArray(studentCourses)) {
          try {
            const courseRes = await api.getCourses();
            if (courseRes && courseRes.success && Array.isArray(courseRes.courses)) {
              studentCourses = courseRes.courses;
            }
          } catch {
            studentCourses = [];
          }
        }
        if (!Array.isArray(studentCourses)) {
          studentCourses = [];
        }

        const summary = payload.summaryCards || {
          totalCourses: payload.total_courses ?? studentCourses.length,
          upcomingAssignmentsCount: payload.pending_assignments ?? (payload.upcomingAssignments?.length || 0),
          upcomingExamsCount: payload.upcoming_exams ?? (payload.upcomingExaminations?.length || 0),
          weeklyStudyHours: payload.weekly_study_hours || 0,
          targetWeeklyHours: payload.study_goal_hours || 15,
          studyGoalProgress: payload.studyGoalProgress || 0,
          currentGpa: payload.currentGpa || '0.00'
        };

        // Guarantee totalCourses matches registered course list
        if (studentCourses.length > 0 && (!summary.totalCourses || summary.totalCourses === 0)) {
          summary.totalCourses = studentCourses.length;
        }

        setData({
          ...payload,
          summaryCards: summary,
          courses: studentCourses,
          greeting: payload.greeting || 'Welcome back',
          todayDate: payload.todayDate || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          currentDay: payload.currentDay || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your academic life...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-rose-800">Connection Notice</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    greeting,
    todayDate,
    currentDay,
    summaryCards,
    courses = [],
    todaySchedule = [],
    upcomingAssignments = [],
    upcomingExaminations = [],
    announcements = []
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wide">
              {announcements[0].title}
            </h4>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              {announcements[0].content}
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800 tracking-tight">
            {greeting}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-blue" />
            <span>{todayDate}</span>
          </p>
        </div>

        {/* Quick Action Button Dropdown or Group */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/student/courses"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </Link>
          <Link
            to="/student/assignments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Assignment</span>
          </Link>
          <Link
            to="/student/study"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 active:scale-95 transition-all shadow-sm"
          >
            <Timer className="w-4 h-4" />
            <span>Study Timer</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Courses"
          value={summaryCards?.totalCourses ?? courses.length ?? 0}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Upcoming Tasks"
          value={summaryCards?.upcomingAssignmentsCount || 0}
          icon={CheckSquare}
          color="amber"
        />
        <StatCard
          title="Upcoming Exams"
          value={summaryCards?.upcomingExamsCount || 0}
          icon={GraduationCap}
          color="purple"
        />
        <StatCard
          title="Study This Week"
          value={`${summaryCards?.weeklyStudyHours || 0}h`}
          subtitle={`Goal: ${summaryCards?.targetWeeklyHours || 15}h (${summaryCards?.studyGoalProgress || 0}%)`}
          icon={Timer}
          color="emerald"
        />
        <StatCard
          title="Current GPA"
          value={summaryCards?.currentGpa || '0.00'}
          subtitle="Semester Standing"
          icon={Calculator}
          color="navy"
        />
      </div>

      {/* Main Grid: Registered Courses, Schedule & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Registered Courses, Today's Classes & Upcoming Deadlines */}
        <div className="lg:col-span-7 space-y-6">
          {/* Registered Courses Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-brand-blue rounded-xl">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-navy-800">My Registered Courses</h3>
                  <p className="text-[11px] text-slate-400">
                    {courses.length} {courses.length === 1 ? 'course' : 'courses'} enrolled
                  </p>
                </div>
              </div>
              <Link
                to="/student/courses"
                className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
              >
                <span>View All Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="p-6 bg-slate-50/70 rounded-xl text-center border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">No courses registered yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Add your academic courses to organize assignments, schedules, and exams.</p>
                <Link
                  to="/student/courses"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register First Course</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/student/courses/${course.id}`}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/40 hover:border-blue-200 transition-all flex items-start gap-3 group"
                  >
                    <div
                      className="w-2.5 h-10 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: course.color || '#2563EB' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-brand-blue">
                          {course.course_code}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {course.credit_hours} Cr.
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-1 group-hover:text-brand-blue transition-colors">
                        {course.course_name}
                      </h4>
                      {course.instructor && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {course.instructor}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Today's Schedule Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-brand-blue rounded-xl">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-navy-800">Today's Class Schedule</h3>
                  <p className="text-[11px] text-slate-400">{currentDay}</p>
                </div>
              </div>
              <Link
                to="/student/timetable"
                className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="p-6 bg-slate-50/70 rounded-xl text-center border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">No classes scheduled for today.</p>
                <p className="text-[11px] text-slate-400 mt-1">Enjoy your study time or prepare ahead!</p>
                <Link
                  to="/student/timetable"
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Add Class to Timetable</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySchedule.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-10 rounded-full"
                        style={{ backgroundColor: c.color || '#2563EB' }}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{c.course_name}</h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-slate-700">{c.course_code}</span>
                          {c.instructor && <span>• {c.instructor}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-bold text-navy-800 justify-end">
                        <Clock className="w-3.5 h-3.5 text-brand-blue" />
                        <span>{c.start_time} - {c.end_time}</span>
                      </div>
                      {c.classroom && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 justify-end mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{c.classroom}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-navy-800">Upcoming Assignments & Tasks</h3>
                  <p className="text-[11px] text-slate-400">Deadlines approaching</p>
                </div>
              </div>
              <Link
                to="/student/assignments"
                className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
              >
                <span>All Assignments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingAssignments.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No pending assignments"
                description="You are completely caught up! Add your upcoming projects or lab assignments to stay ahead."
                actionText="Add Assignment"
                onAction={() => navigate('/student/assignments')}
              />
            ) : (
              <div className="space-y-2.5">
                {upcomingAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/70 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                        <StatusBadge status={a.priority} />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Course: <span className="font-medium text-slate-700">{a.course_name}</span> ({a.course_code})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        a.days_remaining <= 1
                          ? 'bg-rose-100 text-rose-700 font-extrabold'
                          : a.days_remaining <= 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {a.days_remaining <= 0 ? 'Due Today' : `${a.days_remaining}d left`}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Due: {new Date(a.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Examinations & Quick Actions & Study Progress */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Examinations Countdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-navy-800">Exam Countdown</h3>
                  <p className="text-[11px] text-slate-400">Tests, Midterms & Finals</p>
                </div>
              </div>
              <Link
                to="/student/exams"
                className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
              >
                <span>Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingExaminations.length === 0 ? (
              <div className="p-6 bg-slate-50/70 rounded-xl text-center border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">No upcoming examinations recorded.</p>
                <Link
                  to="/student/exams"
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Add Examination</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingExaminations.map((e) => (
                  <div
                    key={e.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{e.title}</h4>
                        <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded">
                          {e.exam_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {e.course_name} {e.location ? `• ${e.location}` : ''}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-navy-800">
                        {e.days_remaining <= 0 ? 'Today!' : `${e.days_remaining}d`}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {e.exam_date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Study Progress Card */}
          <div className="bg-gradient-to-br from-navy-800 to-blue-900 text-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                Weekly Study Progress
              </span>
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                {summaryCards?.studyGoalProgress || 0}%
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {summaryCards?.weeklyStudyHours || 0}
                </span>
                <span className="text-xs text-blue-200">
                  / {summaryCards?.targetWeeklyHours || 15} hours goal
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/20 h-2.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${summaryCards?.studyGoalProgress || 0}%` }}
                />
              </div>
            </div>

            <Link
              to="/student/study"
              className="w-full py-2 bg-white text-navy-800 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Timer className="w-4 h-4 text-brand-blue" />
              <span>Launch Study Timer</span>
            </Link>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              Productivity Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/student/gpa"
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 transition-colors flex items-center gap-2.5"
              >
                <Calculator className="w-4 h-4 text-brand-blue" />
                <span className="text-xs font-semibold text-slate-800">GPA Calculator</span>
              </Link>
              <Link
                to="/student/notes"
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 transition-colors flex items-center gap-2.5"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-800">Add Note</span>
              </Link>
              <Link
                to="/student/attendance"
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 transition-colors flex items-center gap-2.5"
              >
                <CalendarDays className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-slate-800">Attendance</span>
              </Link>
              <Link
                to="/student/calendar"
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 transition-colors flex items-center gap-2.5"
              >
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-slate-800">Full Calendar</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
