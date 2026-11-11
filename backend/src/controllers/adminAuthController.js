import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getOne, query, run } from '../db/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'unilife_super_secure_jwt_secret_ethiopia_2026_academic';
const JWT_EXPIRES_IN = '1d';

export async function adminLogin(req, res) {
  try {
    const { login_identifier, password } = req.body;

    if (!login_identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please enter admin username/email and password.' });
    }

    const clean = login_identifier.trim().toLowerCase();
    const admin = await getOne(
      `SELECT a.id, a.full_name, a.email, a.username, a.password_hash, a.is_active, a.role_id, r.name as role_name
       FROM admin_users a
       JOIN admin_roles r ON a.role_id = r.id
       WHERE LOWER(a.email) = ? OR LOWER(a.username) = ?`,
      [clean, clean]
    );

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    if (!admin.is_active) {
      return res.status(403).json({ success: false, message: 'This administrator account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    // Update last login
    await run('UPDATE admin_users SET last_login_at = ? WHERE id = ?', [new Date().toISOString(), admin.id]);

    // Log admin action
    await run(
      'INSERT INTO admin_activity_logs (admin_id, action, details, ip_address) VALUES (?, "admin_login", "Administrator logged in", ?)',
      [admin.id, req.ip || '127.0.0.1']
    );

    // Fetch permissions
    const perms = await query('SELECT permission_key FROM admin_permissions WHERE role_id = ?', [admin.role_id]);
    const permissions = perms.map(p => p.permission_key);

    const token = jwt.sign(
      { id: admin.id, email: admin.email, username: admin.username, role: 'admin', role_name: admin.role_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email,
        username: admin.username,
        role: admin.role_name,
        permissions
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during admin authentication.' });
  }
}

export async function getAdminMe(req, res) {
  return res.json({
    success: true,
    admin: {
      id: req.admin.id,
      full_name: req.admin.full_name,
      email: req.admin.email,
      username: req.admin.username,
      role: req.admin.role_name,
      permissions: req.admin.permissions
    }
  });
}

export async function createAdminUser(req, res) {
  try {
    const { full_name, email, username, password, role_id } = req.body;

    if (!full_name || !email || !username || !password || !role_id) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Admin password must be at least 8 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    const existing = await getOne(
      'SELECT id FROM admin_users WHERE LOWER(email) = ? OR LOWER(username) = ?',
      [cleanEmail, cleanUsername]
    );

    if (existing) {
      return res.status(409).json({ success: false, message: 'An admin with this email or username already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO admin_users (full_name, email, username, password_hash, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [full_name.trim(), cleanEmail, cleanUsername, hash, Number(role_id)]
    );

    // Log admin action
    await run(
      'INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details) VALUES (?, "create_admin", "admin_users", ?, ?)',
      [req.admin.id, result.lastInsertId, `Created admin account: ${cleanUsername}`]
    );

    return res.status(201).json({
      success: true,
      message: 'New administrator created successfully.'
    });
  } catch (err) {
    console.error('Create admin error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create administrator account.' });
  }
}

export async function getAdminList(req, res) {
  try {
    const admins = await query(
      `SELECT a.id, a.full_name, a.email, a.username, a.is_active, a.last_login_at, a.created_at, r.name as role_name
       FROM admin_users a
       JOIN admin_roles r ON a.role_id = r.id
       ORDER BY a.created_at DESC`
    );

    const roles = await query('SELECT id, name, description FROM admin_roles');

    return res.json({ success: true, admins, roles });
  } catch (err) {
    console.error('Get admin list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin list.' });
  }
}
