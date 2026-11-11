import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ArrowRight,
  Clock,
  User,
  GraduationCap
} from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    credit_hours: '3.0',
    instructor: '',
    department: '',
    semester: 'Semester I',
    academic_year: '2026/2027',
    description: '',
    color: '#2563EB'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let query = '';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedSemester) params.append('semester', selectedSemester);
      if (params.toString()) query = `?${params.toString()}`;

      const res = await api.getCourses(query);
      if (res.success) {
        setCourses(res.courses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedSemester]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      course_code: '',
      course_name: '',
      credit_hours: '3.0',
      instructor: '',
      department: '',
      semester: 'Semester I',
      academic_year: '2026/2027',
      description: '',
      color: '#2563EB'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c, e) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingCourse(c);
    setFormData({
      course_code: c.course_code,
      course_name: c.course_name,
      credit_hours: String(c.credit_hours),
      instructor: c.instructor || '',
      department: c.department || '',
      semester: c.semester || 'Semester I',
      academic_year: c.academic_year || '2026/2027',
      description: c.description || '',
      color: c.color || '#2563EB'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this course? All associated assignments and notes will also be removed.')) {
      return;
    }
    try {
      await api.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete course');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.course_code || !formData.course_name) {
      setFormError('Course code and course name are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, formData);
      } else {
        await api.createCourse(formData);
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      setFormError(err.message || 'Error saving course');
    } finally {
      setSubmitting(false);
    }
  };

  const colorOptions = ['#2563EB', '#0D9488', '#16A34A', '#D97706', '#9333EA', '#DC2626', '#475569'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Course Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your academic courses, credit hours, instructors, and semester curricula.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course code, name or instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
          />
          <button type="submit" className="text-xs font-semibold text-brand-blue px-2 py-1 rounded hover:bg-white transition-colors">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200/80 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">All Semesters</option>
            <option value="Semester I">Semester I</option>
            <option value="Semester II">Semester II</option>
            <option value="Summer / Kiremt">Summer / Kiremt</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading courses...</div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Add your enrolled university courses to start tracking assignments, exams, and attendance."
          actionText="Add Course"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/student/courses/${course.id}`}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header tag */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
                    style={{ backgroundColor: course.color || '#2563EB' }}
                  >
                    {course.course_code}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => openEditModal(course, e)}
                      className="p-1 text-slate-400 hover:text-brand-blue hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Course"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(course.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-navy-800 group-hover:text-brand-blue transition-colors leading-snug">
                  {course.course_name}
                </h3>
                {course.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Credit Hours:</span>
                    <span className="font-semibold text-slate-800">{course.credit_hours} Cr</span>
                  </div>
                  {course.instructor && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Instructor:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[140px]">{course.instructor}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Semester:</span>
                    <span className="font-medium text-slate-700">{course.semester || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{course.assignment_count || 0} tasks • {course.exam_count || 0} exams</span>
                <span className="text-brand-blue font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
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
                Course Code *
              </label>
              <input
                type="text"
                placeholder="e.g. SE4101 or CS201"
                required
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Credit Hours *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                required
                value={formData.credit_hours}
                onChange={(e) => setFormData({ ...formData, credit_hours: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Software Architecture and Design"
              required
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructor
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Tewodros"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Software Engineering"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Semester I">Semester I</option>
                <option value="Semester II">Semester II</option>
                <option value="Summer / Kiremt">Summer / Kiremt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                placeholder="2026/2027"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Color Tag
            </label>
            <div className="flex items-center gap-2 pt-1">
              {colorOptions.map((hex) => (
                <button
                  type="button"
                  key={hex}
                  onClick={() => setFormData({ ...formData, color: hex })}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    formData.color === hex ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Description / Syllabus Notes
            </label>
            <textarea
              rows="3"
              placeholder="Key concepts, prerequisites, lecture rooms..."
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
              {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
