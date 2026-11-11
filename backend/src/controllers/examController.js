import { query, getOne, run } from '../db/db.js';

export async function getExaminations(req, res) {
  try {
    const { course_id, type } = req.query;
    let sql = `
      SELECT e.*, c.course_name, c.course_code, c.color
      FROM examinations e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ?
    `;
    const params = [req.user.id];

    if (course_id) {
      sql += ' AND e.course_id = ?';
      params.push(course_id);
    }

    if (type) {
      sql += ' AND e.exam_type = ?';
      params.push(type);
    }

    sql += ' ORDER BY e.exam_date ASC, e.exam_time ASC';

    const exams = await query(sql, params);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const enriched = exams.map(exam => {
      const examDate = new Date(`${exam.exam_date}T${exam.exam_time || '09:00:00'}`);
      const diffMs = examDate - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isPast = exam.exam_date < todayStr;

      return {
        ...exam,
        is_past: isPast,
        days_remaining: diffDays
      };
    });

    return res.json({ success: true, examinations: enriched });
  } catch (err) {
    console.error('Get examinations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve examinations.' });
  }
}

export async function createExamination(req, res) {
  try {
    const { course_id, title, exam_type, exam_date, exam_time, location, prep_status, notes } = req.body;

    if (!course_id || !title || !exam_date) {
      return res.status(400).json({ success: false, message: 'Course, title, and examination date are required.' });
    }

    const course = await getOne('SELECT id FROM courses WHERE id = ? AND user_id = ?', [course_id, req.user.id]);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Selected course not found.' });
    }

    const result = await run(
      `INSERT INTO examinations (user_id, course_id, title, exam_type, exam_date, exam_time, location, prep_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        course_id,
        title.trim(),
        exam_type || 'Midterm',
        exam_date,
        exam_time || '09:00',
        (location || '').trim(),
        prep_status || 'Not started',
        (notes || '').trim()
      ]
    );

    // Add notification
    await run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, "exam", "/student/exams")',
      [
        req.user.id,
        `Upcoming Exam: ${title.trim()} (${exam_type || 'Exam'})`,
        `Scheduled on ${exam_date} at ${exam_time || '09:00'}. Location: ${location || 'TBA'}.`
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Examination scheduled successfully.',
      id: result.lastInsertId
    });
  } catch (err) {
    console.error('Create examination error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create examination.' });
  }
}

export async function updateExamination(req, res) {
  try {
    const { id } = req.params;
    const { course_id, title, exam_type, exam_date, exam_time, location, prep_status, notes } = req.body;

    const existing = await getOne('SELECT id FROM examinations WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Examination not found.' });
    }

    await run(
      `UPDATE examinations 
       SET course_id = ?, title = ?, exam_type = ?, exam_date = ?, exam_time = ?, location = ?, prep_status = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [
        course_id,
        title.trim(),
        exam_type || 'Midterm',
        exam_date,
        exam_time || '09:00',
        (location || '').trim(),
        prep_status || 'Not started',
        (notes || '').trim(),
        id,
        req.user.id
      ]
    );

    return res.json({ success: true, message: 'Examination updated successfully.' });
  } catch (err) {
    console.error('Update examination error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update examination.' });
  }
}

export async function deleteExamination(req, res) {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT id FROM examinations WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Examination not found.' });
    }

    await run('DELETE FROM examinations WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Examination deleted successfully.' });
  } catch (err) {
    console.error('Delete examination error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete examination.' });
  }
}
