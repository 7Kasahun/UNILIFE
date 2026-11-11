import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { StatusBadge } from '../../components/Cards.jsx';
import {
  CheckSquare,
  Plus,
  Filter,
  CheckCircle2,
  Circle,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  Clock
} from 'lucide-react';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, overdue, completed
  const [selectedCourse, setSelectedCourse] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    assigned_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    priority: 'Medium',
    status: 'Not started'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('filter', filter);
      if (selectedCourse) params.append('course_id', selectedCourse);
      const query = params.toString() ? `?${params.toString()}` : '';

      const [aRes, cRes] = await Promise.all([
        api.getAssignments(query),
        api.getCourses()
      ]);

      if (aRes.success) setAssignments(aRes.assignments || []);
      if (cRes.success) setCourses(cRes.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [filter, selectedCourse]);

  const handleToggle = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.toggleAssignment(id);
      if (res.success) {
        setAssignments(prev =>
          prev.map(a =>
            a.id === id ? { ...a, status: res.status } : a
          )
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const openCreateModal = () => {
    setEditingAssignment(null);
    setFormData({
      course_id: courses[0]?.id || '',
      title: '',
      description: '',
      assigned_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      priority: 'Medium',
      status: 'Not started'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (a) => {
    setEditingAssignment(a);
    setFormData({
      course_id: a.course_id,
      title: a.title,
      description: a.description || '',
      assigned_date: a.assigned_date ? a.assigned_date.split('T')[0] : '',
      due_date: a.due_date ? a.due_date.slice(0, 16) : '',
      priority: a.priority || 'Medium',
      status: a.status || 'Not started'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment permanently?')) return;
    try {
      await api.deleteAssignment(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete assignment');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.course_id || !formData.due_date) {
      setFormError('Course, assignment title, and due date are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingAssignment) {
        await api.updateAssignment(editingAssignment.id, formData);
      } else {
        await api.createAssignment(formData);
      }
      setIsModalOpen(false);
      fetchAssignments();
    } catch (err) {
      setFormError(err.message || 'Failed to save assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Tasks' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'completed', label: 'Completed' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Assignment Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track coursework deadlines, manage priorities, and never miss an academic submission.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={courses.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assignment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-white text-navy-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Course Filter Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200/80 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
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

      {/* Assignments List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={filter === 'all' ? 'No assignments yet' : `No ${filter} assignments`}
          description="Add your first assignment to start organizing your academic work."
          actionText={courses.length > 0 ? "Add Assignment" : "Add Course First"}
          onAction={() => courses.length > 0 ? openCreateModal() : window.location.href = '/student/courses'}
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((item) => (
            <div
              key={item.id}
              onClick={() => openEditModal(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:shadow-md hover:border-blue-200 ${
                item.status === 'Completed' ? 'opacity-70 bg-slate-50/50' : ''
              }`}
            >
              {/* Left Side: Checkbox + Title + Course */}
              <div className="flex items-start gap-3.5">
                <button
                  type="button"
                  onClick={(e) => handleToggle(item.id, e)}
                  className="mt-0.5 text-slate-400 hover:text-brand-blue transition-colors flex-shrink-0"
                  aria-label="Toggle completion status"
                >
                  {item.status === 'Completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 hover:text-brand-blue" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm font-bold text-slate-900 ${
                      item.status === 'Completed' ? 'line-through text-slate-500' : ''
                    }`}>
                      {item.title}
                    </h3>
                    <StatusBadge status={item.priority} />
                    <StatusBadge status={item.status} />
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: item.color || '#2563EB' }}
                      />
                      {item.course_name} ({item.course_code})
                    </span>
                    {item.assigned_date && (
                      <span className="text-[11px] text-slate-400">
                        Assigned: {item.assigned_date.split('T')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Due Date & Countdown */}
              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <div className="flex items-center gap-1.5 sm:justify-end text-xs font-bold text-navy-800">
                    <Clock className="w-3.5 h-3.5 text-brand-blue" />
                    <span>{new Date(item.due_date).toLocaleDateString()} {new Date(item.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className={`text-[11px] font-bold mt-0.5 inline-block ${
                    item.status === 'Completed'
                      ? 'text-emerald-600'
                      : item.is_overdue
                      ? 'text-rose-600 font-extrabold'
                      : item.days_remaining <= 2
                      ? 'text-amber-600 font-bold'
                      : 'text-slate-500'
                  }`}>
                    {item.status === 'Completed'
                      ? 'Completed 🎉'
                      : item.is_overdue
                      ? `Overdue by ${Math.abs(item.days_remaining)} days`
                      : item.days_remaining === 0
                      ? 'Due Today!'
                      : `${item.days_remaining} days remaining`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Course *
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
              Assignment Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Chapter 4 Problem Set or Lab Project"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Date
              </label>
              <input
                type="date"
                value={formData.assigned_date}
                onChange={(e) => setFormData({ ...formData, assigned_date: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Not started">Not started</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructions / Description
            </label>
            <textarea
              rows="3"
              placeholder="Rubric details, file submission guidelines, group partner names..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {submitting ? 'Saving...' : editingAssignment ? 'Save Changes' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
