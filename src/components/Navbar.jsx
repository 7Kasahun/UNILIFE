import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  Bell,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Heart,
  ChevronDown,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { student, logoutStudent } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await api.getNotifications();
        if (res.success) {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        }
      } catch (err) {
        // Silent fail on network
      }
    }

    if (student) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 45000); // Poll every 45s
      return () => clearInterval(interval);
    }
  }, [student]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutStudent();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {}
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left side: Hamburger + Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/student/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-navy-800 to-brand-blue flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-navy-800">UniLife</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">ET</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Ethiopia</p>
          </div>
        </Link>
      </div>

      {/* Right side: Donation link, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Support UniLife Pill */}
        <Link
          to="/support"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 transition-colors"
        >
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>Support UniLife</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-navy-800 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-error text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs text-brand-blue hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications right now
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                    >
                      <p className="text-xs font-semibold text-slate-800 mb-0.5">{n.title}</p>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <Link
                  to="/student/notifications"
                  onClick={() => setShowNotifDropdown(false)}
                  className="text-xs text-brand-blue font-medium hover:underline block py-1"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Student Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-lightBlue text-brand-blue flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {student?.full_name ? student.full_name.charAt(0) : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-900 leading-none">
                {student?.full_name?.split(' ')[0] || 'Student'}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                {student?.university || 'Ethiopian University'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{student?.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{student?.email}</p>
                <div className="mt-1.5">
                  <span className="text-[10px] bg-blue-50 text-brand-blue font-medium px-2 py-0.5 rounded-md">
                    Year {student?.current_year || 1} • {student?.department || 'Student'}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/student/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile Overview</span>
                </Link>
                <Link
                  to="/student/settings"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Account Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
