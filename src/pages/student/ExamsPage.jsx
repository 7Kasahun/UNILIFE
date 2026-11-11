import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { StatusBadge } from '../../components/Cards.jsx';
import {
  GraduationCap,
  Plus,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    exam_type: 'Midterm',
    exam_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    exam_time: '09:00',
    location: '',
    prep_status: 'Not started',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchExams = async () => {
    try {
      setLoading(true);
      const [eRes, cRes] = await Promise.all([api.getExaminations(), api.getCourses()]);
      if (eRes.success) setExams(eRes.examinations || []);
      if (cRes.success) setCourses(cRes.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const openCreateModal = () => {
    setEditingExam(null);
    setFormData({
      course_id: courses[0]?.id || '',
      title: '',
      exam_type: 'Midterm',
      exam_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      exam_time: '09:00',
      location: '',
      prep_status: 'Not started',
      notes: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setFormData({
      course_id: exam.course_id,
      title: exam.title,
      exam_type: exam.exam_type || 'Midterm',
      exam_date: exam.exam_date,
      exam_time: exam.exam_time || '09:00',
      location: exam.location || '',
      prep_status: exam.prep_status || 'Not started',
      notes: exam.notes || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this examination entry?')) return;
    try {
      await api.deleteExamination(id);
      setExams(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete examination');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.course_id || !formData.exam_date) {
      setFormError('Course, exam title, and exam date are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingExam) {
        await api.updateExamination(editingExam.id, formData);
      } else {
        await api.createExamination(formData);
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err) {
      setFormError(err.message || 'Failed to save examination');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Examination Planner</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan midterm and final exam schedules, set preparation statuses, and track countdowns.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={courses.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Examination</span>
        </button>
      </div>

      {/* Grid of Exams */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading exam schedules...</div>
      ) : exams.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No examinations scheduled yet"
          description="Add your upcoming quizzes, midterms, lab practicals, or final examinations."
          actionText={courses.length > 0 ? "Add Examination" : "Add Course First"}
          onAction={() => courses.length > 0 ? openCreateModal() : window.location.href = '/student/courses'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                    {exam.exam_type}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(exam)}
                      className="p-1 text-slate-400 hover:text-brand-blue rounded-lg"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(exam.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-navy-800 leading-snug">{exam.title}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: exam.color || '#2563EB' }}
                  />
                  <span>{exam.course_name} ({exam.course_code})</span>
                </p>

                {exam.notes && (
                  <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                    {exam.notes}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Date:
                    </span>
                    <span className="font-semibold text-slate-800">{exam.exam_date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Time:
                    </span>
                    <span className="font-semibold text-slate-800">{exam.exam_time || '09:00'}</span>
                  </div>
                  {exam.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Location:
                      </span>
                      <span className="font-medium text-slate-700">{exam.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Preparation:</span>
                    <StatusBadge status={exam.prep_status || 'Not started'} />
                  </div>
                </div>
              </div>

              {/* Countdown Banner */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Countdown:</span>
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                  exam.is_past
                    ? 'bg-slate-100 text-slate-500'
                    : exam.days_remaining <= 3
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : exam.days_remaining <= 7
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {exam.is_past ? 'Past Exam' : exam.days_remaining === 0 ? 'Today!' : `${exam.days_remaining} Days Remaining`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? 'Edit Examination' : 'Schedule Examination'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course *
            </label>
            <select
              required
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">-- Choose Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} - {c.course_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exam Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Midterm Examination Chapters 1-4"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exam Type
              </label>
              <select
                value={formData.exam_type}
                onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Quiz">Quiz</option>
                <option value="Midterm">Midterm</option>
                <option value="Final">Final Examination</option>
                <option value="Practical">Practical / Lab Test</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preparation Progress
              </label>
              <select
                value={formData.prep_status}
                onChange={(e) => setFormData({ ...formData, prep_status: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Not started">Not started</option>
                <option value="In progress">In progress (Studying)</option>
                <option value="Ready">Ready (Reviewed)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                required
                value={formData.exam_date}
                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exam Starting Time
              </label>
              <input
                type="time"
                value={formData.exam_time}
                onChange={(e) => setFormData({ ...formData, exam_time: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Examination Location / Hall
            </label>
            <input
              type="text"
              placeholder="e.g. Science Auditorium A or Block 102 Room 12"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Topics to Review / Exam Notes
            </label>
            <textarea
              rows="3"
              placeholder="Key formula sheet, allowed calculators, high-yield chapters..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
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
              {submitting ? 'Saving...' : editingExam ? 'Save Changes' : 'Schedule Exam'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
