import { query, getOne, run } from '../db/db.js';

export async function getAdminAnalytics(req, res) {
  try {
    const { range } = req.query; // '7days', '30days', '90days', 'all'

    // 1. Total Registered Students
    const totalUsersRes = await getOne('SELECT COUNT(*) as total FROM users');
    const totalStudents = (totalUsersRes && totalUsersRes.total) || 0;

    // 2. Active Students (activity within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const activeStudentsRes = await getOne(
      'SELECT COUNT(DISTINCT user_id) as total FROM user_activity_events WHERE created_at >= ?',
      [thirtyDaysAgo]
    );
    const activeStudents = (activeStudentsRes && activeStudentsRes.total) || 0;

    // 3. New Registrations: Today, This Week, This Month
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayIso = startOfToday.toISOString();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthIso = startOfMonth.toISOString();

    const regTodayRes = await getOne('SELECT COUNT(*) as total FROM users WHERE created_at >= ?', [startOfTodayIso]);
    const regWeekRes = await getOne('SELECT COUNT(*) as total FROM users WHERE created_at >= ?', [sevenDaysAgo]);
    const regMonthRes = await getOne('SELECT COUNT(*) as total FROM users WHERE created_at >= ?', [startOfMonthIso]);

    const newRegsToday = (regTodayRes && regTodayRes.total) || 0;
    const newRegsThisWeek = (regWeekRes && regWeekRes.total) || 0;
    const newRegsThisMonth = (regMonthRes && regMonthRes.total) || 0;

    // 4. Feature Totals
    const coursesCountRes = await getOne('SELECT COUNT(*) as total FROM courses');
    const assignmentsCountRes = await getOne('SELECT COUNT(*) as total FROM assignments');
    const examsCountRes = await getOne('SELECT COUNT(*) as total FROM examinations');
    const studySessionsCountRes = await getOne('SELECT COUNT(*) as total FROM study_sessions');
    const notesCountRes = await getOne('SELECT COUNT(*) as total FROM notes');
    const timetableCountRes = await getOne('SELECT COUNT(*) as total FROM timetable_entries');

    // 5. Donation Totals
    const verifiedDonationsRes = await getOne("SELECT SUM(amount) as total, COUNT(*) as count FROM donations WHERE status = 'Verified'");
    const pendingDonationsRes = await getOne("SELECT COUNT(*) as count FROM donations WHERE status = 'Pending'");

    const totalVerifiedDonations = (verifiedDonationsRes && verifiedDonationsRes.total) || 0;
    const verifiedDonationCount = (verifiedDonationsRes && verifiedDonationsRes.count) || 0;
    const pendingDonationsCount = (pendingDonationsRes && pendingDonationsRes.count) || 0;

    // 6. Registration Trend (Daily over last 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const registrationTrends = await query(
      `SELECT SUBSTR(created_at, 1, 10) as date, COUNT(*) as count 
       FROM users 
       WHERE created_at >= ?
       GROUP BY SUBSTR(created_at, 1, 10) 
       ORDER BY date ASC`,
      [fourteenDaysAgo]
    );

    // 7. University Distribution
    const universityDistribution = await query(
      `SELECT university, COUNT(*) as student_count 
       FROM users 
       GROUP BY university 
       ORDER BY student_count DESC 
       LIMIT 6`
    );

    return res.json({
      success: true,
      summary: {
        totalStudents,
        activeStudents,
        newRegsToday,
        newRegsThisWeek,
        newRegsThisMonth,
        totalCourses: (coursesCountRes && coursesCountRes.total) || 0,
        totalAssignments: (assignmentsCountRes && assignmentsCountRes.total) || 0,
        totalExaminations: (examsCountRes && examsCountRes.total) || 0,
        totalStudySessions: (studySessionsCountRes && studySessionsCountRes.total) || 0,
        totalNotes: (notesCountRes && notesCountRes.total) || 0,
        totalTimetableEntries: (timetableCountRes && timetableCountRes.total) || 0,
        totalVerifiedDonations: Number(totalVerifiedDonations),
        verifiedDonationCount,
        pendingDonationsCount
      },
      charts: {
        registrationTrends,
        universityDistribution,
        featureUsage: [
          { feature: 'Courses', count: (coursesCountRes && coursesCountRes.total) || 0 },
          { feature: 'Assignments', count: (assignmentsCountRes && assignmentsCountRes.total) || 0 },
          { feature: 'Examinations', count: (examsCountRes && examsCountRes.total) || 0 },
          { feature: 'Study Sessions', count: (studySessionsCountRes && studySessionsCountRes.total) || 0 },
          { feature: 'Notes', count: (notesCountRes && notesCountRes.total) || 0 },
          { feature: 'Timetable Classes', count: (timetableCountRes && timetableCountRes.total) || 0 }
        ]
      }
    });
  } catch (err) {
    console.error('Get admin analytics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve analytics.' });
  }
}

