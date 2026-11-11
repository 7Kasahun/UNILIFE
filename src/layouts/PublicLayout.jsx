import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PwaInstallBanner from '../components/PwaInstallBanner.jsx';
import { BookOpen, GraduationCap, Heart, ArrowRight } from 'lucide-react';

export default function PublicLayout() {
  const { isStudentAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col text-brand-text">
      {/* PWA Banner */}
      <PwaInstallBanner />

      {/* Public Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-navy-800 to-brand-blue flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-navy-800">UniLife</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">ET</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none">Ethiopia</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-brand-blue' : 'hover:text-navy-800'}>
              Home
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'text-brand-blue' : 'hover:text-navy-800'}>
              About
            </NavLink>
            <NavLink to="/support" className={({ isActive }) => isActive ? 'text-rose-600 font-bold' : 'text-rose-600 hover:text-rose-700 flex items-center gap-1'}>
              <Heart className="w-3.5 h-3.5 fill-rose-500 inline" />
              <span>Support UniLife</span>
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'text-brand-blue' : 'hover:text-navy-800'}>
              Contact
            </NavLink>
          </nav>

          <div className="flex items-center gap-2.5">
            {isStudentAuthenticated ? (
              <Link
                to="/student/dashboard"
                className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                >
                  Create Free Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy-800">UniLife Ethiopia</span>
            <span>• "Study smarter. Stay organized. Achieve more."</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
            <Link to="/about" className="hover:text-navy-800">About</Link>
            <Link to="/support" className="hover:text-rose-600">Support Us</Link>
            <Link to="/terms" className="hover:text-navy-800">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-navy-800">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-navy-800">Contact</Link>
            <Link to="/admin/login" className="text-slate-400 hover:text-slate-600">Admin</Link>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-4">
          © 2026 UniLife Ethiopia. All academic tools are completely free for all students.
        </p>
      </footer>
    </div>
  );
}
