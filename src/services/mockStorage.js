/**
 * UniLife Ethiopia — Offline & Client-Side Storage Adapter
 * Powers complete account creation, sign-in, and all academic tools on GitHub Pages
 * and offline PWA mode without requiring a backend server.
 */

// Initial Seed Universities
const SEED_UNIVERSITIES = [
  { id: 1, name: 'Addis Ababa University', short_name: 'AAU', city: 'Addis Ababa' },
  { id: 2, name: 'Bahir Dar University', short_name: 'BDU', city: 'Bahir Dar' },
  { id: 3, name: 'Hawassa University', short_name: 'HU', city: 'Hawassa' },
  { id: 4, name: 'Jimma University', short_name: 'JU', city: 'Jimma' },
  { id: 5, name: 'Mekelle University', short_name: 'MU', city: 'Mekelle' },
  { id: 6, name: 'Arba Minch University', short_name: 'AMU', city: 'Arba Minch' },
  { id: 7, name: 'University of Gondar', short_name: 'UoG', city: 'Gondar' },
  { id: 8, name: 'Haramaya University', short_name: 'HU-ET', city: 'Haramaya' },
  { id: 9, name: 'Adama Science and Technology University', short_name: 'ASTU', city: 'Adama' },
  { id: 10, name: 'Addis Ababa Science and Technology University', short_name: 'AASTU', city: 'Addis Ababa' },
  { id: 11, name: 'Wollo University', short_name: 'WU', city: 'Dessie' },
  { id: 12, name: 'Dilla University', short_name: 'DU', city: 'Dilla' },
  { id: 13, name: 'Debre Berhan University', short_name: 'DBU', city: 'Debre Berhan' },
  { id: 14, name: 'Debre Markos University', short_name: 'DMU', city: 'Debre Markos' },
  { id: 15, name: 'Wollega University', short_name: 'WU-ET', city: 'Nekemte' }
];

// Initial Seed Departments
const SEED_DEPARTMENTS = [
  { id: 1, name: 'Software Engineering', faculty: 'Informatics & Technology' },
  { id: 2, name: 'Computer Science', faculty: 'Informatics & Technology' },
  { id: 3, name: 'Information Technology', faculty: 'Informatics & Technology' },
  { id: 4, name: 'Electrical & Computer Engineering', faculty: 'Engineering' },
  { id: 5, name: 'Mechanical Engineering', faculty: 'Engineering' },
  { id: 6, name: 'Civil Engineering', faculty: 'Engineering' },
  { id: 7, name: 'Chemical Engineering', faculty: 'Engineering' },
  { id: 8, name: 'Medicine (MD)', faculty: 'Health Sciences' },
  { id: 9, name: 'Pharmacy', faculty: 'Health Sciences' },
  { id: 10, name: 'Public Health & Nursing', faculty: 'Health Sciences' },
  { id: 11, name: 'Accounting and Finance', faculty: 'Business and Economics' },
  { id: 12, name: 'Economics', faculty: 'Business and Economics' },
  { id: 13, name: 'Management', faculty: 'Business and Economics' },
  { id: 14, name: 'Law (LL.B)', faculty: 'College of Law' },
  { id: 15, name: 'Architecture and Urban Planning', faculty: 'Engineering' },
  { id: 16, name: 'Biomedical Science', faculty: 'Natural Sciences' }
];

// Helper to parse JSON safely
function safeJsonParse(val, fallback = null) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}

// Helper to get current stored user
function getCurrentUser() {
  const raw = localStorage.getItem('unilife_student');
  return safeJsonParse(raw, null);
}

