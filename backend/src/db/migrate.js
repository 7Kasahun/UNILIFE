import { initDatabase, run, exec, getClientType } from './db.js';

export async function runMigrations() {
  console.log('🔄 Running UniLife database migrations...');
  await initDatabase();
  const client = getClientType();

  if (client === 'mysql') {
    // MySQL handles standard CREATE TABLE IF NOT EXISTS
    // Let's execute the table statements
  }

  // Schema creation compatible with SQLite and MySQL
  const statements = [
    // 1. Universities
    `CREATE TABLE IF NOT EXISTS universities (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      name TEXT NOT NULL UNIQUE,
      short_name TEXT NOT NULL,
      city TEXT NOT NULL,
      website TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 2. Departments
    `CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      name TEXT NOT NULL,
      faculty TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 3. Users (Students)
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      university TEXT NOT NULL,
      department TEXT NOT NULL,
      degree_program TEXT NOT NULL,
      current_year INTEGER NOT NULL DEFAULT 1,
      profile_picture TEXT,
      is_suspended INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 4. Semesters
    `CREATE TABLE IF NOT EXISTS semesters (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      start_date DATE,
      end_date DATE,
      is_current INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 5. Courses
    `CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      semester_id INTEGER,
      course_code TEXT NOT NULL,
      course_name TEXT NOT NULL,
      credit_hours REAL NOT NULL DEFAULT 3.0,
      instructor TEXT,
      department TEXT,
      semester TEXT,
      academic_year TEXT,
      description TEXT,
      color TEXT DEFAULT '#2563EB',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE SET NULL
    )`,

    // 6. Timetable entries
    `CREATE TABLE IF NOT EXISTS timetable_entries (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      day_of_week TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      classroom TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )`,

    // 7. Assignments
    `CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assigned_date DATE,
      due_date TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Medium',
      status TEXT NOT NULL DEFAULT 'Not started',
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )`,

    // 8. Examinations
    `CREATE TABLE IF NOT EXISTS examinations (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      exam_type TEXT NOT NULL DEFAULT 'Midterm',
      exam_date DATE NOT NULL,
      exam_time TEXT NOT NULL,
      location TEXT,
      prep_status TEXT DEFAULT 'Not started',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )`,

    // 9. Grading scales
    `CREATE TABLE IF NOT EXISTS grading_scales (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER,
      grade_letter TEXT NOT NULL,
      min_score REAL NOT NULL,
      max_score REAL NOT NULL,
      grade_point REAL NOT NULL,
      is_default INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 10. Semester results
    `CREATE TABLE IF NOT EXISTS semester_results (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      semester_id INTEGER,
      semester_name TEXT NOT NULL,
      course_id INTEGER,
      course_code TEXT NOT NULL,
      course_name TEXT NOT NULL,
      credit_hours REAL NOT NULL DEFAULT 3.0,
      grade_letter TEXT NOT NULL,
      grade_point REAL NOT NULL,
      is_retake INTEGER NOT NULL DEFAULT 0,
      retake_mode TEXT DEFAULT 'replace',
      include_in_gpa INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE SET NULL
    )`,

    // 11. Study sessions
    `CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      course_id INTEGER,
      topic TEXT NOT NULL,
      session_date DATE NOT NULL,
      start_time TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      actual_minutes INTEGER NOT NULL DEFAULT 0,
      is_completed INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
    )`,

    // 12. Study goals
    `CREATE TABLE IF NOT EXISTS study_goals (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL UNIQUE,
      goal_type TEXT DEFAULT 'weekly_hours',
      target_hours_per_week REAL NOT NULL DEFAULT 15.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 13. Notes
    `CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      course_id INTEGER,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
    )`,

    // 14. Note attachments
    `CREATE TABLE IF NOT EXISTS note_attachments (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      note_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 15. Attendance records
    `CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      class_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'Attended',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )`,

    // 16. Academic events
    `CREATE TABLE IF NOT EXISTS academic_events (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      event_type TEXT NOT NULL DEFAULT 'Personal',
      event_date DATE NOT NULL,
      start_time TEXT,
      end_time TEXT,
      description TEXT,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 17. Notifications
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'general',
      is_read INTEGER NOT NULL DEFAULT 0,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 18. Donations
    `CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      donor_name TEXT,
      donor_email TEXT,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_reference TEXT NOT NULL UNIQUE,
      notes TEXT,
      is_anonymous INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Pending',
      verified_by_admin_id INTEGER,
      verified_at DATETIME,
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 19. Admin roles
    `CREATE TABLE IF NOT EXISTS admin_roles (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 20. Admin permissions
    `CREATE TABLE IF NOT EXISTS admin_permissions (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      role_id INTEGER NOT NULL,
      permission_key TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE
    )`,

    // 21. Admin users
    `CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES admin_roles(id)
    )`,

    // 22. Admin activity logs
    `CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admin_users(id)
    )`,

    // 23. Website announcements
    `CREATE TABLE IF NOT EXISTS website_announcements (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'info',
      is_active INTEGER NOT NULL DEFAULT 1,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 24. User settings
    `CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL UNIQUE,
      language TEXT NOT NULL DEFAULT 'en',
      email_notifications INTEGER NOT NULL DEFAULT 1,
      push_notifications INTEGER NOT NULL DEFAULT 1,
      theme TEXT NOT NULL DEFAULT 'light',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 25. User activity events
    `CREATE TABLE IF NOT EXISTS user_activity_events (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER,
      event_name TEXT NOT NULL,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 26. Password reset tokens
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY ${client === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  for (const sql of statements) {
    try {
      await run(sql);
    } catch (err) {
      console.error('Migration statement error:', err.message);
      throw err;
    }
  }

  console.log('✅ Migrations completed successfully. All 26 tables initialized.');
}

if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
