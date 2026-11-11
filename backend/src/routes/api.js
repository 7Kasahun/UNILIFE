import express from 'express';
import { authLimiter, donationLimiter } from '../middleware/rateLimiter.js';
import { authenticateStudent, authenticateAdmin, requirePermission } from '../middleware/authMiddleware.js';

// Controllers
import * as authController from '../controllers/authController.js';
import * as adminAuthController from '../controllers/adminAuthController.js';
import * as publicController from '../controllers/publicController.js';
import * as courseController from '../controllers/courseController.js';
import * as timetableController from '../controllers/timetableController.js';
import * as assignmentController from '../controllers/assignmentController.js';
import * as examController from '../controllers/examController.js';
import * as gpaController from '../controllers/gpaController.js';
import * as studyController from '../controllers/studyController.js';
import * as noteController from '../controllers/noteController.js';
import * as attendanceController from '../controllers/attendanceController.js';
import * as calendarController from '../controllers/calendarController.js';
import * as notificationController from '../controllers/notificationController.js';
import * as dashboardController from '../controllers/dashboardController.js';
import * as donationController from '../controllers/donationController.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// ====================================================================
// 1. PUBLIC ROUTES
// ====================================================================
router.get('/public/universities', publicController.getUniversities);
router.get('/public/departments', publicController.getDepartments);
router.get('/public/announcements', publicController.getPublicAnnouncements);
router.get('/public/donation-stats', donationController.getPublicDonationStats);

// ====================================================================
// 2. STUDENT AUTHENTICATION ROUTES
// ====================================================================
router.post('/auth/register', authLimiter, authController.register);
router.post('/auth/login', authLimiter, authController.login);
router.post('/auth/forgot-password', authLimiter, authController.forgotPassword);
router.post('/auth/reset-password', authLimiter, authController.resetPassword);

// Protected student profile & account management
router.get('/auth/profile', authenticateStudent, authController.getProfile);
router.put('/auth/profile', authenticateStudent, authController.updateProfile);
router.put('/auth/change-password', authenticateStudent, authController.changePassword);
router.put('/auth/settings', authenticateStudent, authController.updateSettings);
router.delete('/auth/delete-account', authenticateStudent, authController.deleteAccount);

// ====================================================================
// 3. STUDENT DASHBOARD
// ====================================================================
router.get('/student/dashboard', authenticateStudent, dashboardController.getDashboardData);

// ====================================================================
// 4. STUDENT COURSES
// ====================================================================
router.get('/student/courses', authenticateStudent, courseController.getCourses);
router.get('/student/courses/:id', authenticateStudent, courseController.getCourseDetail);
router.post('/student/courses', authenticateStudent, courseController.createCourse);
router.put('/student/courses/:id', authenticateStudent, courseController.updateCourse);
router.delete('/student/courses/:id', authenticateStudent, courseController.deleteCourse);

// ====================================================================
// 5. TIMETABLE
// ====================================================================
router.get('/student/timetable', authenticateStudent, timetableController.getTimetable);
router.post('/student/timetable', authenticateStudent, timetableController.createTimetableEntry);
router.put('/student/timetable/:id', authenticateStudent, timetableController.updateTimetableEntry);
router.delete('/student/timetable/:id', authenticateStudent, timetableController.deleteTimetableEntry);

// ====================================================================
// 6. ASSIGNMENTS
// ====================================================================
router.get('/student/assignments', authenticateStudent, assignmentController.getAssignments);
router.post('/student/assignments', authenticateStudent, assignmentController.createAssignment);
router.put('/student/assignments/:id', authenticateStudent, assignmentController.updateAssignment);
router.patch('/student/assignments/:id/toggle', authenticateStudent, assignmentController.toggleAssignmentStatus);
router.delete('/student/assignments/:id', authenticateStudent, assignmentController.deleteAssignment);

// ====================================================================
// 7. EXAMINATIONS
// ====================================================================
router.get('/student/exams', authenticateStudent, examController.getExaminations);
router.post('/student/exams', authenticateStudent, examController.createExamination);
router.put('/student/exams/:id', authenticateStudent, examController.updateExamination);
router.delete('/student/exams/:id', authenticateStudent, examController.deleteExamination);

// ====================================================================
// 8. GPA & CGPA CALCULATOR
// ====================================================================
router.get('/student/gpa/scale', authenticateStudent, gpaController.getGradingScale);
router.put('/student/gpa/scale', authenticateStudent, gpaController.updateGradingScale);
router.get('/student/gpa/results', authenticateStudent, gpaController.getSemesterResults);
router.post('/student/gpa/results', authenticateStudent, gpaController.saveSemesterResult);
router.delete('/student/gpa/results/:id', authenticateStudent, gpaController.deleteSemesterResult);
router.get('/student/gpa/summary', authenticateStudent, gpaController.calculateFullAcademicSummary);

