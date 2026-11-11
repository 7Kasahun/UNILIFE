import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import {
  Bell,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'info',
    is_active: 1
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAnnouncements();
      if (res.success) {
        setAnnouncements(res.announcements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await adminApi.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to delete announcement');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.createAnnouncement(formData);
      setIsModalOpen(false);
      setFormData({ title: '', content: '', priority: 'info', is_active: 1 });
      fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Announcements</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Broadcast platform updates, maintenance notifications, and academic advisories to students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No active announcements.</div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-700 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      a.priority === 'critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : a.priority === 'warning'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {a.priority}
                    </span>
                    <h4 className="text-sm font-bold text-white">{a.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{a.content}</p>
                  <span className="text-[10px] text-slate-500 block pt-1">
                    Published: {new Date(a.created_at).toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Announcement"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. UniLife Ethiopia System Maintenance"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="info">Info / General News</option>
              <option value="warning">Warning / Reminder</option>
              <option value="critical">Critical / Scheduled Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Announcement Message *
            </label>
            <textarea
              rows="4"
              required
              placeholder="Detailed announcement text..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
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
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
