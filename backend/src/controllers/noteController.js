import { query, getOne, run } from '../db/db.js';

export async function getNotes(req, res) {
  try {
    const { course_id, search, tag } = req.query;
    let sql = `
      SELECT n.*, c.course_name, c.course_code, c.color
      FROM notes n
      LEFT JOIN courses c ON n.course_id = c.id
      WHERE n.user_id = ?
    `;
    const params = [req.user.id];

    if (course_id) {
      sql += ' AND n.course_id = ?';
      params.push(course_id);
    }

    if (tag) {
      sql += ' AND n.tags LIKE ?';
      params.push(`%${tag.trim()}%`);
    }

    if (search) {
      sql += ' AND (n.title LIKE ? OR n.content LIKE ? OR n.tags LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY n.is_pinned DESC, n.updated_at DESC';

    const notes = await query(sql, params);
    return res.json({ success: true, notes });
  } catch (err) {
    console.error('Get notes error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notes.' });
  }
}

export async function getNoteDetail(req, res) {
  try {
    const { id } = req.params;
    const note = await getOne(
      `SELECT n.*, c.course_name, c.course_code 
       FROM notes n 
       LEFT JOIN courses c ON n.course_id = c.id 
       WHERE n.id = ? AND n.user_id = ?`,
      [id, req.user.id]
    );

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const attachments = await query(
      'SELECT id, file_name, file_size, mime_type, created_at FROM note_attachments WHERE note_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    return res.json({ success: true, note, attachments });
  } catch (err) {
    console.error('Get note detail error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve note details.' });
  }
}

export async function createNote(req, res) {
  try {
    const { course_id, title, content, tags, is_pinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const result = await run(
      `INSERT INTO notes (user_id, course_id, title, content, tags, is_pinned)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        course_id ? Number(course_id) : null,
        title.trim(),
        content,
        (tags || '').trim(),
        is_pinned ? 1 : 0
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Note created successfully.',
      id: result.lastInsertId
    });
  } catch (err) {
    console.error('Create note error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create note.' });
  }
}

export async function updateNote(req, res) {
  try {
    const { id } = req.params;
    const { course_id, title, content, tags, is_pinned } = req.body;

    const existing = await getOne('SELECT id FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    await run(
      `UPDATE notes 
       SET course_id = ?, title = ?, content = ?, tags = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        course_id ? Number(course_id) : null,
        title.trim(),
        content,
        (tags || '').trim(),
        is_pinned ? 1 : 0,
        id,
        req.user.id
      ]
    );

    return res.json({ success: true, message: 'Note updated successfully.' });
  } catch (err) {
    console.error('Update note error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update note.' });
  }
}

export async function togglePinNote(req, res) {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT id, is_pinned FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const newPinned = existing.is_pinned ? 0 : 1;
    await run('UPDATE notes SET is_pinned = ? WHERE id = ? AND user_id = ?', [newPinned, id, req.user.id]);

    return res.json({ success: true, is_pinned: newPinned, message: newPinned ? 'Note pinned to top.' : 'Note unpinned.' });
  } catch (err) {
    console.error('Toggle pin note error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update pin status.' });
  }
}

export async function deleteNote(req, res) {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT id FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    await run('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Note deleted successfully.' });
  } catch (err) {
    console.error('Delete note error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete note.' });
  }
}
