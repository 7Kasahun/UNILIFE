import { query, getOne, run } from '../db/db.js';

export async function getNotifications(req, res) {
  try {
    // Dynamic generation of deadline reminders if not already created
    const now = new Date();
    const inTwoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    // Check assignments due soon
    const dueAssignments = await query(
      `SELECT id, title, due_date FROM assignments 
       WHERE user_id = ? AND status != 'Completed' AND due_date >= ? AND due_date <= ?`,
      [req.user.id, nowIso, inTwoDays]
    );

    for (const a of dueAssignments) {
      const existingNotif = await getOne(
        `SELECT id FROM notifications WHERE user_id = ? AND type = 'assignment' AND link = '/student/assignments' AND title LIKE ?`,
        [req.user.id, `%${a.title}%`]
      );
      if (!existingNotif) {
        await run(
          `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'assignment', '/student/assignments')`,
          [
            req.user.id,
            `Deadline Alert: ${a.title}`,
            `This assignment is due within 48 hours (due ${a.due_date.replace('T', ' ')}). Don't forget to submit!`
          ]
        );
      }
    }

    const notifications = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    await run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Mark notification read error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
}

export async function markAllAsRead(req, res) {
  try {
    await run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all notifications read error:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
}

export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    await run('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    console.error('Delete notification error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete notification.' });
  }
}
