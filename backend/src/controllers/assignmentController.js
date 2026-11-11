import { query, getOne, run } from '../db/db.js';

export async function getAssignments(req, res) {
  try {
    const { status, filter, course_id, priority } = req.query;
    let sql = `
      SELECT a.*, c.course_name, c.course_code, c.color
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.user_id = ?
    `;
    const params = [req.user.id];

    if (course_id) {
      sql += ' AND a.course_id = ?';
      params.push(course_id);
    }

    if (priority) {
      sql += ' AND a.priority = ?';
      params.push(priority);
    }

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    const nowIso = new Date().toISOString();

    if (filter === 'upcoming') {
      sql += " AND a.status != 'Completed' AND a.due_date >= ?";
      params.push(nowIso);
    } else if (filter === 'overdue') {
      sql += " AND a.status != 'Completed' AND a.due_date < ?";
      params.push(nowIso);
    } else if (filter === 'completed') {
      sql += " AND a.status = 'Completed'";
    }

    sql += ' ORDER BY a.status = "Completed" ASC, a.due_date ASC';

    const assignments = await query(sql, params);

    // Compute remaining days and overdue status
    const now = new Date();
    const enriched = assignments.map(item => {
      const dueDate = new Date(item.due_date);
      const diffMs = dueDate - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isOverdue = diffMs < 0 && item.status !== 'Completed';

      return {
        ...item,
        is_overdue: isOverdue,
        days_remaining: diffDays
      };
    });

    return res.json({ success: true, assignments: enriched });
  } catch (err) {
    console.error('Get assignments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve assignments.' });
  }
}

export async function createAssignment(req, res) {
  try {
    const { course_id, title, description, assigned_date, due_date, priority } = req.body;

    if (!course_id || !title || !due_date) {
      return res.status(400).json({ success: false, message: 'Course, title, and due date are required.' });
    }

    const course = await getOne('SELECT id FROM courses WHERE id = ? AND user_id = ?', [course_id, req.user.id]);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Selected course not found.' });
    }

    const result = await run(
      `INSERT INTO assignments (user_id, course_id, title, description, assigned_date, due_date, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Not started')`,
      [
        req.user.id,
        course_id,
        title.trim(),
        (description || '').trim(),
        assigned_date || new Date().toISOString().split('T')[0],
        due_date,
        priority || 'Medium'
      ]
    );

    // Create notification reminder for assignment
    await run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, "assignment", "/student/assignments")',
      [
        req.user.id,
        `New Assignment: ${title.trim()}`,
        `Due date scheduled for ${due_date.split('T')[0]}. Track your progress on the assignments page.`,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully.',
      id: result.lastInsertId
    });
  } catch (err) {
    console.error('Create assignment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create assignment.' });
  }
}

export async function updateAssignment(req, res) {
  try {
    const { id } = req.params;
    const { course_id, title, description, assigned_date, due_date, priority, status } = req.body;

    const existing = await getOne('SELECT id, status FROM assignments WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    let completedAt = null;
    if (status === 'Completed') {
      completedAt = new Date().toISOString();
    }

    await run(
      `UPDATE assignments 
       SET course_id = ?, title = ?, description = ?, assigned_date = ?, due_date = ?, priority = ?, status = ?, completed_at = COALESCE(?, completed_at)
       WHERE id = ? AND user_id = ?`,
      [
        course_id,
        title.trim(),
        (description || '').trim(),
        assigned_date,
        due_date,
        priority || 'Medium',
        status || 'Not started',
        completedAt,
        id,
        req.user.id
      ]
    );

    return res.json({ success: true, message: 'Assignment updated successfully.' });
  } catch (err) {
    console.error('Update assignment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update assignment.' });
  }
}

export async function toggleAssignmentStatus(req, res) {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT id, status FROM assignments WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    const newStatus = existing.status === 'Completed' ? 'In progress' : 'Completed';
    const completedAt = newStatus === 'Completed' ? new Date().toISOString() : null;

    await run(
      'UPDATE assignments SET status = ?, completed_at = ? WHERE id = ? AND user_id = ?',
      [newStatus, completedAt, id, req.user.id]
    );

    return res.json({
      success: true,
      message: newStatus === 'Completed' ? 'Assignment marked as completed! 🎉' : 'Assignment marked in progress.',
      status: newStatus
    });
  } catch (err) {
    console.error('Toggle assignment status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to toggle assignment status.' });
  }
}

export async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT id FROM assignments WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    await run('DELETE FROM assignments WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Assignment deleted successfully.' });
  } catch (err) {
    console.error('Delete assignment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete assignment.' });
  }
}