function getStoredUsers() {
  const raw = localStorage.getItem('unilife_mock_users');
  const parsed = safeJsonParse(raw, null);
  if (parsed && Array.isArray(parsed)) return parsed;
  
  // Default pre-seeded demo student
  const defaultUser = {
    id: 1,
    full_name: 'Abebe Bikila',
    username: 'student',
    email: 'student@unilife.et',
    password: 'Student@123',
    university: 'Addis Ababa University',
    department: 'Software Engineering',
    degree_program: 'Bachelor of Science (B.Sc.)',
    current_year: 3,
    status: 'active',
    created_at: new Date().toISOString()
  };
  localStorage.setItem('unilife_mock_users', JSON.stringify([defaultUser]));
  return [defaultUser];
}

function saveStoredUsers(users) {
  localStorage.setItem('unilife_mock_users', JSON.stringify(users));
}

function getEntityList(key, defaultData = []) {
  const user = getCurrentUser();
  const userId = user?.id || 'guest';
  const raw = localStorage.getItem(`unilife_mock_${key}_${userId}`);
  const parsed = safeJsonParse(raw, null);
  if (parsed && Array.isArray(parsed)) return parsed;
  localStorage.setItem(`unilife_mock_${key}_${userId}`, JSON.stringify(defaultData));
  return defaultData;
}

function saveEntityList(key, list) {
  const user = getCurrentUser();
  const userId = user?.id || 'guest';
  localStorage.setItem(`unilife_mock_${key}_${userId}`, JSON.stringify(list));
}

