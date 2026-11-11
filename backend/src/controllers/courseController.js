import { query, getOne, run } from '../db/db.js';

export async function getCourses(req, res) {
  try {
    const { search, semester } = req.query;
    let sql = `
      SELECT c.*, s.name as semester_name,
        (SELECT COUNT(*) FROM assignments a WHERE a.course_id = c.id) as assignment_count,
        (SELECT COUNT(*) FROM examinations e WHERE e.course_id = c.id) as exam_count
      FROM courses c
      LEFT JOIN semesters s ON c.semester_id = s.id
      WHERE c.user_id = ?
    `;
    const params = [req.user.id];

    if (search) {
      sql += ' AND (c.course_name LIKE ? OR c.course_code LIKE ? OR c.instructor LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    if (semester) {
      sql += ' AND (c.semester = ? OR s.name = ?)';
      params.push(semester, semester);
    }

    sql += ' ORDER BY c.created_at DESC';

    const courses = await query(sql, params);
    return res.json({ success: true, courses });
  } catch (err) {
    console.error('Get courses error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve courses.' });
  }
}

export async function getCourseDetail(req, res) {
  try {
    const { id } = req.params;
    const course = await getOne(
      `SELECT c.*, s.name as semester_name 
       FROM courses c 
       LEFT JOIN semesters s ON c.semester_id = s.id 
       WHERE c.id = ? AND c.user_id = ?`,
      [id, req.user.id]
    );

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Related items
    const assignments = await query(
      'SELECT * FROM assignments WHERE course_id = ? AND user_id = ? ORDER BY due_date ASC',
      [id, req.user.id]
    );

    const examinations = await query(
      'SELECT * FROM examinations WHERE course_id = ? AND user_id = ? ORDER BY exam_date ASC',
      [id, req.user.id]
    );

    const notes = await query(
      'SELECT id, title, tags, is_pinned, updated_at FROM notes WHERE course_id = ? AND user_id = ? ORDER BY is_pinned DESC, updated_at DESC',
      [id, req.user.id]
    );

    const studySessions = await query(
      'SELECT * FROM study_sessions WHERE course_id = ? AND user_id = ? ORDER BY session_date DESC LIMIT 10',
      [id, req.user.id]
    );

    const attendance = await query(
      'SELECT * FROM attendance_records WHERE course_id = ? AND user_id = ? ORDER BY class_date DESC',
      [id, req.user.id]
    );

    // Compute attendance percentage
    const totalClasses = attendance.length;
    const attendedClasses = attendance.filter(a => a.status === 'Attended').length;
    const missedClasses = attendance.filter(a => a.status === 'Absent').length;
    const excusedClasses = attendance.filter(a => a.status === 'Excused').length;
    const attendancePercentage = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : '100.0';

    return res.json({
      success: true,
      course,
      assignments,
      examinations,
      notes,
      studySessions,
      attendance: {
        records: attendance,
        stats: {
          totalClasses,
          attendedClasses,
          missedClasses,
          excusedClasses,
          attendancePercentage
        }
      }
    });
  } catch (err) {
    console.error('Get course detail error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving course details.' });
  }
}

export async function createCourse(req, res) {
  try {
    const {
      course_code,
      course_name,
      credit_hours,
      instructor,
      department,
      semester,
      semester_id,
      academic_year,
      description,
      color
    } = req.body;

    if (!course_code || !course_name) {
      return res.status(400).json({ success: false, message: 'Course code and name are required.' });
    }

    const result = await run(
      `INSERT INTO courses 
        (user_id, semester_id, course_code, course_name, credit_hours, instructor, department, semester, academic_year, description, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        semester_id ? Number(semester_id) : null,
        course_code.trim().toUpperCase(),
        course_name.trim(),
        Number(credit_hours) || 3.0,
        (instructor || '').trim(),
        (department || req.user.department || '').trim(),
        (semester || '').trim(),
        (academic_year || '2026/2027').trim(),
        (description || '').trim(),
        color || '#2563EB'
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Course added successfully.',
      courseId: result.lastInsertId
    });
  } catch (err) {
    console.error('Create course error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create course.' });
  }
}

export async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const {
      course_code,
      course_name,
      credit_hours,
      instructor,
      department,
      semester,
      semester_id,
      academic_year,
      description,
      color
    } = req.body;

    const existing = await getOne('SELECT id FROM courses WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    await run(
      `UPDATE courses 
       SET course_code = ?, course_name = ?, credit_hours = ?, instructor = ?, department = ?, semester = ?, semester_id = ?, academic_year = ?, description = ?, color = ?
       WHERE id = ? AND user_id = ?`,
      [
        course_code.trim().toUpperCase(),
        course_name.trim(),
        Number(credit_hours) || 3.0,
        (instructor || '').trim(),
        (department || '').trim(),
        (semester || '').trim(),
        semester_id ? Number(semester_id) : null,
        (academic_year || '').trim(),
        (description || '').trim(),
        color || '#2563EB',
        id,
        req.user.id
      ]
    );

    return res.json({ success: true, message: 'Course updated successfully.' });
  } catch (err) {
    console.error('Update course error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update course.' });
  }
}

export async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT id FROM courses WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    await run('DELETE FROM courses WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Course deleted successfully.' });
  } catch (err) {
    console.error('Delete course error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete course.' });
  }
}
