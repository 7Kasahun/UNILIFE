import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  GraduationCap,
  Calculator,
  Timer,
  FileText,
  UserCheck,
  Calendar,
  Heart,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Smartphone
} from 'lucide-react';

export default function WelcomePage() {
  const { isStudentAuthenticated } = useAuth();

  const features = [
    {
      title: 'Course Management',
      desc: 'Organize credit hours, instructors, lecture halls, and semester syllabi in one private hub.',
      icon: BookOpen,
      color: 'bg-blue-50 text-brand-blue'
    },
    {
      title: 'Class Timetable',
      desc: 'Weekly and daily interactive timetables with automated schedule conflict alerts.',
      icon: CalendarDays,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'Assignment Tracker',
      desc: 'Keep track of upcoming deadlines, priority indicators, and automated countdowns.',
      icon: CheckSquare,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      title: 'Examination Planner',
      desc: 'Midterm, quiz, and final exam count-downs with preparation readiness checklists.',
      icon: GraduationCap,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Ethiopian GPA & CGPA',
      desc: 'Transparent formula computation adhering to Ethiopian higher education grading standards.',
      icon: Calculator,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Study Planner & Timer',
      desc: 'Live stopwatch with session saving and weekly target goal monitoring.',
      icon: Timer,
      color: 'bg-rose-50 text-rose-600'
    },
    {
      title: 'Personal Notes',
      desc: 'Private lecture notes, exam tips, and formulas linked directly to your courses.',
      icon: FileText,
      color: 'bg-sky-50 text-sky-600'
    },
    {
      title: 'Attendance Tracker',
      desc: 'Monitor lecture and lab attendance percentages to ensure 80%+ sitting criteria.',
      icon: UserCheck,
      color: 'bg-teal-50 text-teal-600'
    },
    {
      title: 'Installable PWA',
      desc: 'Works seamlessly on Android, iOS, and desktop browsers with offline shell caching.',
      icon: Smartphone,
      color: 'bg-slate-100 text-slate-800'
    }
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-brand-blue text-xs font-bold border border-blue-200 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>The All-In-One Platform for Ethiopian University Students</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-800 tracking-tight leading-tight">
          Your Entire Student Life, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-indigo-600">
            Organized in One Place.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
          Study smarter. Stay organized. Achieve more. Everything you need to master coursework, track deadlines, compute GPA, and plan study sessions — 100% free forever.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isStudentAuthenticated ? (
            <Link
              to="/student/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-blue text-white font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <span>Go to Your Student Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-blue text-white font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <span>Create Free Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all shadow-sm flex items-center justify-center"
              >
                <span>Sign In to Your Account</span>
              </Link>
            </>
          )}
        </div>

        <p className="text-xs text-slate-400 font-medium">
          No credit card required • No hidden subscriptions • Open to all university & college students in Ethiopia
        </p>
      </div>

      {/* Feature Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-navy-800 tracking-tight">Built Specifically for Students</h2>
          <p className="text-xs text-slate-500 mt-1">
            Replace disconnected spreadsheets, sticky notes, and paper timetables with a cohesive productivity suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all space-y-3"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-navy-800">{feat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Philosophy Banner */}
      <div className="bg-gradient-to-br from-navy-800 via-blue-900 to-brand-blue text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
            Our Core Mission & Philosophy
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            "Education Should Be Accessible to Everyone."
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl mx-auto">
            UniLife Ethiopia is proudly non-commercial. There are no paid tiers or locked academic features.
            Whether you are a freshman in Addis Ababa University or a graduating senior in Hawassa or Bahir Dar,
            UniLife belongs to every Ethiopian student.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              to="/support"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-navy-800 text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Support Our Mission</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
