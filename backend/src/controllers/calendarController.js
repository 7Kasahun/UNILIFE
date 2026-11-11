import { query, getOne, run } from '../db/db.js';

export async function getCalendarFeed(req, res) {
  try {
    const { start_date, end_date } = req.query;

    // 1. Personal Academic Events
    let personalEvents = await query(
      `SELECT id, title, event_type, event_date as date, start_time, end_time, description, location, 'event' as category
       FROM academic_events 
       WHERE user_id = ?`,
      [req.user.id]
    );

    // 2. Assignment Due Dates
    let assignments = await query(
      `SELECT a.id, a.title, 'Assignment' as event_type, 
              SUBSTR(a.due_date, 1, 10) as date,
              SUBSTR(a.due_date, 12, 5) as start_time,
              c.course_name, c.color, a.status, a.priority, 'assignment' as category
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE a.user_id = ?`,
      [req.user.id]
    );

    // 3. Examination Dates
    let exams = await query(
      `SELECT e.id, e.title, e.exam_type as event_type, e.exam_date as date, e.exam_time as start_time,
              e.location, c.course_name, c.color, 'exam' as category
       FROM examinations e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = ?`,
      [req.user.id]
    );

    // 4. Study Sessions
    let studySessions = await query(
      `SELECT s.id, s.topic as title, 'Study' as event_type, s.session_date as date, s.start_time,
              s.duration_minutes, s.is_completed, c.course_name, 'study' as category
       FROM study_sessions s
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE s.user_id = ?`,
      [req.user.id]
    );

    // 5. Timetable classes
    let timetableEntries = await query(
      `SELECT t.id, c.course_name as title, 'Class' as event_type, t.day_of_week, t.start_time, t.end_time,
              t.classroom as location, c.color, 'class' as category
       FROM timetable_entries t
       JOIN courses c ON t.course_id = c.id
       WHERE t.user_id = ?`,
      [req.user.id]
    );

    return res.json({
      success: true,
      feed: {
        personalEvents,
        assignments,
        exams,
        studySessions,
        timetableEntries
      }
    });
  } catch (err) {
    console.error('Get calendar feed error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve calendar feed.' });
  }
}

export async function createPersonalEvent(req, res) {
  try {
    const { title, event_type, event_date, start_time, end_time, description, location } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({ success: false, message: 'Event title and date are required.' });
    }

    const result = await run(
      `INSERT INTO academic_events (user_id, title, event_type, event_date, start_time, end_time, description, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title.trim(),
        event_type || 'Personal',
        event_date,
        start_time || '09:00',
        end_time || null,
        (description || '').trim(),
        (location || '').trim()
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Event added to calendar.',
      id: result.lastInsertId
    });
  } catch (err) {
    console.error('Create personal event error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create calendar event.' });
  }
}

export async function updatePersonalEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, event_type, event_date, start_time, end_time, description, location } = req.body;

    const existing = await getOne('SELECT id FROM academic_events WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await run(
      `UPDATE academic_events 
       SET title = ?, event_type = ?, event_date = ?, start_time = ?, end_time = ?, description = ?, location = ?
       WHERE id = ? AND user_id = ?`,
      [
        title.trim(),
        event_type || 'Personal',
        event_date,
        start_time,
        end_time,
        (description || '').trim(),
        (location || '').trim(),
        id,
        req.user.id
      ]
    );

    return res.json({ success: true, message: 'Event updated successfully.' });
  } catch (err) {
    console.error('Update personal event error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
}

export async function deletePersonalEvent(req, res) {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT id FROM academic_events WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await run('DELETE FROM academic_events WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Event removed from calendar.' });
  } catch (err) {
    console.error('Delete personal event error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
}
