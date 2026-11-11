import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Edit2,
  Trash2,
  Tag,
  BookOpen,
  Calendar
} from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    content: '',
    tags: '',
    is_pinned: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCourse) params.append('course_id', selectedCourse);
      const query = params.toString() ? `?${params.toString()}` : '';

      const [nRes, cRes] = await Promise.all([
        api.getNotes(query),
        api.getCourses()
      ]);

      if (nRes.success) setNotes(nRes.notes || []);
      if (cRes.success) setCourses(cRes.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedCourse]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setFormData({
      course_id: '',
      title: '',
      content: '',
      tags: '',
      is_pinned: false
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setFormData({
      course_id: note.course_id || '',
      title: note.title,
      content: note.content,
      tags: note.tags || '',
      is_pinned: !!note.is_pinned
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleTogglePin = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.togglePinNote(id);
      if (res.success) {
        setNotes(prev =>
          prev.map(n =>
            n.id === id ? { ...n, is_pinned: res.is_pinned } : n
          ).sort((a, b) => (b.is_pinned || 0) - (a.is_pinned || 0))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle pin');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this note permanently?')) return;
    try {
      await api.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete note');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.content) {
      setFormError('Note title and content are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingNote) {
        await api.updateNote(editingNote.id, formData);
      } else {
        await api.createNote(formData);
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      setFormError(err.message || 'Failed to save note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Personal Notes & Study Materials</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture lecture summaries, study formulas, exam tips, and revision cheat sheets privately.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes by title, text or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
          />
          <button type="submit" className="text-xs font-semibold text-brand-blue px-2 py-1 rounded hover:bg-white transition-colors">
            Search
          </button>
        </form>

        <div className="w-full sm:w-auto">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200/80 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code} - {c.course_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading your notes...</div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notes found"
          description="Create your first study note to record lecture key points, formulas, and revision materials."
          actionText="Create First Note"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => openEditModal(note)}
              className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                note.is_pinned ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {note.course_name ? (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: note.color || '#2563EB' }}
                    >
                      {note.course_code}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      General Note
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleTogglePin(note.id, e)}
                      className={`p-1 rounded-lg transition-colors ${
                        note.is_pinned
                          ? 'text-amber-500 hover:text-slate-400'
                          : 'text-slate-300 hover:text-amber-500'
                      }`}
                      title={note.is_pinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(note.id, e)}
                      className="p-1 rounded-lg text-slate-300 hover:text-rose-600 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-navy-800 group-hover:text-brand-blue transition-colors leading-snug">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-4 leading-relaxed whitespace-pre-line">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 truncate">
                  {note.tags && (
                    <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">
                      <Tag className="w-2.5 h-2.5" />
                      {note.tags}
                    </span>
                  )}
                </div>
                <span>{new Date(note.updated_at || note.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNote ? 'Edit Note' : 'Create New Note'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Associated Course (Optional)
              </label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="">General (No Course)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course_code} - {c.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Exam-Prep, Formulas, Week3"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Key Definitions & Formulas"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note Content *
            </label>
            <textarea
              rows="8"
              placeholder="Write your study notes, code snippets, definitions, lecture summaries..."
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue font-mono resize-y"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_pinned"
              checked={formData.is_pinned}
              onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
            />
            <label htmlFor="is_pinned" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Pin this note to the top of your notes list
            </label>
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
              {submitting ? 'Saving...' : editingNote ? 'Save Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