// Main handler
export async function handleMockRequest(endpoint, options = {}, isAdmin = false) {
  const method = (options.method || 'GET').toUpperCase();
  const body = safeJsonParse(options.body, {});

  // Artificial slight delay to simulate natural responsiveness
  await new Promise(r => setTimeout(r, 60));

  // ==========================================
  // 1. PUBLIC ENDPOINTS
  // ==========================================
  if (endpoint === '/public/universities') {
    return { success: true, universities: SEED_UNIVERSITIES };
  }
  if (endpoint === '/public/departments') {
    return { success: true, departments: SEED_DEPARTMENTS };
  }
  if (endpoint === '/public/announcements') {
    return {
      success: true,
      announcements: [
        {
          id: 1,
          title: 'Welcome to UniLife Ethiopia PWA!',
          content: 'UniLife Ethiopia is 100% free forever for all university and college students across Ethiopia. Install the PWA to access all your courses, timetables, and Ethiopian GPA calculation tools offline.',
          priority: 'high',
          created_at: new Date().toISOString()
        }
      ]
    };
  }
  if (endpoint === '/public/donation-stats') {
    return {
      success: true,
      stats: {
        total_amount: 14250,
        total_donations: 38,
        recent_donors: [
          { name: 'Kassahun A.', amount: 500, created_at: new Date().toISOString() },
          { name: 'Anonymous Student', amount: 100, created_at: new Date().toISOString() }
        ]
      }
    };
  }
  if (endpoint === '/donations' && method === 'POST') {
    return {
      success: true,
      message: 'Thank you! Your donation reference has been received and will be verified shortly.'
    };
  }

  // ==========================================
  // 2. AUTHENTICATION (REGISTER & LOGIN)
  // ==========================================
  if (endpoint === '/auth/register' && method === 'POST') {
    const users = getStoredUsers();
    const existing = users.find(u => 
      u.email.toLowerCase() === (body.email || '').toLowerCase() || 
      u.username.toLowerCase() === (body.username || '').toLowerCase()
    );

    if (existing) {
      const error = new Error('An account with this email or username already exists.');
      error.status = 409;
      throw error;
    }

    const newUser = {
      id: Date.now(),
      full_name: body.full_name || 'Student',
      email: body.email,
      username: body.username || body.email.split('@')[0],
      password: body.password,
      university: body.university || 'Addis Ababa University',
      department: body.department || 'Software Engineering',
      degree_program: body.degree_program || 'Bachelor of Science (B.Sc.)',
      current_year: Number(body.current_year) || 1,
      status: 'active',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    saveStoredUsers(users);

    // Initial starter academic items for newly registered student
    const starterCourses = [
      { id: 1, course_code: 'CSE301', course_name: 'Database Systems', credit_hours: 4, instructor: 'Dr. Kebede', room: 'Hall 4B', color: '#2563EB' },
      { id: 2, course_code: 'CSE302', course_name: 'Software Architecture', credit_hours: 3, instructor: 'Prof. Almaz', room: 'Lab 2', color: '#16A34A' }
    ];
    saveEntityList('courses', starterCourses);

    const token = 'mock_jwt_token_' + Date.now();
    return {
      success: true,
      message: 'Account created successfully! Welcome to UniLife Ethiopia.',
      token,
      user: newUser
    };
  }

  if (endpoint === '/auth/login' && method === 'POST') {
    const users = getStoredUsers();
    const ident = (body.login_identifier || '').trim().toLowerCase();
    const pass = body.password || '';

    // Match username or email
    const user = users.find(u => 
      u.username.toLowerCase() === ident || 
      u.email.toLowerCase() === ident
    );

    // Validate password or accept pre-registered password
    if (!user || (user.password && user.password !== pass)) {
      const error = new Error('Invalid email/username or password. Please try again.');
      error.status = 401;
      throw error;
    }

    const token = 'mock_jwt_token_' + Date.now();
    return {
      success: true,
      message: 'Signed in successfully!',
      token,
      user
    };
  }

  if (endpoint === '/auth/profile') {
    const user = getCurrentUser();
    if (!user) {
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }
    return { success: true, user };
  }

  if (endpoint === '/auth/profile' && method === 'PUT') {
    const user = getCurrentUser();
    const updated = { ...user, ...body };
    localStorage.setItem('unilife_student', JSON.stringify(updated));
    return { success: true, message: 'Profile updated successfully', user: updated };
  }

  if (endpoint === '/auth/forgot-password' && method === 'POST') {
    return { success: true, message: 'Password reset link sent to your email.' };
  }

  if (endpoint === '/auth/reset-password' && method === 'POST') {
    return { success: true, message: 'Password updated successfully. You may now log in.' };
  }

  // ==========================================
  // 3. STUDENT DASHBOARD & METRICS
  // ==========================================
  if (endpoint === '/student/dashboard') {
    const courses = getEntityList('courses');
    const assignments = getEntityList('assignments');
    const exams = getEntityList('exams');
    const study = getEntityList('study');

    return {
      success: true,
      dashboard: {
        total_courses: courses.length,
        pending_assignments: assignments.filter(a => a.status !== 'completed').length,
        upcoming_exams: exams.length,
        weekly_study_hours: 12.5,
        study_goal_hours: 20,
        upcoming_deadlines: assignments.slice(0, 3),
        today_schedule: []
      }
    };
  }

  // ==========================================
  // 4. COURSES API
  // ==========================================
  if (endpoint.startsWith('/student/courses')) {
    let courses = getEntityList('courses', [
      { id: 1, course_code: 'CSE301', course_name: 'Database Systems', credit_hours: 4, instructor: 'Dr. Kebede', room: 'Hall 4B', color: '#2563EB' },
      { id: 2, course_code: 'CSE302', course_name: 'Software Architecture', credit_hours: 3, instructor: 'Prof. Almaz', room: 'Lab 2', color: '#16A34A' },
      { id: 3, course_code: 'MATH201', course_name: 'Applied Mathematics II', credit_hours: 4, instructor: 'Dr. Tadesse', room: 'Hall 1A', color: '#9333EA' }
    ]);

    if (method === 'GET') {
      const matchId = endpoint.match(/\/student\/courses\/(\d+)/);
      if (matchId) {
        const found = courses.find(c => c.id === Number(matchId[1]));
        return { success: true, course: found || courses[0] };
      }
      return { success: true, courses };
    }
    if (method === 'POST') {
      const newCourse = { id: Date.now(), ...body };
      courses.push(newCourse);
      saveEntityList('courses', courses);
      return { success: true, message: 'Course created successfully', course: newCourse };
    }
    if (method === 'PUT') {
      const id = Number(endpoint.split('/').pop());
      courses = courses.map(c => c.id === id ? { ...c, ...body } : c);
      saveEntityList('courses', courses);
      return { success: true, message: 'Course updated successfully' };
    }
    if (method === 'DELETE') {
      const id = Number(endpoint.split('/').pop());
      courses = courses.filter(c => c.id !== id);
      saveEntityList('courses', courses);
      return { success: true, message: 'Course removed successfully' };
    }
  }

  // ==========================================
  // 5. TIMETABLE API
  // ==========================================
  if (endpoint.startsWith('/student/timetable')) {
    let timetable = getEntityList('timetable', [
      { id: 1, course_id: 1, course_name: 'Database Systems', day_of_week: 'Monday', start_time: '08:30', end_time: '10:00', room: 'Hall 4B', color: '#2563EB' },
      { id: 2, course_id: 2, course_name: 'Software Architecture', day_of_week: 'Wednesday', start_time: '10:30', end_time: '12:00', room: 'Lab 2', color: '#16A34A' }
    ]);

    if (method === 'GET') {
      return { success: true, timetable };
    }
    if (method === 'POST') {
      const newEntry = { id: Date.now(), ...body };
      timetable.push(newEntry);
      saveEntityList('timetable', timetable);
      return { success: true, message: 'Timetable entry added successfully', entry: newEntry };
    }
    if (method === 'DELETE') {
      const id = Number(endpoint.split('/').pop());
      timetable = timetable.filter(t => t.id !== id);
      saveEntityList('timetable', timetable);
      return { success: true, message: 'Class slot removed' };
    }
  }

  // ==========================================
  // 6. ASSIGNMENTS API
  // ==========================================
  if (endpoint.startsWith('/student/assignments')) {
    let assignments = getEntityList('assignments', [
      { id: 1, title: 'SQL Query Optimization Lab', course_name: 'Database Systems', due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], priority: 'high', status: 'pending' },
      { id: 2, title: 'Software Design Document (UML)', course_name: 'Software Architecture', due_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], priority: 'medium', status: 'in_progress' }
    ]);

    if (method === 'GET') {
      return { success: true, assignments };
    }
    if (method === 'POST') {
      const newAssignment = { id: Date.now(), status: 'pending', ...body };
      assignments.push(newAssignment);
      saveEntityList('assignments', assignments);
      return { success: true, message: 'Assignment created successfully', assignment: newAssignment };
    }
    if (endpoint.includes('/toggle') && method === 'PATCH') {
      const id = Number(endpoint.split('/')[3]);
      assignments = assignments.map(a => a.id === id ? { ...a, status: a.status === 'completed' ? 'pending' : 'completed' } : a);
      saveEntityList('assignments', assignments);
      return { success: true, message: 'Status updated' };
    }
    if (method === 'DELETE') {
      const id = Number(endpoint.split('/').pop());
      assignments = assignments.filter(a => a.id !== id);
      saveEntityList('assignments', assignments);
      return { success: true, message: 'Assignment deleted' };
    }
  }

  // ==========================================
  // 7. EXAMINATIONS API
  // ==========================================
  if (endpoint.startsWith('/student/exams')) {
    let exams = getEntityList('exams', [
      { id: 1, course_name: 'Database Systems', exam_type: 'Midterm', exam_date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0], start_time: '09:00', room: 'Hall 4B', weight_percentage: 30 }
    ]);

    if (method === 'GET') {
      return { success: true, exams };
    }
    if (method === 'POST') {
      const newExam = { id: Date.now(), ...body };
      exams.push(newExam);
      saveEntityList('exams', exams);
      return { success: true, message: 'Exam scheduled successfully', exam: newExam };
    }
    if (method === 'DELETE') {
      const id = Number(endpoint.split('/').pop());
      exams = exams.filter(e => e.id !== id);
      saveEntityList('exams', exams);
      return { success: true, message: 'Exam entry removed' };
    }
  }

  // ==========================================
  // 8. ETHIOPIAN GPA CALCULATOR
  // ==========================================
  if (endpoint.startsWith('/student/gpa')) {
    if (endpoint.includes('/scale')) {
      return {
        success: true,
        scale: [
          { letter: 'A+', point: 4.0 }, { letter: 'A', point: 4.0 }, { letter: 'A-', point: 3.75 },
          { letter: 'B+', point: 3.5 }, { letter: 'B', point: 3.0 }, { letter: 'B-', point: 2.75 },
          { letter: 'C+', point: 2.5 }, { letter: 'C', point: 2.0 }, { letter: 'C-', point: 1.75 },
          { letter: 'D', point: 1.0 },  { letter: 'F', point: 0.0 }
        ]
      };
    }
    if (endpoint.includes('/summary') || endpoint.includes('/results')) {
      let results = getEntityList('gpa_results', [
        { id: 1, semester: 'Year 2 Semester I', course_name: 'Data Structures', credit_hours: 4, letter_grade: 'A', grade_points: 16 },
        { id: 2, semester: 'Year 2 Semester I', course_name: 'Computer Organization', credit_hours: 4, letter_grade: 'A-', grade_points: 15 },
        { id: 3, semester: 'Year 2 Semester I', course_name: 'Operating Systems', credit_hours: 3, letter_grade: 'B+', grade_points: 10.5 }
      ]);

      if (method === 'POST') {
        const newRes = { id: Date.now(), ...body };
        results.push(newRes);
        saveEntityList('gpa_results', results);
        return { success: true, message: 'Semester result recorded', result: newRes };
      }

      const totalCredits = results.reduce((acc, r) => acc + Number(r.credit_hours || 0), 0);
      const totalPoints = results.reduce((acc, r) => acc + Number(r.grade_points || 0), 0);
      const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '4.00';

      return {
        success: true,
        summary: {
          cgpa,
          total_credit_hours: totalCredits,
          total_grade_points: totalPoints,
          semester_count: 1
        },
        results
      };
    }
  }

  // ==========================================
  // 9. STUDY TIMER & NOTES & ATTENDANCE
  // ==========================================
  if (endpoint.startsWith('/student/study')) {
    let sessions = getEntityList('study', []);
    if (method === 'GET') return { success: true, sessions, weekly_goal: 20 };
    if (method === 'POST') {
      sessions.push({ id: Date.now(), ...body, created_at: new Date().toISOString() });
      saveEntityList('study', sessions);
      return { success: true, message: 'Study session logged' };
    }
  }

  if (endpoint.startsWith('/student/notes')) {
    let notes = getEntityList('notes', [
      { id: 1, title: 'Database Indexing Techniques', content: 'B-Trees vs Hash Indexes for fast query retrieval.', is_pinned: 1, created_at: new Date().toISOString() }
    ]);
    if (method === 'GET') return { success: true, notes };
    if (method === 'POST') {
      const newNote = { id: Date.now(), is_pinned: 0, ...body, created_at: new Date().toISOString() };
      notes.push(newNote);
      saveEntityList('notes', notes);
      return { success: true, message: 'Note saved', note: newNote };
    }
    if (method === 'DELETE') {
      const id = Number(endpoint.split('/').pop());
      notes = notes.filter(n => n.id !== id);
      saveEntityList('notes', notes);
      return { success: true, message: 'Note deleted' };
    }
  }

  if (endpoint.startsWith('/student/attendance')) {
    let attendance = getEntityList('attendance', [
      { id: 1, course_name: 'Database Systems', attended_classes: 12, total_classes: 14, attendance_rate: 85.7 }
    ]);
    if (method === 'GET') return { success: true, attendance };
    if (method === 'POST') {
      const newAtt = { id: Date.now(), ...body };
      attendance.push(newAtt);
      saveEntityList('attendance', attendance);
      return { success: true, message: 'Attendance recorded' };
    }
  }

  if (endpoint.startsWith('/student/calendar')) {
    return {
      success: true,
      events: [
        { id: 1, title: 'Database Midterm', date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0], category: 'exam' }
      ]
    };
  }

  if (endpoint.startsWith('/student/notifications')) {
    return {
      success: true,
      notifications: [
        { id: 1, title: 'Welcome to UniLife', message: 'Set up your courses and timetable to receive automatic schedule conflict warnings.', is_read: 0, created_at: new Date().toISOString() }
      ]
    };
  }

  // ==========================================
  // 10. ADMINISTRATOR AUTH & PORTAL
  // ==========================================
  if (endpoint === '/admin/auth/login' && method === 'POST') {
    const ident = (body.login_identifier || body.username || body.email || '').trim();
    const pass = (body.password || '').trim();

    // Administrator credentials requirement: Username Admin@UniLife2026, Password saoladmin@Unilife
    const isUserValid = ident.toLowerCase() === 'admin@unilife2026' || ident === 'Admin@UniLife2026' || ident.toLowerCase() === 'admin';
    const isPassValid = pass === 'saoladmin@Unilife';

    if (isUserValid && isPassValid) {
      const admin = {
        id: 1,
        full_name: 'UniLife Administrator',
        username: 'Admin@UniLife2026',
        email: 'admin@unilife.et',
        role: 'superadmin'
      };
      return {
        success: true,
        message: 'Super Administrator signed in successfully',
        token: 'mock_admin_token_' + Date.now(),
        admin
      };
    }
    const error = new Error('Invalid administrator credentials.');
    error.status = 401;
    throw error;
  }

  if (endpoint === '/admin/auth/me') {
    return {
      success: true,
      admin: {
        id: 1,
        full_name: 'UniLife Administrator',
        username: 'Admin@UniLife2026',
        email: 'admin@unilife.et',
        role: 'superadmin'
      }
    };
  }

  if (endpoint.startsWith('/admin/analytics')) {
    const users = getStoredUsers();

    // Group users by university
    const uniMap = {};
    users.forEach(u => {
      const uni = u.university || 'Addis Ababa University';
      uniMap[uni] = (uniMap[uni] || 0) + 1;
    });
    const universityDistribution = Object.entries(uniMap).map(([university, student_count]) => ({
      university,
      student_count
    }));

    // Today's registrations
    const todayStr = new Date().toISOString().split('T')[0];
    const newRegsToday = users.filter(u => (u.created_at || '').startsWith(todayStr)).length;

    // Donations
    const donations = getEntityList('admin_donations', [
      { id: 1, donor_name: 'Kassahun A.', amount: 500, payment_method: 'Telebirr', reference_number: 'TXN9382103', status: 'verified', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, donor_name: 'Anonymous Student', amount: 100, payment_method: 'CBE Birr', reference_number: 'CBE849102', status: 'pending', created_at: new Date().toISOString() }
    ]);
    const verifiedDons = donations.filter(d => d.status === 'verified');
    const totalVerifiedDonations = verifiedDons.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const pendingDonations = donations.filter(d => d.status === 'pending');

    return {
      success: true,
      summary: {
        totalStudents: users.length,
        activeStudents: users.length,
        newRegsToday: newRegsToday,
        newRegsThisWeek: users.length,
        totalVerifiedDonations: totalVerifiedDonations,
        verifiedDonationCount: verifiedDons.length,
        pendingDonationsCount: pendingDonations.length
      },
      charts: {
        featureUsage: [
          { feature: 'Courses', count: users.length * 3 },
          { feature: 'Timetable', count: users.length * 4 },
          { feature: 'Assignments', count: users.length * 2 },
          { feature: 'Exams', count: users.length },
          { feature: 'GPA Records', count: users.length * 3 },
          { feature: 'Study Sessions', count: users.length * 2 }
        ],
        registrationTrends: [
          { date: todayStr, count: newRegsToday }
        ],
        universityDistribution
      }
    };
  }

  if (endpoint.startsWith('/admin/students')) {
    let users = getStoredUsers();
    if (endpoint.includes('/status') && method === 'PATCH') {
      const id = Number(endpoint.split('/')[3]);
      users = users.map(u => u.id === id ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u);
      saveStoredUsers(users);
      return { success: true, message: 'Student status updated successfully' };
    }
    if (method === 'DELETE') {
      const id = Number(endpoint.split('/').pop());
      users = users.filter(u => u.id !== id);
      saveStoredUsers(users);
      return { success: true, message: 'Student account deleted' };
    }
    return {
      success: true,
      students: users,
      pagination: {
        total: users.length,
        totalPages: 1
      }
    };
  }

  if (endpoint.startsWith('/admin/donations')) {
    let donations = getEntityList('admin_donations', [
      { id: 1, donor_name: 'Kassahun A.', amount: 500, payment_method: 'Telebirr', reference_number: 'TXN9382103', status: 'verified', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, donor_name: 'Anonymous Student', amount: 100, payment_method: 'CBE Birr', reference_number: 'CBE849102', status: 'pending', created_at: new Date().toISOString() }
    ]);
    if (endpoint.includes('/verify') && method === 'PATCH') {
      const id = Number(endpoint.split('/')[3]);
      donations = donations.map(d => d.id === id ? { ...d, status: 'verified' } : d);
      saveEntityList('admin_donations', donations);
      return { success: true, message: 'Donation verified successfully' };
    }
    if (endpoint.includes('/reject') && method === 'PATCH') {
      const id = Number(endpoint.split('/')[3]);
      donations = donations.map(d => d.id === id ? { ...d, status: 'rejected' } : d);
      saveEntityList('admin_donations', donations);
      return { success: true, message: 'Donation rejected' };
    }
    return { success: true, donations };
  }

  if (endpoint.startsWith('/admin/announcements')) {
    let announcements = getEntityList('admin_announcements', [
      { id: 1, title: 'Exam Timetable Release - Semester I', content: 'Final examination schedules for all university faculties have been verified and announced.', priority: 'high', created_at: new Date().toISOString() }
    ]);
    if (method === 'POST') {
      const newAnn = { id: Date.now(), ...body, created_at: new Date().toISOString() };
      announcements.push(newAnn);
      saveEntityList('admin_announcements', announcements);
      return { success: true, message: 'Announcement published successfully', announcement: newAnn };
    }
    if (method === 'DELETE') {
      const id = Number(endpoint.split('/').pop());
      announcements = announcements.filter(a => a.id !== id);
      saveEntityList('admin_announcements', announcements);
      return { success: true, message: 'Announcement deleted' };
    }
    return { success: true, announcements };
  }

  if (endpoint.startsWith('/admin/logs')) {
    return {
      success: true,
      logs: [
        { id: 1, action: 'ADMIN_LOGIN', details: 'Super Admin logged in to Management Console', ip_address: '127.0.0.1', created_at: new Date().toISOString() },
        { id: 2, action: 'DONATION_VERIFY', details: 'Verified Telebirr contribution receipt TXN9382103', ip_address: '127.0.0.1', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, action: 'SYSTEM_HEALTH', details: 'Automated database integrity check passed', ip_address: 'System', created_at: new Date(Date.now() - 7200000).toISOString() }
      ]
    };
  }

  if (endpoint.startsWith('/admin/auth/list')) {
    return {
      success: true,
      admins: [
        { id: 1, full_name: 'UniLife Super Admin', username: 'admin', email: 'admin@unilife.et', role: 'superadmin' }
      ]
    };
  }

  // Generic fallback
  return { success: true, message: 'Action completed successfully.' };
}
