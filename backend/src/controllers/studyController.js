import { query, getOne, run } from '../db/db.js';

export async function getStudySessions(req, res) {
  try {
    const { course_id, date } = req.query;
    let sql = `
      SELECT s.*, c.course_name, c.course_code, c.color
      FROM study_sessions s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE s.user_id = ?
    `;
    const params = [req.user.id];

    if (course_id) {
      sql += ' AND s.course_id = ?';
      params.push(course_id);
    }

    if (date) {
      sql += ' AND s.session_date = ?';
      params.push(date);
    }

    sql += ' ORDER BY s.session_date DESC, s.start_time DESC';

    const sessions = await query(sql, params);

    // Get weekly stats
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weeklyActual = await getOne(
      'SELECT SUM(actual_minutes) as total_min FROM study_sessions WHERE user_id = ? AND session_date >= ?',
      [req.user.id, sevenDaysAgo]
    );

    const weeklyHours = ((weeklyActual && weeklyActual.total_min) || 0) / 60;

    // Get user study goal
    let goal = await getOne('SELECT * FROM study_goals WHERE user_id = ?', [req.user.id]);
    if (!goal) {
      await run('INSERT INTO study_goals (user_id, target_hours_per_week) VALUES (?, 15.0)', [req.user.id]);
      goal = { target_hours_per_week: 15.0 };
    }

    return res.json({
      success: true,
      sessions,
      weeklyStats: {
        totalMinutes: (weeklyActual && weeklyActual.total_min) || 0,
        totalHours: Number(weeklyHours.toFixed(1)),
        targetHours: goal.target_hours_per_week,
        progressPercent: Math.min(100, Math.round((weeklyHours / goal.target_hours_per_week) * 100))
      }
    });
  } catch (err) {
    console.error('Get study sessions error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve study sessions.' });
  }
}

export async function createStudySession(req, res) {
  try {
    const { course_id, topic, session_date, start_time, duration_minutes, actual_minutes, is_completed, notes } = req.body;

    if (!topic || !session_date) {
      return res.status(400).json({ success: false, message: 'Topic and session date are required.' });
    }

    const result = await run(
      `INSERT INTO study_sessions 
        (user_id, course_id, topic, session_date, start_time, duration_minutes, actual_minutes, is_completed, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        course_id ? Number(course_id) : null,
        topic.trim(),
        session_date,
        start_time || '10:00',
        Number(duration_minutes) || 45,
        Number(actual_minutes) || 0,
        is_completed ? 1 : 0,
        (notes || '').trim()
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Study session recorded.',
      id: result.lastInsertId
    });
  } catch (err) {
    console.error('Create study session error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save study session.' });
  }
}

export async function updateStudySession(req, res) {
  try {
    const { id } = req.params;
    const { course_id, topic, session_date, start_time, duration_minutes, actual_minutes, is_completed, notes } = req.body;

    const existing = await getOne('SELECT id FROM study_sessions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Study session not found.' });
    }

    await run(
      `UPDATE study_sessions 
       SET course_id = ?, topic = ?, session_date = ?, start_time = ?, duration_minutes = ?, actual_minutes = ?, is_completed = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [
        course_id ? Number(course_id) : null,
        topic.trim(),
        session_date,
        start_time,
        Number(duration_minutes) || 45,
        Number(actual_minutes) || 0,
        is_completed ? 1 : 0,
        (notes || '').trim(),
        id,
        req.user.id
      ]
    );

    return res.json({ success: true, message: 'Study session updated.' });
  } catch (err) {
    console.error('Update study session error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update study session.' });
  }
}

export async function deleteStudySession(req, res) {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT id FROM study_sessions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Study session not found.' });
    }

    await run('DELETE FROM study_sessions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Study session deleted.' });
  } catch (err) {
    console.error('Delete study session error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete study session.' });
  }
}

export async function updateStudyGoal(req, res) {
  try {
    const { target_hours_per_week } = req.body;
    if (!target_hours_per_week || Number(target_hours_per_week) <= 0) {
      return res.status(400).json({ success: false, message: 'Target hours must be greater than zero.' });
    }

    await run(
      `UPDATE study_goals 
       SET target_hours_per_week = ?
       WHERE user_id = ?`,
      [Number(target_hours_per_week), req.user.id]
    );

    return res.json({ success: true, message: 'Weekly study goal updated.' });
  } catch (err) {
    console.error('Update study goal error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update study goal.' });
  }
}
