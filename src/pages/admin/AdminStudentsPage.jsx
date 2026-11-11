import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api.js';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Building,
  GraduationCap
} from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('limit', '25');

      const res = await adminApi.getStudents(`?${params.toString()}`);
      if (res.success) {
        setStudents(res.students || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleToggleStatus = async (student) => {
    const isSuspended = !!student.is_suspended;
    const action = isSuspended ? 'reactivate' : 'suspend';
    const reason = prompt(`Enter reason for ${action}ing account @${student.username}:`, 'Policy adherence review');
    if (reason === null) return;

    try {
      await adminApi.toggleStudentStatus(student.id, {
        is_suspended: !isSuspended,
        reason
      });
      fetchStudents();
    } catch (err) {
      alert(err.message || `Failed to ${action} student`);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`⚠️ DANGER: Permanently delete student account @${student.username} (${student.full_name})? This cannot be undone.`)) {
      return;
    }
    try {
      await adminApi.deleteStudent(student.id);
      fetchStudents();
    } catch (err) {
      alert(err.message || 'Failed to delete student');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Student User Management</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Review student accounts, enforce compliance, and manage platform safety without exposing private student notes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name, email or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500"
          />
          <button type="submit" className="text-xs font-semibold text-blue-400 px-2 py-1 rounded hover:bg-slate-800">
            Search
          </button>
        </form>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto bg-slate-900 text-xs font-medium text-slate-200 border border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="">Status: All Students</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700/80 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Registered Students ({pagination.total})</h3>
          <span className="text-xs text-slate-400">Page {pagination.page} of {pagination.totalPages}</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading student directory...</div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No students found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 border-b border-slate-700/80 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">University & Department</th>
                  <th className="py-3 px-4 text-center">Year</th>
                  <th className="py-3 px-4 text-center">Created Data</th>
                  <th className="py-3 px-4 text-center">Account Status</th>
                  <th className="py-3 px-4 text-center">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-750 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{s.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">@{s.username} • {s.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{s.university}</div>
                      <div className="text-[11px] text-slate-400">{s.department}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                      Year {s.current_year}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400">
                      <span className="text-white font-semibold">{s.course_count || 0}</span> courses • <span className="text-white font-semibold">{s.assignment_count || 0}</span> tasks
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {s.is_suspended ? (
                        <span className="text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full">
                          Suspended
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(s)}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            s.is_suspended
                              ? 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-900'
                              : 'bg-amber-900/40 text-amber-300 hover:bg-amber-900/60'
                          }`}
                          title={s.is_suspended ? 'Reactivate account' : 'Suspend account'}
                        >
                          {s.is_suspended ? 'Reactivate' : 'Suspend'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(s)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/60 transition-colors"
                          title="Permanently Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
