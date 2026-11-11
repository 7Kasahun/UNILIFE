import jwt from 'jsonwebtoken';
import { getOne, query } from '../db/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'unilife_super_secure_jwt_secret_ethiopia_2026_academic';

export async function authenticateStudent(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session. Please sign in again.' });
    }

    if (decoded.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot access student portals.' });
    }

    const user = await getOne('SELECT id, full_name, email, username, university, department, degree_program, current_year, is_suspended FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact platform administration.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ success: false, message: 'Internal authentication error.' });
  }
}

export async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Admin authorization required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Admin session expired or invalid. Please sign in again.' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    }

    const admin = await getOne(
      `SELECT a.id, a.full_name, a.email, a.username, a.is_active, r.name as role_name, a.role_id 
       FROM admin_users a 
       JOIN admin_roles r ON a.role_id = r.id 
       WHERE a.id = ?`,
      [decoded.id]
    );

    if (!admin || !admin.is_active) {
      return res.status(403).json({ success: false, message: 'Admin account is disabled or does not exist.' });
    }

    // Fetch permissions
    const perms = await query('SELECT permission_key FROM admin_permissions WHERE role_id = ?', [admin.role_id]);
    admin.permissions = perms.map(p => p.permission_key);

    req.admin = admin;
    next();
  } catch (err) {
    console.error('Admin auth middleware error:', err);
    return res.status(500).json({ success: false, message: 'Internal admin authorization error.' });
  }
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Admin authentication required.' });
    }

    if (req.admin.role_name === 'Super Admin' || req.admin.permissions.includes('all') || req.admin.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({ success: false, message: `Access forbidden: Missing permission '${permission}'` });
  };
}
