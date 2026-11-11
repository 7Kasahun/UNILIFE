import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Layouts
import PublicLayout from './layouts/PublicLayout.jsx';
import StudentLayout from './layouts/StudentLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Public Pages
import WelcomePage from './pages/public/WelcomePage.jsx';
import LoginPage from './pages/public/LoginPage.jsx';
import RegisterPage from './pages/public/RegisterPage.jsx';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/public/ResetPasswordPage.jsx';
import SupportPage from './pages/public/SupportPage.jsx';
import AboutPage from './pages/public/AboutPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';
import TermsPage from './pages/public/TermsPage.jsx';
import PrivacyPage from './pages/public/PrivacyPage.jsx';

// Student Pages
import DashboardPage from './pages/student/DashboardPage.jsx';
import CoursesPage from './pages/student/CoursesPage.jsx';
import CourseDetailPage from './pages/student/CourseDetailPage.jsx';
import TimetablePage from './pages/student/TimetablePage.jsx';
import AssignmentsPage from './pages/student/AssignmentsPage.jsx';
import ExamsPage from './pages/student/ExamsPage.jsx';
import GpaPage from './pages/student/GpaPage.jsx';
import StudyPage from './pages/student/StudyPage.jsx';
import NotesPage from './pages/student/NotesPage.jsx';
import AttendancePage from './pages/student/AttendancePage.jsx';
import CalendarPage from './pages/student/CalendarPage.jsx';
import NotificationsPage from './pages/student/NotificationsPage.jsx';
import ProfilePage from './pages/student/ProfilePage.jsx';
import SettingsPage from './pages/student/SettingsPage.jsx';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminStudentsPage from './pages/admin/AdminStudentsPage.jsx';
import AdminDonationsPage from './pages/admin/AdminDonationsPage.jsx';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage.jsx';
import AdminLogsPage from './pages/admin/AdminLogsPage.jsx';

function StudentProtectedRoute({ children }) {
  const { isStudentAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return isStudentAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/donate" element={<SupportPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>

      {/* 2. Student Protected Hub */}
      <Route
        path="/student"
        element={
          <StudentProtectedRoute>
            <StudentLayout />
          </StudentProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="exams" element={<ExamsPage />} />
        <Route path="gpa" element={<GpaPage />} />
        <Route path="study" element={<StudyPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 3. Administrator Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="donations" element={<AdminDonationsPage />} />
        <Route path="announcements" element={<AdminAnnouncementsPage />} />
        <Route path="logs" element={<AdminLogsPage />} />
      </Route>

      {/* 4. Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
