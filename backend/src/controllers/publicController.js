import { query } from '../db/db.js';

export async function getUniversities(req, res) {
  try {
    const universities = await query('SELECT id, name, short_name, city, website FROM universities ORDER BY name ASC');
    return res.json({ success: true, universities });
  } catch (err) {
    console.error('Get universities error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve universities.' });
  }
}

export async function getDepartments(req, res) {
  try {
    const departments = await query('SELECT id, name, faculty FROM departments ORDER BY name ASC');
    return res.json({ success: true, departments });
  } catch (err) {
    console.error('Get departments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve departments.' });
  }
}

export async function getPublicAnnouncements(req, res) {
  try {
    const announcements = await query(
      'SELECT id, title, content, priority, created_at FROM website_announcements WHERE is_active = 1 ORDER BY created_at DESC'
    );
    return res.json({ success: true, announcements });
  } catch (err) {
    console.error('Get public announcements error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve announcements.' });
  }
}
