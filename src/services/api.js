const API_BASE = '/api';

function getStudentToken() {
  return localStorage.getItem('unilife_student_token');
}

function getAdminToken() {
  return localStorage.getItem('unilife_admin_token');
}

export async function request(endpoint, options = {}, isAdmin = false) {
  const token = isAdmin ? getAdminToken() : getStudentToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (!navigator.onLine) {
      const offlineError = new Error('You are currently offline. Please check your internet connection.');
      offlineError.isOffline = true;
      throw offlineError;
    }
    throw err;
  }
}

// Student APIs
export const api = {
  // Public
  getUniversities: () => request('/public/universities'),
  getDepartments: () => request('/public/departments'),
  getPublicAnnouncements: () => request('/public/announcements'),
  getDonationStats: () => request('/public/donation-stats'),
  submitDonation: (payload) => request('/donations', { method: 'POST', body: payload }),

  // Student Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  forgotPassword: (payload) => request('/auth/forgot-password', { method: 'POST', body: payload }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: payload }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (payload) => request('/auth/profile', { method: 'PUT', body: payload }),
  changePassword: (payload) => request('/auth/change-password', { method: 'PUT', body: payload }),
  updateSettings: (payload) => request('/auth/settings', { method: 'PUT', body: payload }),
  deleteAccount: (payload) => request('/auth/delete-account', { method: 'DELETE', body: payload }),

  // Dashboard
  getDashboardData: () => request('/student/dashboard'),

  // Courses
  getCourses: (params = '') => request(`/student/courses${params}`),
  getCourseDetail: (id) => request(`/student/courses/${id}`),
  createCourse: (payload) => request('/student/courses', { method: 'POST', body: payload }),
  updateCourse: (id, payload) => request(`/student/courses/${id}`, { method: 'PUT', body: payload }),
  deleteCourse: (id) => request(`/student/courses/${id}`, { method: 'DELETE' }),

  // Timetable
  getTimetable: () => request('/student/timetable'),
  createTimetableEntry: (payload) => request('/student/timetable', { method: 'POST', body: payload }),
  updateTimetableEntry: (id, payload) => request(`/student/timetable/${id}`, { method: 'PUT', body: payload }),
  deleteTimetableEntry: (id) => request(`/student/timetable/${id}`, { method: 'DELETE' }),

  // Assignments
  getAssignments: (params = '') => request(`/student/assignments${params}`),
  createAssignment: (payload) => request('/student/assignments', { method: 'POST', body: payload }),
  updateAssignment: (id, payload) => request(`/student/assignments/${id}`, { method: 'PUT', body: payload }),
  toggleAssignment: (id) => request(`/student/assignments/${id}/toggle`, { method: 'PATCH' }),
  deleteAssignment: (id) => request(`/student/assignments/${id}`, { method: 'DELETE' }),

  // Examinations
  getExaminations: (params = '') => request(`/student/exams${params}`),
  createExamination: (payload) => request('/student/exams', { method: 'POST', body: payload }),
  updateExamination: (id, payload) => request(`/student/exams/${id}`, { method: 'PUT', body: payload }),
  deleteExamination: (id) => request(`/student/exams/${id}`, { method: 'DELETE' }),

  // GPA
  getGradingScale: () => request('/student/gpa/scale'),
  updateGradingScale: (payload) => request('/student/gpa/scale', { method: 'PUT', body: payload }),
  getSemesterResults: () => request('/student/gpa/results'),
  saveSemesterResult: (payload) => request('/student/gpa/results', { method: 'POST', body: payload }),
  deleteSemesterResult: (id) => request(`/student/gpa/results/${id}`, { method: 'DELETE' }),
  getGpaSummary: () => request('/student/gpa/summary'),

  // Study
  getStudySessions: (params = '') => request(`/student/study${params}`),
  createStudySession: (payload) => request('/student/study', { method: 'POST', body: payload }),
  updateStudySession: (id, payload) => request(`/student/study/${id}`, { method: 'PUT', body: payload }),
  deleteStudySession: (id) => request(`/student/study/${id}`, { method: 'DELETE' }),
  updateStudyGoal: (payload) => request('/student/study/goals', { method: 'PUT', body: payload }),

  // Notes
  getNotes: (params = '') => request(`/student/notes${params}`),
  getNoteDetail: (id) => request(`/student/notes/${id}`),
  createNote: (payload) => request('/student/notes', { method: 'POST', body: payload }),
  updateNote: (id, payload) => request(`/student/notes/${id}`, { method: 'PUT', body: payload }),
  togglePinNote: (id) => request(`/student/notes/${id}/pin`, { method: 'PATCH' }),
  deleteNote: (id) => request(`/student/notes/${id}`, { method: 'DELETE' }),

  // Attendance
  getAttendance: (params = '') => request(`/student/attendance${params}`),
  recordAttendance: (payload) => request('/student/attendance', { method: 'POST', body: payload }),
  updateAttendance: (id, payload) => request(`/student/attendance/${id}`, { method: 'PUT', body: payload }),
  deleteAttendance: (id) => request(`/student/attendance/${id}`, { method: 'DELETE' }),

  // Calendar
  getCalendarFeed: () => request('/student/calendar'),
  createPersonalEvent: (payload) => request('/student/calendar/events', { method: 'POST', body: payload }),
  updatePersonalEvent: (id, payload) => request(`/student/calendar/events/${id}`, { method: 'PUT', body: payload }),
  deletePersonalEvent: (id) => request(`/student/calendar/events/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => request('/student/notifications'),
  markNotificationRead: (id) => request(`/student/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/student/notifications/read-all', { method: 'PATCH' }),
  deleteNotification: (id) => request(`/student/notifications/${id}`, { method: 'DELETE' })
};

// Admin APIs
export const adminApi = {
  login: (payload) => request('/admin/auth/login', { method: 'POST', body: payload }),
  getMe: () => request('/admin/auth/me', {}, true),
  getAnalytics: (params = '') => request(`/admin/analytics${params}`, {}, true),
  getStudents: (params = '') => request(`/admin/students${params}`, {}, true),
  toggleStudentStatus: (id, payload) => request(`/admin/students/${id}/status`, { method: 'PATCH', body: payload }, true),
  deleteStudent: (id) => request(`/admin/students/${id}`, { method: 'DELETE' }, true),
  getDonations: (params = '') => request(`/admin/donations${params}`, {}, true),
  verifyDonation: (id) => request(`/admin/donations/${id}/verify`, { method: 'PATCH' }, true),
  rejectDonation: (id, payload) => request(`/admin/donations/${id}/reject`, { method: 'PATCH', body: payload }, true),
  getAnnouncements: () => request('/admin/announcements', {}, true),
  createAnnouncement: (payload) => request('/admin/announcements', { method: 'POST', body: payload }, true),
  deleteAnnouncement: (id) => request(`/admin/announcements/${id}`, { method: 'DELETE' }, true),
  getLogs: () => request('/admin/logs', {}, true),
  createAdminUser: (payload) => request('/admin/auth/create', { method: 'POST', body: payload }, true),
  getAdminList: () => request('/admin/auth/list', {}, true)
};
