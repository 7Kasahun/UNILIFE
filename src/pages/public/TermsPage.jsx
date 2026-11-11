import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 text-slate-700 text-sm leading-relaxed">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-navy-800">Terms of Service</h1>
        <p className="text-xs text-slate-400 mt-1">Last Updated: Academic Year 2026/2027</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-navy-800 mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using UniLife Ethiopia, you agree to comply with and be bound by these Terms of Service.
            UniLife Ethiopia is provided as an open academic management platform designed exclusively for students and educational supporters.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-navy-800 mb-2">2. Free Academic Access</h2>
          <p>
            All academic features — including course management, class timetables, examination countdowns, GPA and CGPA calculators, study timers, and personal notes — are completely free. No subscription or fee is required to access any academic feature.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-navy-800 mb-2">3. User Responsibilities & Privacy</h2>
          <p>
            You are responsible for keeping your login credentials confidential. You agree not to upload harmful content, spam, or attempt unauthorized access to platform servers.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-navy-800 mb-2">4. Voluntary Donations</h2>
          <p>
            All donations and financial contributions to UniLife Ethiopia are strictly voluntary. Making a contribution does not confer special academic privileges or alter user accounts.
          </p>
        </div>
      </div>
    </div>
  );
}
