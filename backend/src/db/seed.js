import { initDatabase, query, run } from './db.js';
import { runMigrations } from './migrate.js';

export async function seedDatabase() {
  console.log('🌱 Seeding UniLife initial master data...');
  await runMigrations();

  // 1. Seed Universities (Ethiopian Universities)
  const universities = [
    { name: 'Addis Ababa University', short_name: 'AAU', city: 'Addis Ababa', website: 'http://www.aau.edu.et' },
    { name: 'Bahir Dar University', short_name: 'BDU', city: 'Bahir Dar', website: 'https://www.bdu.edu.et' },
    { name: 'Hawassa University', short_name: 'HU', city: 'Hawassa', website: 'https://www.hu.edu.et' },
    { name: 'Jimma University', short_name: 'JU', city: 'Jimma', website: 'https://www.ju.edu.et' },
    { name: 'Mekelle University', short_name: 'MU', city: 'Mekelle', website: 'https://www.mu.edu.et' },
    { name: 'Arba Minch University', short_name: 'AMU', city: 'Arba Minch', website: 'https://www.amu.edu.et' },
    { name: 'University of Gondar', short_name: 'UoG', city: 'Gondar', website: 'https://www.uog.edu.et' },
    { name: 'Haramaya University', short_name: 'HU-ET', city: 'Haramaya', website: 'https://www.haramaya.edu.et' },
    { name: 'Adama Science and Technology University', short_name: 'ASTU', city: 'Adama', website: 'http://www.astu.edu.et' },
    { name: 'Addis Ababa Science and Technology University', short_name: 'AASTU', city: 'Addis Ababa', website: 'http://www.aastu.edu.et' },
    { name: 'Wollo University', short_name: 'WU', city: 'Dessie', website: 'https://www.wu.edu.et' },
    { name: 'Dilla University', short_name: 'DU', city: 'Dilla', website: 'https://www.du.edu.et' },
    { name: 'Debre Berhan University', short_name: 'DBU', city: 'Debre Berhan', website: 'https://www.dbu.edu.et' },
    { name: 'Debre Markos University', short_name: 'DMU', city: 'Debre Markos', website: 'https://www.dmu.edu.et' },
    { name: 'Wollega University', short_name: 'WU-ET', city: 'Nekemte', website: 'https://www.wollegauniversity.edu.et' }
  ];

  for (const uni of universities) {
    const existing = await query('SELECT id FROM universities WHERE name = ?', [uni.name]);
    if (existing.length === 0) {
      await run(
        'INSERT INTO universities (name, short_name, city, website) VALUES (?, ?, ?, ?)',
        [uni.name, uni.short_name, uni.city, uni.website]
      );
    }
  }

  // 2. Seed Common Departments
  const departments = [
    { name: 'Computer Science', faculty: 'Informatics & Technology' },
    { name: 'Software Engineering', faculty: 'Informatics & Technology' },
    { name: 'Information Technology', faculty: 'Informatics & Technology' },
    { name: 'Electrical & Computer Engineering', faculty: 'Engineering' },
    { name: 'Mechanical Engineering', faculty: 'Engineering' },
    { name: 'Civil Engineering', faculty: 'Engineering' },
    { name: 'Chemical Engineering', faculty: 'Engineering' },
    { name: 'Medicine (MD)', faculty: 'Health Sciences' },
    { name: 'Pharmacy', faculty: 'Health Sciences' },
    { name: 'Public Health & Nursing', faculty: 'Health Sciences' },
    { name: 'Accounting and Finance', faculty: 'Business and Economics' },
    { name: 'Economics', faculty: 'Business and Economics' },
    { name: 'Management', faculty: 'Business and Economics' },
    { name: 'Law (LL.B)', faculty: 'College of Law' },
    { name: 'Architecture and Urban Planning', faculty: 'Engineering' },
    { name: 'Biomedical Science', faculty: 'Natural Sciences' }
  ];

  for (const dept of departments) {
    const existing = await query('SELECT id FROM departments WHERE name = ?', [dept.name]);
    if (existing.length === 0) {
      await run(
        'INSERT INTO departments (name, faculty) VALUES (?, ?)',
        [dept.name, dept.faculty]
      );
    }
  }

  // 3. Seed Default Ethiopian Grading Scale (Ministry of Education Standard)
  const defaultGrades = [
    { letter: 'A+', min: 90, max: 100, point: 4.0 },
    { letter: 'A',  min: 85, max: 89.99, point: 4.0 },
    { letter: 'A-', min: 80, max: 84.99, point: 3.75 },
    { letter: 'B+', min: 75, max: 79.99, point: 3.5 },
    { letter: 'B',  min: 70, max: 74.99, point: 3.0 },
    { letter: 'B-', min: 65, max: 69.99, point: 2.75 },
    { letter: 'C+', min: 60, max: 64.99, point: 2.5 },
    { letter: 'C',  min: 50, max: 59.99, point: 2.0 },
    { letter: 'C-', min: 45, max: 49.99, point: 1.75 },
    { letter: 'D',  min: 40, max: 44.99, point: 1.0 },
    { letter: 'F',  min: 0,  max: 39.99, point: 0.0 }
  ];

  const existingScales = await query('SELECT id FROM grading_scales WHERE user_id IS NULL');
  if (existingScales.length === 0) {
    for (const g of defaultGrades) {
      await run(
        'INSERT INTO grading_scales (user_id, grade_letter, min_score, max_score, grade_point, is_default) VALUES (NULL, ?, ?, ?, ?, 1)',
        [g.letter, g.min, g.max, g.point]
      );
    }
  }

  // 4. Seed Admin Roles
  const roles = [
    { name: 'Super Admin', description: 'Full system privileges, admin user management, role management' },
    { name: 'Admin', description: 'Student management, donation verification, announcements, view analytics' },
    { name: 'Moderator', description: 'Review student issues and announcements' }
  ];

  for (const r of roles) {
    const existing = await query('SELECT id FROM admin_roles WHERE name = ?', [r.name]);
    if (existing.length === 0) {
      const res = await run('INSERT INTO admin_roles (name, description) VALUES (?, ?)', [r.name, r.description]);
      const roleId = res.lastInsertId;
      
      // Seed permissions for role
      const permissions = r.name === 'Super Admin'
        ? ['all', 'users.manage', 'donations.verify', 'announcements.manage', 'analytics.view', 'admins.manage']
        : ['users.manage', 'donations.verify', 'announcements.manage', 'analytics.view'];

      for (const p of permissions) {
        await run('INSERT INTO admin_permissions (role_id, permission_key) VALUES (?, ?)', [roleId, p]);
      }
    }
  }

  // 5. Seed Welcome Announcement
  const existingAnnouncements = await query('SELECT id FROM website_announcements');
  if (existingAnnouncements.length === 0) {
    await run(
      'INSERT INTO website_announcements (title, content, priority, is_active) VALUES (?, ?, ?, 1)',
      [
        'Welcome to UniLife Ethiopia!',
        'UniLife Ethiopia is now officially live. Organize your courses, track deadlines, compute GPA/CGPA, plan study sessions, and master your university journey. All academic tools are 100% free!',
        'info'
      ]
    );
  }

  console.log('✅ Seeding completed successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
