import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getOne, query, run } from '../db/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'unilife_super_secure_jwt_secret_ethiopia_2026_academic';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function register(req, res) {
  try {
    const {
      full_name,
      email,
      username,
      password,
      confirm_password,
      university,
      department,
      degree_program,
      current_year,
      accept_terms
    } = req.body;

    // 1. Validation
    if (!full_name || !email || !username || !password || !university || !department || !degree_program) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    if (!accept_terms) {
      return res.status(400).json({ success: false, message: 'You must accept the Terms of Service and Privacy Policy.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    // Check unique email
    const existingEmail = await getOne('SELECT id FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Check unique username
    const existingUser = await getOne('SELECT id FROM users WHERE LOWER(username) = ?', [normalizedUsername]);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'This username is already taken. Please choose another.' });
    }

    // 2. Hash Password
    const password_hash = await bcrypt.hash(password, 10);

    // 3. Create User
    const userResult = await run(
      `INSERT INTO users (full_name, email, username, password_hash, university, department, degree_program, current_year)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name.trim(), normalizedEmail, normalizedUsername, password_hash, university.trim(), department.trim(), degree_program.trim(), Number(current_year) || 1]
    );

    const userId = userResult.lastInsertId;

    // 4. Initialize User Settings & Study Goal defaults
    await run('INSERT INTO user_settings (user_id, language, email_notifications, push_notifications, theme) VALUES (?, "en", 1, 1, "light")', [userId]);
    await run('INSERT INTO study_goals (user_id, goal_type, target_hours_per_week) VALUES (?, "weekly_hours", 15.0)', [userId]);

    // 5. Create default semester
    await run('INSERT INTO semesters (user_id, name, academic_year, is_current) VALUES (?, "Semester I", "2026/2027", 1)', [userId]);

    // 6. Log activity event
    await run('INSERT INTO user_activity_events (user_id, event_name, metadata) VALUES (?, "user_registered", ?)', [userId, JSON.stringify({ university, department })]);

    // 7. Welcome notification
    await run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        userId,
        'Welcome to UniLife Ethiopia!',
        'Your academic organizing journey starts here. Add your courses, assignments, and timetable to get started.',
        'general',
        '/student/dashboard'
      ]
    );

    // 8. Generate JWT
    const token = jwt.sign(
      { id: userId, email: normalizedEmail, username: normalizedUsername, role: 'student' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const user = {
      id: userId,
      full_name: full_name.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      university: university.trim(),
      department: department.trim(),
      degree_program: degree_program.trim(),
      current_year: Number(current_year) || 1
    };

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to UniLife Ethiopia.',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
  }
}

export async function login(req, res) {
  try {
    const { login_identifier, password } = req.body;

    if (!login_identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your email or username, and password.' });
    }

    const cleanIdentifier = login_identifier.trim().toLowerCase();

    // Query by email OR username
    const user = await getOne(
      `SELECT id, full_name, email, username, password_hash, university, department, degree_program, current_year, is_suspended 
       FROM users 
       WHERE LOWER(email) = ? OR LOWER(username) = ?`,
      [cleanIdentifier, cleanIdentifier]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email/username and password.' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ success: false, message: 'Your account is suspended. Please contact UniLife support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email/username and password.' });
    }

    // Log login event
    await run('INSERT INTO user_activity_events (user_id, event_name) VALUES (?, "user_logged_in")', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: 'student' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Sanitize user object
    delete user.password_hash;

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during sign in.' });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your account email address.' });
    }

    const user = await getOne('SELECT id, email, full_name FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
    
    // Always respond with success message to prevent user enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with that email address, you will receive password reset instructions.'
      });
    }

    // Generate secure reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await run(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, tokenHash, expiresAt]
    );

    // In production without external SMTP, provide simulated link or console log
    console.log(`🔑 [PASSWORD RESET] Token for ${user.email}: ${rawToken}`);
    
    return res.json({
      success: true,
      message: 'If an account exists with that email address, you will receive password reset instructions.',
      // For local testing convenience
      devResetToken: process.env.NODE_ENV === 'development' ? rawToken : undefined
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Error processing password reset request.' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, new_password, confirm_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetEntry = await getOne(
      'SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ?',
      [tokenHash]
    );

    if (!resetEntry || resetEntry.used_at) {
      return res.status(400).json({ success: false, message: 'Invalid or already used password reset link.' });
    }

    if (new Date(resetEntry.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This password reset link has expired. Please request a new one.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);

    // Update password
    await run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, resetEntry.user_id]);
    // Mark token used
    await run('UPDATE password_reset_tokens SET used_at = ? WHERE id = ?', [new Date().toISOString(), resetEntry.id]);

    return res.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await getOne(
      `SELECT u.id, u.full_name, u.email, u.username, u.university, u.department, u.degree_program, u.current_year, u.created_at,
              s.language, s.theme, s.email_notifications, s.push_notifications
       FROM users u
       LEFT JOIN user_settings s ON u.id = s.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { full_name, university, department, degree_program, current_year } = req.body;

    if (!full_name || !university || !department) {
      return res.status(400).json({ success: false, message: 'Full name, university, and department are required.' });
    }

    await run(
      `UPDATE users 
       SET full_name = ?, university = ?, department = ?, degree_program = ?, current_year = ?
       WHERE id = ?`,
      [full_name.trim(), university.trim(), department.trim(), (degree_program || '').trim(), Number(current_year) || 1, req.user.id]
    );

    return res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

export async function changePassword(req, res) {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const user = await getOne('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, message: 'Error changing password.' });
  }
}

export async function updateSettings(req, res) {
  try {
    const { language, theme, email_notifications, push_notifications } = req.body;

    await run(
      `UPDATE user_settings 
       SET language = COALESCE(?, language),
           theme = COALESCE(?, theme),
           email_notifications = COALESCE(?, email_notifications),
           push_notifications = COALESCE(?, push_notifications)
       WHERE user_id = ?`,
      [language, theme, email_notifications !== undefined ? (email_notifications ? 1 : 0) : null, push_notifications !== undefined ? (push_notifications ? 1 : 0) : null, req.user.id]
    );

    return res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
}

export async function deleteAccount(req, res) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password confirmation is required to delete your account.' });
    }

    const user = await getOne('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect password. Account deletion aborted.' });
    }

    // Cascade delete user
    await run('DELETE FROM users WHERE id = ?', [req.user.id]);

    return res.json({ success: true, message: 'Your account and all associated academic data have been permanently removed.' });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
}
