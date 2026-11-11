import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import {
  Calculator,
  Plus,
  Trash2,
  Settings,
  Info,
  TrendingUp,
  Award,
  BookOpen,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export default function GpaPage() {
  const [summary, setSummary] = useState(null);
  const [gradingScales, setGradingScales] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add course result modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    semester_name: 'Semester I',
    course_code: '',
    course_name: '',
    credit_hours: '3.0',
    grade_letter: 'A',
    is_retake: false,
    retake_mode: 'replace'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Grading Scale Preferences Modal
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [customScales, setCustomScales] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, scaleRes, cRes] = await Promise.all([
        api.getGpaSummary(),
        api.getGradingScale(),
        api.getCourses()
      ]);
      if (sumRes.success) setSummary(sumRes.summary);
      if (scaleRes.success) {
        setGradingScales(scaleRes.scales || []);
        setCustomScales(scaleRes.scales || []);
      }
      if (cRes.success) setCourses(cRes.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCourseSelect = (courseId) => {
    const selected = courses.find(c => String(c.id) === String(courseId));
    if (selected) {
      setFormData(prev => ({
        ...prev,
        course_code: selected.course_code,
        course_name: selected.course_name,
        credit_hours: String(selected.credit_hours),
        semester_name: selected.semester || prev.semester_name
      }));
    }
  };

  const handleDeleteResult = async (id) => {
    if (!window.confirm('Delete this course grade record?')) return;
    try {
      await api.deleteSemesterResult(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete result');
    }
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.semester_name || !formData.course_code || !formData.credit_hours || !formData.grade_letter) {
      setFormError('Please complete all required course and grade fields.');
      return;
    }

    try {
      setSubmitting(true);
      await api.saveSemesterResult({
        ...formData,
        credit_hours: Number(formData.credit_hours)
      });
      setIsModalOpen(false);
      setFormData({
        semester_name: formData.semester_name,
        course_code: '',
        course_name: '',
        credit_hours: '3.0',
        grade_letter: 'A',
        is_retake: false,
        retake_mode: 'replace'
      });
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save grade');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveCustomScales = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.updateGradingScale({ scales: customScales });
      setIsScaleModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to save scale');
    } finally {
      setSubmitting(false);
    }
  };

  const cumulative = summary?.cumulative || { cgpa: '0.00', totalCreditHours: 0, totalGradePoints: 0, totalCourses: 0 };
  const semesters = summary?.semesters || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">GPA & CGPA Calculator</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent academic performance tracking using Ethiopian higher education grading standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScaleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Grading Scale</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Course Grade</span>
          </button>
        </div>
      </div>

      {/* Cumulative CGPA Hero Card */}
      <div className="bg-gradient-to-br from-navy-800 via-blue-900 to-brand-blue text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-3 py-1 rounded-full">
              Cumulative Academic Standing
            </span>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-black tracking-tight">{cumulative.cgpa}</span>
              <span className="text-sm font-semibold text-blue-200">/ 4.00 CGPA</span>
            </div>
            <p className="text-xs text-blue-100 mt-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-300" />
              <span>{cumulative.formula || 'CGPA = Total Grade Points / Total Included Credit Hours'}</span>
            </p>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
            <div className="px-2">
              <span className="text-lg font-bold block">{cumulative.totalCourses}</span>
              <span className="text-[11px] text-blue-200 uppercase font-medium">Courses</span>
            </div>
            <div className="px-2 border-x border-white/10">
              <span className="text-lg font-bold block">{cumulative.totalCreditHours}</span>
              <span className="text-[11px] text-blue-200 uppercase font-medium">Credit Hrs</span>
            </div>
            <div className="px-2">
              <span className="text-lg font-bold block">{cumulative.totalGradePoints}</span>
              <span className="text-[11px] text-blue-200 uppercase font-medium">Total Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formula Transparency Banner */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-navy-800">Transparent Calculation Policy</p>
          <p className="mt-0.5">
            <strong>Semester GPA</strong> is computed as: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-100 font-mono text-[11px]">Sum of (Credit Hours × Grade Points) / Total Credit Hours</code>.
            If a course is repeated, UniLife handles retakes transparently using your configured policy (replace attempt, highest grade, average, or excluded) so old records are never silently erased.
          </p>
        </div>
      </div>

      {/* Semesters Performance Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading academic records...</div>
      ) : semesters.length === 0 ? (
        <EmptyState
          icon={Calculator}
          title="No grades recorded yet"
          description="Enter your course grades and credit hours to compute your semester GPA and cumulative CGPA."
          actionText="Record First Grade"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {semesters.map((sem, idx) => (
            <div
              key={sem.semester_name}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4"
            >
              {/* Semester Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-base font-bold text-navy-800">{sem.semester_name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{sem.calculation_formula}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Semester GPA:</span>
                    <span className="text-xl font-black text-brand-blue">{sem.gpa}</span>
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    {sem.semester_credit_hours} Cr • {sem.semester_grade_points} Pts
                  </div>
                </div>
              </div>

              {/* Courses Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-3">Course Code</th>
                      <th className="py-2.5 px-3">Course Name</th>
                      <th className="py-2.5 px-3 text-center">Credit Hours</th>
                      <th className="py-2.5 px-3 text-center">Grade Letter</th>
                      <th className="py-2.5 px-3 text-center">Grade Point</th>
                      <th className="py-2.5 px-3 text-center">Points Earned</th>
                      <th className="py-2.5 px-3 text-center">Retake Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sem.courses.map((c) => {
                      const pointsEarned = (Number(c.credit_hours) * Number(c.grade_point)).toFixed(2);
                      return (
                        <tr
                          key={c.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            !c.is_counted ? 'opacity-40 line-through bg-slate-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-bold text-slate-900">{c.course_code}</td>
                          <td className="py-3 px-3 text-slate-700 font-medium">{c.course_name}</td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-800">{c.credit_hours}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-extrabold px-2 py-0.5 rounded bg-blue-50 text-brand-blue border border-blue-200">
                              {c.grade_letter}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-800">{Number(c.grade_point).toFixed(2)}</td>
                          <td className="py-3 px-3 text-center font-bold text-emerald-700">{pointsEarned}</td>
                          <td className="py-3 px-3 text-center">
                            {c.is_retake ? (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                Retake ({c.retake_mode})
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Regular</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteResult(c.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Record Course Grade */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Course Grade"
      >
        <form onSubmit={handleSaveResult} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
              {formError}
            </div>
          )}

          {courses.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Autofill from Enrolled Course (Optional)
              </label>
              <select
                onChange={(e) => handleCourseSelect(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="">-- Choose from your courses --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course_code} - {c.course_name} ({c.credit_hours} Cr)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Year 1 Semester I"
                required
                value={formData.semester_name}
                onChange={(e) => setFormData({ ...formData, semester_name: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                placeholder="e.g. SE4101"
                required
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
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
              placeholder="e.g. Software Architecture"
              required
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Credit Hours *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                required
                value={formData.credit_hours}
                onChange={(e) => setFormData({ ...formData, credit_hours: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Grade Letter *
              </label>
              <select
                required
                value={formData.grade_letter}
                onChange={(e) => setFormData({ ...formData, grade_letter: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue font-bold"
              >
                {gradingScales.map((s) => (
                  <option key={s.id || s.grade_letter} value={s.grade_letter}>
                    {s.grade_letter} ({s.grade_point} pts • {s.min_score}% - {s.max_score}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Retake Toggle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800">Is this a repeated course / retake?</span>
                <p className="text-[11px] text-slate-500">Configure how previous attempts should be handled</p>
              </div>
              <input
                type="checkbox"
                checked={formData.is_retake}
                onChange={(e) => setFormData({ ...formData, is_retake: e.target.checked })}
                className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
              />
            </div>

            {formData.is_retake && (
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Retake Calculation Policy
                </label>
                <select
                  value={formData.retake_mode}
                  onChange={(e) => setFormData({ ...formData, retake_mode: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
                >
                  <option value="replace">Replace previous attempt with this grade (Default)</option>
                  <option value="best">Count whichever attempt has the highest grade</option>
                  <option value="average">Include all attempts in CGPA calculation</option>
                  <option value="excluded">Exclude this retake attempt from calculation</option>
                </select>
              </div>
            )}
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
              {submitting ? 'Saving...' : 'Record Grade'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Grading Scale Preferences */}
      <Modal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
        title="Grading Scale Configuration"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveCustomScales} className="space-y-4">
          <p className="text-xs text-slate-500">
            Customize the grade points and percentage thresholds to match your specific university or department grading policy.
          </p>

          <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Letter</th>
                  <th className="p-2.5">Min %</th>
                  <th className="p-2.5">Max %</th>
                  <th className="p-2.5">Grade Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customScales.map((s, idx) => (
                  <tr key={s.id || idx}>
                    <td className="p-2 font-bold text-navy-800">{s.grade_letter}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={s.min_score}
                        onChange={(e) => {
                          const updated = [...customScales];
                          updated[idx].min_score = Number(e.target.value);
                          setCustomScales(updated);
                        }}
                        className="w-20 px-2 py-1 rounded border border-slate-200 text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={s.max_score}
                        onChange={(e) => {
                          const updated = [...customScales];
                          updated[idx].max_score = Number(e.target.value);
                          setCustomScales(updated);
                        }}
                        className="w-20 px-2 py-1 rounded border border-slate-200 text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="4.0"
                        value={s.grade_point}
                        onChange={(e) => {
                          const updated = [...customScales];
                          updated[idx].grade_point = Number(e.target.value);
                          setCustomScales(updated);
                        }}
                        className="w-20 px-2 py-1 rounded border border-slate-200 text-xs font-bold"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsScaleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-blue text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Grading Scale'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
