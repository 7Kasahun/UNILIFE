import { query, getOne } from '../db/db.js';

export async function getDashboardData(req, res) {
  try {
    const userId = req.user.id;

    // 1. Total Courses
    const courseCountRes = await getOne('SELECT COUNT(*) as total FROM courses WHERE user_id = ?', [userId]);
    const totalCourses = (courseCountRes && courseCountRes.total) || 0;

    // 2. Upcoming Assignments
    const nowIso = new Date().toISOString();
    const assignments = await query(
      `SELECT a.*, c.course_name, c.course_code, c.color
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE a.user_id = ? AND a.status != 'Completed' AND a.due_date >= ?
       ORDER BY a.due_date ASC
       LIMIT 5`,
      [userId, nowIso]
    );

    const now = new Date();
    const enrichedAssignments = assignments.map(a => {
      const diffMs = new Date(a.due_date) - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return { ...a, days_remaining: diffDays };
    });

    const totalUpcomingAssignmentsRes = await getOne(
      `SELECT COUNT(*) as total FROM assignments WHERE user_id = ? AND status != 'Completed' AND due_date >= ?`,
      [userId, nowIso]
    );
    const upcomingAssignmentsCount = (totalUpcomingAssignmentsRes && totalUpcomingAssignmentsRes.total) || 0;

    // 3. Upcoming Examinations
    const todayStr = now.toISOString().split('T')[0];
    const examinations = await query(
      `SELECT e.*, c.course_name, c.course_code, c.color
       FROM examinations e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = ? AND e.exam_date >= ?
       ORDER BY e.exam_date ASC, e.exam_time ASC
       LIMIT 5`,
      [userId, todayStr]
    );

    const enrichedExams = examinations.map(e => {
      const diffMs = new Date(`${e.exam_date}T${e.exam_time || '09:00:00'}`) - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return { ...e, days_remaining: diffDays };
    });

    const totalUpcomingExamsRes = await getOne(
      'SELECT COUNT(*) as total FROM examinations WHERE user_id = ? AND exam_date >= ?',
      [userId, todayStr]
    );
    const upcomingExamsCount = (totalUpcomingExamsRes && totalUpcomingExamsRes.total) || 0;

    // 4. Weekly Study Hours & Goal
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weeklyStudyRes = await getOne(
      'SELECT SUM(actual_minutes) as total_min FROM study_sessions WHERE user_id = ? AND session_date >= ?',
      [userId, sevenDaysAgo]
    );
    const weeklyStudyMinutes = (weeklyStudyRes && weeklyStudyRes.total_min) || 0;
    const weeklyStudyHours = Number((weeklyStudyMinutes / 60).toFixed(1));

    let goal = await getOne('SELECT target_hours_per_week FROM study_goals WHERE user_id = ?', [userId]);
    const targetWeeklyHours = (goal && goal.target_hours_per_week) || 15.0;
    const studyGoalProgress = Math.min(100, Math.round((weeklyStudyHours / targetWeeklyHours) * 100));

    // 5. Current Semester GPA
    const semesterResults = await query(
      `SELECT credit_hours, grade_point, is_retake, retake_mode, id, course_code 
       FROM semester_results 
       WHERE user_id = ?`,
      [userId]
    );

    let currentGpa = '0.00';
    if (semesterResults.length > 0) {
      let totalPts = 0;
      let totalCr = 0;
      for (const r of semesterResults) {
        const cr = Number(r.credit_hours);
        const pt = cr * Number(r.grade_point);
        totalCr += cr;
        totalPts += pt;
      }
      if (totalCr > 0) {
        currentGpa = (totalPts / totalCr).toFixed(2);
      }
    }

    // 6. Today's Class Schedule
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = daysOfWeek[now.getDay()];

    const todayClasses = await query(
      `SELECT t.*, c.course_name, c.course_code, c.instructor, c.color
       FROM timetable_entries t
       JOIN courses c ON t.course_id = c.id
       WHERE t.user_id = ? AND t.day_of_week = ?
       ORDER BY t.start_time ASC`,
      [userId, currentDay]
    );

    // 7. Active Announcements
    const announcements = await query(
      'SELECT id, title, content, priority, created_at FROM website_announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 3'
    );

    return res.json({
      success: true,
      data: {
        greeting: `Welcome back, ${req.user.full_name}`,
        todayDate: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        currentDay,
        summaryCards: {
          totalCourses,
          upcomingAssignmentsCount,
          upcomingExamsCount,
          weeklyStudyHours,
          targetWeeklyHours,
          studyGoalProgress,
          currentGpa
        },
        todaySchedule: todayClasses,
        upcomingAssignments: enrichedAssignments,
        upcomingExaminations: enrichedExams,
        announcements
      }
    });
  } catch (err) {
    console.error('Get dashboard data error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard data.' });
  }
}