// ====================================================================
// 9. STUDY PLANNER & TIMER
// ====================================================================
router.get('/student/study', authenticateStudent, studyController.getStudySessions);
router.post('/student/study', authenticateStudent, studyController.createStudySession);
router.put('/student/study/:id', authenticateStudent, studyController.updateStudySession);
router.delete('/student/study/:id', authenticateStudent, studyController.deleteStudySession);
router.put('/student/study/goals', authenticateStudent, studyController.updateStudyGoal);

// ====================================================================
// 10. PERSONAL NOTES MANAGER
// ====================================================================
router.get('/student/notes', authenticateStudent, noteController.getNotes);
router.get('/student/notes/:id', authenticateStudent, noteController.getNoteDetail);
router.post('/student/notes', authenticateStudent, noteController.createNote);
router.put('/student/notes/:id', authenticateStudent, noteController.updateNote);
router.patch('/student/notes/:id/pin', authenticateStudent, noteController.togglePinNote);
router.delete('/student/notes/:id', authenticateStudent, noteController.deleteNote);

// ====================================================================
// 11. ATTENDANCE TRACKER
// ====================================================================
router.get('/student/attendance', authenticateStudent, attendanceController.getAttendance);
router.post('/student/attendance', authenticateStudent, attendanceController.recordAttendance);
router.put('/student/attendance/:id', authenticateStudent, attendanceController.updateAttendance);
router.delete('/student/attendance/:id', authenticateStudent, attendanceController.deleteAttendance);

// ====================================================================
// 12. ACADEMIC CALENDAR
// ====================================================================
router.get('/student/calendar', authenticateStudent, calendarController.getCalendarFeed);
router.post('/student/calendar/events', authenticateStudent, calendarController.createPersonalEvent);
router.put('/student/calendar/events/:id', authenticateStudent, calendarController.updatePersonalEvent);
router.delete('/student/calendar/events/:id', authenticateStudent, calendarController.deletePersonalEvent);

// ====================================================================
// 13. NOTIFICATIONS
// ====================================================================
router.get('/student/notifications', authenticateStudent, notificationController.getNotifications);
router.patch('/student/notifications/:id/read', authenticateStudent, notificationController.markAsRead);
router.patch('/student/notifications/read-all', authenticateStudent, notificationController.markAllAsRead);
router.delete('/student/notifications/:id', authenticateStudent, notificationController.deleteNotification);

// ====================================================================
// 14. DONATIONS (VOLUNTARY CONTRIBUTIONS)
// ====================================================================
router.post('/donations', donationLimiter, donationController.submitDonation);

// ====================================================================
// 15. ADMINISTRATOR PORTAL ROUTES (STRICTLY ISOLATED)
// ====================================================================
router.post('/admin/auth/login', authLimiter, adminAuthController.adminLogin);
router.get('/admin/auth/me', authenticateAdmin, adminAuthController.getAdminMe);
router.post('/admin/auth/create', authenticateAdmin, requirePermission('admins.manage'), adminAuthController.createAdminUser);
router.get('/admin/auth/list', authenticateAdmin, requirePermission('admins.manage'), adminAuthController.getAdminList);

// Admin Analytics & Reports
router.get('/admin/analytics', authenticateAdmin, requirePermission('analytics.view'), adminController.getAdminAnalytics);

// Admin Student User Management
router.get('/admin/students', authenticateAdmin, requirePermission('users.manage'), adminController.getStudents);
router.patch('/admin/students/:id/status', authenticateAdmin, requirePermission('users.manage'), adminController.toggleStudentStatus);
router.delete('/admin/students/:id', authenticateAdmin, requirePermission('users.manage'), adminController.deleteStudentAdmin);

// Admin Donation Review & Verification
router.get('/admin/donations', authenticateAdmin, requirePermission('donations.verify'), donationController.getAdminDonations);
router.patch('/admin/donations/:id/verify', authenticateAdmin, requirePermission('donations.verify'), donationController.verifyDonation);
router.patch('/admin/donations/:id/reject', authenticateAdmin, requirePermission('donations.verify'), donationController.rejectDonation);

// Admin Announcement Content Management
router.get('/admin/announcements', authenticateAdmin, requirePermission('announcements.manage'), adminController.getAnnouncementsAdmin);
router.post('/admin/announcements', authenticateAdmin, requirePermission('announcements.manage'), adminController.createAnnouncementAdmin);
router.delete('/admin/announcements/:id', authenticateAdmin, requirePermission('announcements.manage'), adminController.deleteAnnouncementAdmin);

// Admin Activity Logs
router.get('/admin/logs', authenticateAdmin, adminController.getActivityLogs);

export default router;
