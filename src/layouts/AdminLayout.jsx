import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Heart,
  Bell,
  FileClock,
  LogOut,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout() {
  const { admin, isAdminAuthenticated, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const navLinks = [
    { name: 'Analytics Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Student Management', path: '/admin/students', icon: Users },
    { name: 'Donation Review', path: '/admin/donations', icon: Heart },
    { name: 'Announcements', path: '/admin/announcements', icon: Bell },
    { name: 'Activity Audit Logs', path: '/admin/logs', icon: FileClock }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between transition-transform md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white leading-none">UniLife Admin</h2>
                <span className="text-[10px] text-blue-400 font-semibold">{admin?.role || 'Administrator'}</span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1 text-xs">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-blue text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-900"
          >
            <span>Live Student Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 p-2 rounded-xl hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Administrator</span>
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-white">UniLife Admin</span>
          </div>

          <span className="text-xs text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800">
            {admin?.username}
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
