import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Smartphone,
  CreditCard,
  Building,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const SUGGESTED_AMOUNTS = [50, 100, 200, 500];

export default function SupportPage() {
  const [stats, setStats] = useState({ totalVerifiedAmount: 0, totalVerifiedDonations: 0 });
  const [recentDonors, setRecentDonors] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Form State
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Telebirr');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.getDonationStats();
      if (res.success) {
        setStats(res.stats || { totalVerifiedAmount: 0, totalVerifiedDonations: 0 });
        setRecentDonors(res.recentDonors || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const finalAmount = customAmount ? Number(customAmount) : selectedAmount;
    if (!finalAmount || finalAmount <= 0) {
      setErrorMessage('Please select or specify a valid donation amount in ETB.');
      return;
    }

    if (!transactionRef.trim()) {
      setErrorMessage('Please enter the transaction reference / SMS confirmation code from Telebirr, CBE Birr or Bank Transfer.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        amount: finalAmount,
        payment_method: paymentMethod,
        transaction_reference: transactionRef.trim(),
        donor_name: isAnonymous ? '' : donorName.trim(),
        donor_email: donorEmail.trim(),
        notes: notes.trim(),
        is_anonymous: isAnonymous
      };

      const res = await api.submitDonation(payload);
      if (res.success) {
        setSuccessMessage('Thank you so much! Your contribution reference has been received. Our administrators will verify the transaction and add your support to the public community total.');
        setTransactionRef('');
        setNotes('');
        fetchStats();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit donation reference. Please verify and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>Voluntary Support • All Academic Features Are 100% Free</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-800 tracking-tight">
          Support UniLife Ethiopia
        </h1>

        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          UniLife Ethiopia was created to make academic organization easier for university students.
          We firmly believe that education should be accessible to everyone, and every student deserves
          world-class tools regardless of their financial background.
        </p>
      </div>

      {/* 100% Free Guarantee Card */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-base font-bold text-navy-800 flex items-center gap-2 justify-center sm:justify-start">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Our Unconditional Promise to Students</span>
            </h2>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              There are no locked features, no premium tiers, and no compulsory subscriptions. Every single course tool, GPA calculation, timetable slot, and exam planner remains completely free forever.
              Your optional contribution helps cover cloud hosting, fast local servers, domain renewals, and platform improvements.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm text-center min-w-[200px]">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Verified Community Total</span>
            <span className="text-3xl font-black text-brand-blue block mt-1">
              {stats.totalVerifiedAmount} ETB
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              from {stats.totalVerifiedDonations} generous supporters
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Donation Form + Payment Accounts & Transparency */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Donation Submission Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-navy-800">Make a Voluntary Contribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select a suggested tier or enter a custom contribution in Ethiopian Birr (ETB).</p>
          </div>

          {successMessage && (
            <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 text-xs font-medium flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-50 text-rose-900 rounded-2xl border border-rose-200 text-xs font-medium flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Suggested Contribution Tiers
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SUGGESTED_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-3 rounded-2xl border text-center transition-all font-bold text-sm ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-blue-500/20 scale-102'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {amt} ETB
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <input
                  type="number"
                  placeholder="Or enter custom amount in ETB..."
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(0);
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue font-semibold"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Select Your Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'Telebirr', label: 'Telebirr', icon: Smartphone },
                  { id: 'CBE Birr', label: 'CBE Birr', icon: CreditCard },
                  { id: 'Bank Transfer', label: 'CBE Bank', icon: Building }
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        paymentMethod === m.id
                          ? 'border-brand-blue bg-blue-50/60 text-brand-blue font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transaction Reference & Donor Details */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction Reference / SMS Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. TLB89342718 or CBE192837482"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue font-mono font-semibold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Copy the confirmation code from your payment SMS receipt so our team can verify it.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dawit Haile"
                    disabled={isAnonymous}
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. dawit@gmail.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message of Encouragement (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Proud to support Ethiopian university students!"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anonymous-toggle"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                />
                <label htmlFor="anonymous-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Display as Anonymous Supporter on the public leaderboard
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-navy-800 to-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 active:scale-98 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50"
            >
              {submitting ? 'Submitting Receipt...' : 'Submit Voluntary Contribution'}
            </button>
          </form>
        </div>

        {/* Right: Payment Instructions & Transparency List (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Official Payment Accounts */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-navy-800">Payment Account Details</h3>
            <p className="text-xs text-slate-500">
              Please transfer your voluntary contribution using any of the official methods below:
            </p>

            <div className="space-y-3">
              {/* Telebirr */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <div className="p-2 bg-brand-blue text-white rounded-xl">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-800">Telebirr</h4>
                  <p className="text-xs font-mono font-bold text-brand-blue mt-0.5">0911-23-45-67</p>
                  <p className="text-[11px] text-slate-500">Account Name: UniLife Ethiopia Initiative</p>
                </div>
              </div>

              {/* CBE Birr */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
                <div className="p-2 bg-amber-600 text-white rounded-xl">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-800">CBE Birr</h4>
                  <p className="text-xs font-mono font-bold text-amber-800 mt-0.5">0911-23-45-67</p>
                  <p className="text-[11px] text-slate-500">Commercial Bank of Ethiopia Mobile</p>
                </div>
              </div>

              {/* Commercial Bank of Ethiopia (CBE) Account */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-3">
                <div className="p-2 bg-purple-700 text-white rounded-xl">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-800">Commercial Bank of Ethiopia (CBE)</h4>
                  <p className="text-xs font-mono font-bold text-purple-900 mt-0.5">1000-4829-1029-4</p>
                  <p className="text-[11px] text-slate-500">Branch: Addis Ababa Main / UniLife ET</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Supporters Leaderboard */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-navy-800">Recent Verified Supporters</h3>
              <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">
                Public Honor Roll
              </span>
            </div>

            {loadingStats ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading supporters...</div>
            ) : recentDonors.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Be the first to voluntarily support UniLife Ethiopia!
              </p>
            ) : (
              <div className="space-y-3">
                {recentDonors.map((d, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-navy-800">{d.display_name}</p>
                      {d.notes && <p className="text-[11px] text-slate-500 italic mt-0.5">"{d.notes}"</p>}
                    </div>
                    <span className="text-xs font-extrabold text-brand-blue bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {d.amount} ETB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
