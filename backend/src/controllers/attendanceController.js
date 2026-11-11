import { query, getOne, run } from '../db/db.js';

export async function getAttendance(req, res) {
  try {
    const { course_id } = req.query;
    let sql = `
      SELECT a.*, c.course_name, c.course_code, c.color
      FROM attendance_records a
      JOIN courses c ON a.course_id = c.id
      WHERE a.user_id = ?
    `;
    const params = [req.user.id];

    if (course_id) {
      sql += ' AND a.course_id = ?';
      params.push(course_id);
    }

    sql += ' ORDER BY a.class_date DESC, a.created_at DESC';

    const records = await query(sql, params);

    // Compute stats
    const totalRecorded = records.length;
    const attended = records.filter(r => r.status === 'Attended').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const excused = records.filter(r => r.status === 'Excused').length;
    const attendancePercentage = totalRecorded > 0 ? ((attended / totalRecorded) * 100).toFixed(1) : '100.0';

    // Group stats by course
    const courseStatsMap = {};
    for (const r of records) {
      if (!courseStatsMap[r.course_id]) {
        courseStatsMap[r.course_id] = {
          course_id: r.course_id,
          course_name: r.course_name,
          course_code: r.course_code,
          color: r.color,
          total: 0,
          attended: 0,
          absent: 0,
          excused: 0
        };
      }
      const st = courseStatsMap[r.course_id];
      st.total += 1;
      if (r.status === 'Attended') st.attended += 1;
      if (r.status === 'Absent') st.absent += 1;
      if (r.status === 'Excused') st.excused += 1;
    }

    const byCourse = Object.values(courseStatsMap).map(c => ({
      ...c,
      percentage: c.total > 0 ? ((c.attended / c.total) * 100).toFixed(1) : '100.0'
    }));

    return res.json({
      success: true,
      records,
      overall: {
        totalRecorded,
        attended,
        absent,
        excused,
        attendancePercentage,
        disclaimer: 'Personal tracker for self-discipline only. Not an official university attendance record.'
      },
      byCourse
    });
  } catch (err) {
    console.error('Get attendance error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve attendance records.' });
  }
}

export async function recordAttendance(req, res) {
  try {
    const { course_id, class_date, status, notes } = req.body;

    if (!course_id || !class_date || !status) {
      return res.status(400).json({ success: false, message: 'Course, date, and attendance status are required.' });
    }

    const course = await getOne('SELECT id FROM courses WHERE id = ? AND user_id = ?', [course_id, req.user.id]);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Selected course not found.' });
    }

    const result = await run(
      `INSERT INTO attendance_records (user_id, course_id, class_date, status, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, course_id, class_date, status, (notes || '').trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Attendance recorded.',
      id: result.lastInsertId
    });
  } catch (err) {
    console.error('Record attendance error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record attendance.' });
  }
}

export async function updateAttendance(req, res) {
  try {
    const { id } = req.params;
    const { course_id, class_date, status, notes } = req.body;

    const existing = await getOne('SELECT id FROM attendance_records WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }

    await run(
      `UPDATE attendance_records 
       SET course_id = ?, class_date = ?, status = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [course_id, class_date, status, (notes || '').trim(), id, req.user.id]
    );

    return res.json({ success: true, message: 'Attendance record updated.' });
  } catch (err) {
    console.error('Update attendance error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update attendance record.' });
  }
}

export async function deleteAttendance(req, res) {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT id FROM attendance_records WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }

    await run('DELETE FROM attendance_records WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Attendance record removed.' });
  } catch (err) {
    console.error('Delete attendance error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete attendance record.' });
  }
}
