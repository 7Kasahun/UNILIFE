import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import EmptyState from '../../components/EmptyState.jsx';
import {
  Bell,
  CheckCircle,
  Trash2,
  CheckCheck,
  Calendar,
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Important submission reminders, examination alerts, and platform announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-brand-blue" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="You don't have any notifications at the moment. As assignments and exams approach, reminders will appear here."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`py-4 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl transition-colors ${
                  !n.is_read ? 'bg-blue-50/50' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                      n.type === 'assignment'
                        ? 'bg-amber-100 text-amber-700'
                        : n.type === 'exam'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-brand-blue'
                    }`}
                  >
                    {n.type === 'assignment' ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : n.type === 'exam' ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-navy-800">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-blue inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-blue hover:bg-blue-100/60 transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
