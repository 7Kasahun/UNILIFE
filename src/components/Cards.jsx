import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    navy: 'bg-slate-100 text-navy-800 border-slate-200'
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-600">
          {trend}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'In progress': 'bg-blue-50 text-blue-700 border-blue-200',
    'Not started': 'bg-slate-50 text-slate-600 border-slate-200',
    'Attended': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Absent': 'bg-rose-50 text-rose-700 border-rose-200',
    'Excused': 'bg-amber-50 text-amber-700 border-amber-200',
    'Verified': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
    'High': 'bg-rose-50 text-rose-700 border-rose-200',
    'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
    'Low': 'bg-blue-50 text-blue-700 border-blue-200',
    'Ready': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
}
