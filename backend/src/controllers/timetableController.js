import { query, getOne, run } from '../db/db.js';

export async function getTimetable(req, res) {
  try {
    const entries = await query(
      `SELECT t.*, c.course_name, c.course_code, c.color, c.instructor
       FROM timetable_entries t
       JOIN courses c ON t.course_id = c.id
       WHERE t.user_id = ?
       ORDER BY 
         CASE t.day_of_week
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4
           WHEN 'Friday' THEN 5
           WHEN 'Saturday' THEN 6
           WHEN 'Sunday' THEN 7
         END,
         t.start_time ASC`,
      [req.user.id]
    );

    return res.json({ success: true, entries });
  } catch (err) {
    console.error('Get timetable error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve timetable.' });
  }
}

export async function createTimetableEntry(req, res) {
  try {
    const { course_id, day_of_week, start_time, end_time, classroom } = req.body;

    if (!course_id || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Course, day of week, start time, and end time are required.' });
    }

    if (start_time >= end_time) {
      return res.status(400).json({ success: false, message: 'End time must be after start time.' });
    }

    // Verify course belongs to student
    const course = await getOne('SELECT id FROM courses WHERE id = ? AND user_id = ?', [course_id, req.user.id]);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Selected course not found.' });
    }

    // Check conflict
    const conflicts = await query(
      `SELECT t.*, c.course_name 
       FROM timetable_entries t 
       JOIN courses c ON t.course_id = c.id
       WHERE t.user_id = ? AND t.day_of_week = ? 
         AND t.start_time < ? AND t.end_time > ?`,
      [req.user.id, day_of_week, end_time, start_time]
    );

    const hasConflict = conflicts.length > 0;
    const conflictMessage = hasConflict 
      ? `Schedule conflict detected with ${conflicts[0].course_name} (${conflicts[0].start_time} - ${conflicts[0].end_time}).` 
      : null;

    const result = await run(
      `INSERT INTO timetable_entries (user_id, course_id, day_of_week, start_time, end_time, classroom)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, course_id, day_of_week, start_time, end_time, (classroom || '').trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Class added to timetable.',
      id: result.lastInsertId,
      warning: conflictMessage
    });
  } catch (err) {
    console.error('Create timetable entry error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create timetable entry.' });
  }
}

export async function updateTimetableEntry(req, res) {
  try {
    const { id } = req.params;
    const { course_id, day_of_week, start_time, end_time, classroom } = req.body;

    const existing = await getOne('SELECT id FROM timetable_entries WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
    }

    // Check conflict excluding current entry
    const conflicts = await query(
      `SELECT t.*, c.course_name 
       FROM timetable_entries t 
       JOIN courses c ON t.course_id = c.id
       WHERE t.user_id = ? AND t.day_of_week = ? AND t.id != ?
         AND t.start_time < ? AND t.end_time > ?`,
      [req.user.id, day_of_week, id, end_time, start_time]
    );

    const conflictMessage = conflicts.length > 0 
      ? `Schedule conflict detected with ${conflicts[0].course_name} (${conflicts[0].start_time} - ${conflicts[0].end_time}).` 
      : null;

    await run(
      `UPDATE timetable_entries 
       SET course_id = ?, day_of_week = ?, start_time = ?, end_time = ?, classroom = ?
       WHERE id = ? AND user_id = ?`,
      [course_id, day_of_week, start_time, end_time, (classroom || '').trim(), id, req.user.id]
    );

    return res.json({
      success: true,
      message: 'Timetable entry updated.',
      warning: conflictMessage
    });
  } catch (err) {
    console.error('Update timetable entry error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update timetable entry.' });
  }
}

export async function deleteTimetableEntry(req, res) {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT id FROM timetable_entries WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
    }

    await run('DELETE FROM timetable_entries WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Class removed from timetable.' });
  } catch (err) {
    console.error('Delete timetable entry error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete timetable entry.' });
  }
}
