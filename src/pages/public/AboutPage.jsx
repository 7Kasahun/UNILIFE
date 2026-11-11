import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Heart,
  Globe,
  Sparkles,
  Users
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto py-4">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-800 tracking-tight">
          About UniLife Ethiopia
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The unified student life organizer created to help Ethiopian university and college students succeed.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm">
        <div>
          <h2 className="text-lg font-bold text-navy-800 mb-2">Our Mission</h2>
          <p>
            UniLife Ethiopia aims to help university and college students organize their academic lives,
            manage their responsibilities, track academic progress, and develop disciplined study habits through
            one accessible, beautifully designed platform. Rather than forcing students to navigate multiple
            disconnected spreadsheets, calendars, and paper notes, UniLife brings every facet of student life together.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-navy-800 mb-2">Core Philosophy: Free Education for All</h2>
          <p>
            We believe that high-quality academic productivity tools should not be gated behind paywalls or expensive subscriptions.
            Every course manager, timetable scheduler, GPA calculator, and revision tool on UniLife is completely free.
            Donations are entirely voluntary, helping cover the cost of cloud servers and local maintenance.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-navy-800 mb-2">Built for Ethiopian Universities</h2>
          <p>
            Whether attending Addis Ababa University, Bahir Dar University, Hawassa, Jimma, Mekelle, Arba Minch, or any college across
            the regional states, UniLife adapts to your academic semesters, department schedules, and grading policies.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Create Your Free Account
          </Link>
          <Link
            to="/support"
            className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>Support the UniLife Mission</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
