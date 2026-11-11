import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api.js';
import { FileClock, Shield } from 'lucide-react';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const res = await adminApi.getLogs();
        if (res.success) {
          setLogs(res.logs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Administrator Activity Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Immutable audit trail of administrator authorizations, verification actions, and moderation events.
        </p>
      </div>

      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No activity logs recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 border-b border-slate-700/80 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-750 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {log.admin_username} ({log.admin_name})
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">
                      {log.details || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {log.ip_address || '127.0.0.1'}
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
