import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  CheckSquare,
  GraduationCap,
  Calculator,
  Timer,
  FileText,
  UserCheck,
  Calendar,
  Bell,
  Heart,
  User,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/student/courses', icon: BookOpen },
    { name: 'Class Timetable', path: '/student/timetable', icon: CalendarDays },
    { name: 'Assignments', path: '/student/assignments', icon: CheckSquare },
    { name: 'Examinations', path: '/student/exams', icon: GraduationCap },
    { name: 'GPA & CGPA Calculator', path: '/student/gpa', icon: Calculator },
    { name: 'Study Planner & Timer', path: '/student/study', icon: Timer },
    { name: 'Personal Notes', path: '/student/notes', icon: FileText },
    { name: 'Attendance Tracker', path: '/student/attendance', icon: UserCheck },
    { name: 'Academic Calendar', path: '/student/calendar', icon: Calendar },
    { name: 'Notifications', path: '/student/notifications', icon: Bell }
  ];

  const secondaryItems = [
    { name: 'Support UniLife', path: '/support', icon: Heart, highlight: true },
    { name: 'Profile', path: '/student/profile', icon: User },
    { name: 'Settings', path: '/student/settings', icon: Settings }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link to="/student/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-navy-800 text-white flex items-center justify-center font-bold shadow-md shadow-navy-800/20">
            <GraduationCap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-navy-800 tracking-tight leading-none">UniLife</h1>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Ethiopia Academic Hub</p>
          </div>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Academic Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-sm shadow-blue-500/25 font-semibold'
                    : 'text-slate-600 hover:text-navy-800 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}

        <div className="pt-4 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Account & Community
        </div>

        {secondaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  item.highlight
                    ? isActive
                      ? 'bg-rose-600 text-white font-semibold'
                      : 'text-rose-600 hover:bg-rose-50'
                    : isActive
                    ? 'bg-brand-blue text-white font-semibold'
                    : 'text-slate-600 hover:text-navy-800 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="rounded-xl bg-blue-50/60 p-3 border border-blue-100/60">
          <p className="text-[11px] font-bold text-navy-800">100% Free Academic Tools</p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
            All features are completely free for Ethiopian university students.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