export async function getStudents(req, res) {
  try {
    const { search, status, university, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sql = `
      SELECT u.id, u.full_name, u.email, u.username, u.university, u.department, u.degree_program, u.current_year, u.is_suspended, u.created_at,
        (SELECT COUNT(*) FROM courses c WHERE c.user_id = u.id) as course_count,
        (SELECT COUNT(*) FROM assignments a WHERE a.user_id = u.id) as assignment_count
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    if (status === 'active') {
      sql += ' AND u.is_suspended = 0';
    } else if (status === 'suspended') {
      sql += ' AND u.is_suspended = 1';
    }

    if (university) {
      sql += ' AND u.university = ?';
      params.push(university);
    }

    sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const students = await query(sql, params);

    // Get total count
    const totalCountRes = await getOne('SELECT COUNT(*) as total FROM users');
    const totalCount = (totalCountRes && totalCountRes.total) || 0;

    return res.json({
      success: true,
      students,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get students error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve students.' });
  }
}

export async function toggleStudentStatus(req, res) {
  try {
    const { id } = req.params;
    const { is_suspended, reason } = req.body;

    const student = await getOne('SELECT id, full_name, username FROM users WHERE id = ?', [id]);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    const newStatus = is_suspended ? 1 : 0;
    await run('UPDATE users SET is_suspended = ? WHERE id = ?', [newStatus, id]);

    // Log admin action
    await run(
      'INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, "users", ?, ?)',
      [
        req.admin.id,
        newStatus ? 'suspend_student' : 'reactivate_student',
        id,
        `${newStatus ? 'Suspended' : 'Reactivated'} student ${student.username}. Reason: ${reason || 'N/A'}`
      ]
    );

    return res.json({
      success: true,
      message: `Student account has been ${newStatus ? 'suspended' : 'reactivated'}.`
    });
  } catch (err) {
    console.error('Toggle student status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update student status.' });
  }
}

export async function deleteStudentAdmin(req, res) {
  try {
    const { id } = req.params;
    const student = await getOne('SELECT id, username FROM users WHERE id = ?', [id]);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    await run('DELETE FROM users WHERE id = ?', [id]);

    await run(
      'INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details) VALUES (?, "delete_student", "users", ?, ?)',
      [req.admin.id, id, `Permanently deleted student account: ${student.username}`]
    );

    return res.json({ success: true, message: 'Student account permanently deleted.' });
  } catch (err) {
    console.error('Delete student error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
}

export async function getAnnouncementsAdmin(req, res) {
  try {
    const announcements = await query('SELECT * FROM website_announcements ORDER BY created_at DESC');
    return res.json({ success: true, announcements });
  } catch (err) {
    console.error('Get announcements error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve announcements.' });
  }
}

export async function createAnnouncementAdmin(req, res) {
  try {
    const { title, content, priority, is_active } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const result = await run(
      'INSERT INTO website_announcements (title, content, priority, is_active) VALUES (?, ?, ?, ?)',
      [title.trim(), content.trim(), priority || 'info', is_active !== undefined ? (is_active ? 1 : 0) : 1]
    );

    await run(
      'INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details) VALUES (?, "create_announcement", "website_announcements", ?, ?)',
      [req.admin.id, result.lastInsertId, `Created announcement: ${title.trim()}`]
    );

    return res.status(201).json({ success: true, message: 'Announcement published successfully.' });
  } catch (err) {
    console.error('Create announcement error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create announcement.' });
  }
}

export async function deleteAnnouncementAdmin(req, res) {
  try {
    const { id } = req.params;
    await run('DELETE FROM website_announcements WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    console.error('Delete announcement error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete announcement.' });
  }
}

export async function getActivityLogs(req, res) {
  try {
    const logs = await query(
      `SELECT l.*, a.full_name as admin_name, a.username as admin_username 
       FROM admin_activity_logs l
       JOIN admin_users a ON l.admin_id = a.id
       ORDER BY l.created_at DESC LIMIT 100`
    );
    return res.json({ success: true, logs });
  } catch (err) {
    console.error('Get activity logs error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve logs.' });
  }
}
