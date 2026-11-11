import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 text-slate-700 text-sm leading-relaxed">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-navy-800">Privacy Policy & Student Data Protection</h1>
        <p className="text-xs text-slate-400 mt-1">Effective: Academic Year 2026/2027</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-navy-800 mb-2">1. Student Data Protection Principle</h2>
          <p>
            UniLife Ethiopia respects your confidential academic records. We collect only the information necessary to provide you with your personal schedule, course tracking, and study tools.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-navy-800 mb-2">2. What We Collect</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>Registration details: Name, email, username, university, department, degree program, and year of study.</li>
            <li>Student academic data: Courses, assignments, exam dates, timetable slots, study session times, and notes.</li>
            <li>Voluntary contribution records: Transaction reference numbers for donation verification.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-navy-800 mb-2">3. Zero Commercial Exploitation & Advertising</h2>
          <p>
            We do not sell student data, behavioral telemetry, or academic records to third-party advertisers or data brokers.
            Your notes, assignment texts, and GPA calculations are strictly private to your own account.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-navy-800 mb-2">4. Progressive Web App (PWA) Offline Security</h2>
          <p>
            Our Progressive Web App (PWA) caches the application shell to allow instant loading even under spotty mobile campus connectivity.
            However, sensitive academic records are never cached in shared device caches, ensuring your private grades and notes remain secure.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-navy-800 mb-2">5. Right to Erasure / Account Deletion</h2>
          <p>
            You have the complete right to permanently delete your account and all associated academic records at any time directly through your Account Settings.
          </p>
        </div>
      </div>
    </div>
  );
}
