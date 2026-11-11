import bcrypt from 'bcryptjs';
import { initDatabase, query, run } from '../db/db.js';
import readline from 'readline';

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function setupAdmin() {
  await initDatabase();

  console.log('\n======================================================');
  console.log('🛡️  UNILIFE ETHIOPIA: SECURE SUPER ADMIN SETUP');
  console.log('======================================================\n');

  // Parse command line flags if provided: --email, --username, --password, --name
  const args = process.argv.slice(2);
  let email = '';
  let username = '';
  let password = '';
  let fullName = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i+1]) email = args[i+1];
    if (args[i] === '--username' && args[i+1]) username = args[i+1];
    if (args[i] === '--password' && args[i+1]) password = args[i+1];
    if (args[i] === '--name' && args[i+1]) fullName = args[i+1];
  }

  // If not provided in args, prompt interactively
  if (!fullName) {
    fullName = await prompt('Enter Super Admin Full Name (Default: Super Administrator): ') || 'Super Administrator';
  }
  if (!username) {
    username = await prompt('Enter Admin Username (Default: superadmin): ') || 'superadmin';
  }
  if (!email) {
    email = await prompt('Enter Admin Email (Default: admin@unilife.et): ') || 'admin@unilife.et';
  }
  if (!password) {
    password = await prompt('Enter Admin Password (min 8 chars): ');
  }

  if (!password || password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long.');
    process.exit(1);
  }

  // Check if role exists
  let role = await query('SELECT id FROM admin_roles WHERE name = ?', ['Super Admin']);
  let roleId;
  if (role.length === 0) {
    const roleRes = await run('INSERT INTO admin_roles (name, description) VALUES (?, ?)', [
      'Super Admin',
      'System Super Administrator with all permissions'
    ]);
    roleId = roleRes.lastInsertId;
  } else {
    roleId = role[0].id;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Check if admin already exists
  const existing = await query('SELECT id FROM admin_users WHERE username = ? OR email = ?', [username, email]);
  if (existing.length > 0) {
    console.log(`⚠️  Admin user already exists (ID: ${existing[0].id}). Updating credentials...`);
    await run(
      'UPDATE admin_users SET full_name = ?, password_hash = ?, is_active = 1 WHERE id = ?',
      [fullName, passwordHash, existing[0].id]
    );
    console.log('✅ Super Admin credentials updated successfully.');
  } else {
    const adminRes = await run(
      'INSERT INTO admin_users (full_name, email, username, password_hash, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [fullName, email, username, passwordHash, roleId]
    );
    console.log(`✅ Super Admin created successfully (ID: ${adminRes.lastInsertId}).`);
  }

  console.log('\n------------------------------------------------------');
  console.log('Admin Email:   ', email);
  console.log('Admin Username:', username);
  console.log('Admin Role:    Super Admin');
  console.log('Login URL:     /admin/login');
  console.log('------------------------------------------------------\n');
}

if (process.argv[1] && process.argv[1].endsWith('setup-admin.js')) {
  setupAdmin().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
