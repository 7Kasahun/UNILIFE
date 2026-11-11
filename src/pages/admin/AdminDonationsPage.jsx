import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api.js';
import {
  Heart,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  CreditCard,
  Building,
  Smartphone,
  AlertCircle
} from 'lucide-react';

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ pendingCount: 0, verifiedCount: 0, totalVerifiedAmount: 0, rejectedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await adminApi.getDonations(query);
      if (res.success) {
        setDonations(res.donations || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter]);

  const handleVerify = async (id) => {
    if (!window.confirm('Confirm that this payment has been verified in the merchant account?')) return;
    try {
      await adminApi.verifyDonation(id);
      fetchDonations();
    } catch (err) {
      alert(err.message || 'Failed to verify donation');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please specify reason for rejecting this submission:', 'Transaction reference not found in bank/Telebirr records');
    if (reason === null) return;
    try {
      await adminApi.rejectDonation(id, { rejection_reason: reason });
      fetchDonations();
    } catch (err) {
      alert(err.message || 'Failed to reject donation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Voluntary Donation Verification</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Review Telebirr, CBE Birr and Bank Transfer receipts to confirm community contributions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-amber-400 uppercase">Pending Review</span>
          <p className="text-2xl font-black text-white mt-1">{stats.pendingCount}</p>
        </div>
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-emerald-400 uppercase">Verified Count</span>
          <p className="text-2xl font-black text-white mt-1">{stats.verifiedCount}</p>
        </div>
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-blue-400 uppercase">Total Verified ETB</span>
          <p className="text-2xl font-black text-white mt-1">{stats.totalVerifiedAmount} ETB</p>
        </div>
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-rose-400 uppercase">Rejected Receipts</span>
          <p className="text-2xl font-black text-white mt-1">{stats.rejectedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {['all', 'Pending', 'Verified', 'Rejected'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === st ? 'bg-brand-blue text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Submissions' : st}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchDonations(); }} className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by transaction reference or donor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white focus:outline-none"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading donation records...</div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No donation records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 border-b border-slate-700/80 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Tx Reference</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Donor Details</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Date Submitted</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-750 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {d.transaction_reference}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {d.payment_method}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-400">
                      {d.amount} ETB
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-semibold">
                        {d.is_anonymous ? 'Anonymous Supporter' : d.donor_name || 'Supporter'}
                      </div>
                      {d.donor_email && <div className="text-[11px] text-slate-400">{d.donor_email}</div>}
                      {d.notes && <div className="text-[11px] text-slate-400 italic">"{d.notes}"</div>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        d.status === 'Verified'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : d.status === 'Pending'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {d.status === 'Pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleVerify(d.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(d.id)}
                            className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {d.status === 'Verified' && (
                        <span className="text-[11px] text-emerald-400 font-medium">Verified Confirmed</span>
                      )}
                      {d.status === 'Rejected' && (
                        <span className="text-[11px] text-rose-400 font-medium truncate max-w-[120px] block ml-auto">
                          {d.rejection_reason || 'Rejected'}
                        </span>
                      )}
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
