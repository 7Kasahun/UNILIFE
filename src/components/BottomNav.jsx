import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  CheckSquare,
  MoreHorizontal,
  Calculator,
  Timer,
  FileText,
  UserCheck,
  Calendar,
  Heart,
  Settings,
  User,
  X
} from 'lucide-react';

export default function BottomNav() {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  const primaryTabs = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Courses', path: '/student/courses', icon: BookOpen },
    { name: 'Timetable', path: '/student/timetable', icon: CalendarDays },
    { name: 'Tasks', path: '/student/assignments', icon: CheckSquare },
  ];

  const moreItems = [
    { name: 'Examinations', path: '/student/exams', icon: BookOpen },
    { name: 'GPA & CGPA Calculator', path: '/student/gpa', icon: Calculator },
    { name: 'Study Planner & Timer', path: '/student/study', icon: Timer },
    { name: 'Personal Notes', path: '/student/notes', icon: FileText },
    { name: 'Attendance Tracker', path: '/student/attendance', icon: UserCheck },
    { name: 'Academic Calendar', path: '/student/calendar', icon: Calendar },
    { name: 'Support UniLife', path: '/support', icon: Heart, highlight: true },
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'Settings', path: '/student/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] safe-bottom">
        <div className="grid grid-cols-5 h-16">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                    isActive ? 'text-brand-blue font-semibold' : 'text-slate-500 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </NavLink>
            );
          })}

          {/* More Button */}
          <button
            type="button"
            onClick={() => setShowMoreDrawer(true)}
            className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* More Drawer Sheet */}
      {showMoreDrawer && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMoreDrawer(false)}
          />

          <div className="relative z-10 bg-white rounded-t-3xl border-t border-slate-200 p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[80vh] overflow-y-auto safe-bottom">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-navy-800">All Academic Tools</h3>
              <button
                type="button"
                onClick={() => setShowMoreDrawer(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 py-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMoreDrawer(false)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 transition-all text-center group active:scale-95"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-colors ${
                        item.highlight
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-white text-navy-800 shadow-sm group-hover:bg-brand-blue group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <p className="text-xs text-amber-800 font-medium">
                UniLife Ethiopia • Education is a right, not a privilege
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
