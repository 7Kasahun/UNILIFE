import assert from 'assert';
import app from '../src/server.js';
import { runMigrations } from '../src/db/migrate.js';
import { seedDatabase } from '../src/db/seed.js';

let server;
const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}/api`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('🧪 Starting UniLife Ethiopia Backend Automated Test Suite...\n');

  await runMigrations();
  await seedDatabase();

  server = app.listen(PORT);
  console.log(`Test server running on port ${PORT}`);

  try {
    // 1. Health check test
    console.log('Test 1: Health check');
    const health = await request('/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.data.status, 'ok');
    console.log('  Passed: Health check OK');

    // 2. Student Registration
    console.log('Test 2: Student Registration');
    const uniqueEmail = `test_student_${Date.now()}@aau.edu.et`;
    const uniqueUsername = `testuser_${Date.now()}`;
    const regPayload = {
      full_name: 'Abebe Kebede',
      email: uniqueEmail,
      username: uniqueUsername,
      password: 'Password123!',
      confirm_password: 'Password123!',
      university: 'Addis Ababa University',
      department: 'Software Engineering',
      degree_program: 'B.Sc. Software Engineering',
      current_year: 3,
      accept_terms: true
    };

    const regRes = await request('/auth/register', { method: 'POST', body: regPayload });
    assert.strictEqual(regRes.status, 201);
    assert.ok(regRes.data.token, 'Expected JWT token in registration response');
    const studentToken = regRes.data.token;
    console.log('  Passed: Student registration successful');

    // 3. Duplicate Registration Prevention
    console.log('Test 3: Duplicate Registration Prevention');
    const dupRes = await request('/auth/register', { method: 'POST', body: regPayload });
    assert.strictEqual(dupRes.status, 409);
    console.log('  Passed: Duplicate registration rejected');

    // 4. Student Login
    console.log('Test 4: Student Login');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: { login_identifier: uniqueUsername, password: 'Password123!' }
    });
    assert.strictEqual(loginRes.status, 200);
    assert.ok(loginRes.data.token);
    console.log('  Passed: Student login successful');

    // 5. Course Management CRUD
    console.log('Test 5: Course Creation & Retrieval');
    const coursePayload = {
      course_code: 'SE4101',
      course_name: 'Software Architecture & Design',
      credit_hours: 4.0,
      instructor: 'Dr. Yonas',
      department: 'Software Engineering',
      semester: 'Semester I',
      academic_year: '2026/2027',
      color: '#2563EB'
    };
    const courseRes = await request('/student/courses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: coursePayload
    });
    assert.strictEqual(courseRes.status, 201);
    const courseId = courseRes.data.courseId;

    const getCoursesRes = await request('/student/courses', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(getCoursesRes.status, 200);
    assert.ok(getCoursesRes.data.courses.length >= 1);
    console.log('  Passed: Course created and retrieved');

    // 6. Timetable & Conflict Detection
    console.log('Test 6: Timetable Entry & Conflict Warning');
    const tEntry1 = {
      course_id: courseId,
      day_of_week: 'Monday',
      start_time: '08:30',
      end_time: '10:30',
      classroom: 'ICT Lab 3'
    };
    const tRes1 = await request('/student/timetable', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: tEntry1
    });
    assert.strictEqual(tRes1.status, 201);

    // Conflicting entry
    const tEntryConflict = {
      course_id: courseId,
      day_of_week: 'Monday',
      start_time: '09:00',
      end_time: '11:00',
      classroom: 'ICT Lab 4'
    };
    const tResConflict = await request('/student/timetable', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: tEntryConflict
    });
    assert.strictEqual(tResConflict.status, 201);
    assert.ok(tResConflict.data.warning, 'Expected conflict warning in response');
    console.log('  Passed: Conflict warning correctly surfaced');

    // 7. Assignment Creation & Toggle
    console.log('Test 7: Assignment Creation & Status Toggle');
    const assignPayload = {
      course_id: courseId,
      title: 'Architectural Styles Case Study',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'High'
    };
    const assignRes = await request('/student/assignments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: assignPayload
    });
    assert.strictEqual(assignRes.status, 201);
    const assignId = assignRes.data.id;

    const toggleRes = await request(`/student/assignments/${assignId}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(toggleRes.status, 200);
    assert.strictEqual(toggleRes.data.status, 'Completed');
    console.log('  Passed: Assignment status toggled to Completed');

    // 8. GPA & CGPA Calculation
    console.log('Test 8: GPA & CGPA Calculation');
    await request('/student/gpa/results', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        semester_name: 'Semester I',
        course_code: 'SE4101',
        course_name: 'Software Architecture',
        credit_hours: 4.0,
        grade_letter: 'A'
      }
    });

    await request('/student/gpa/results', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        semester_name: 'Semester I',
        course_code: 'CS4202',
        course_name: 'Database Systems',
        credit_hours: 3.0,
        grade_letter: 'B+'
      }
    });

    const gpaSummaryRes = await request('/student/gpa/summary', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(gpaSummaryRes.status, 200);
    // (4 * 4.0 + 3 * 3.5) / 7 = (16 + 10.5) / 7 = 26.5 / 7 = 3.79
    const gpa = Number(gpaSummaryRes.data.summary.cumulative.cgpa);
    assert.ok(gpa >= 3.75 && gpa <= 3.82, `Expected GPA ~3.79, got ${gpa}`);
    console.log(`  Passed: Transparent GPA computed (${gpa.toFixed(2)})`);

    // 9. Voluntary Donation Submission & Admin Verification
    console.log('Test 9: Voluntary Donation & Admin Workflow');
    const donPayload = {
      donor_name: 'Alumnus Bethlehem',
      donor_email: 'beth@example.com',
      amount: 200,
      payment_method: 'Telebirr',
      transaction_reference: `TLB_${Date.now()}`,
      notes: 'Happy to support free education tools in Ethiopia!'
    };
    const donRes = await request('/donations', { method: 'POST', body: donPayload });
    assert.strictEqual(donRes.status, 201);
    const donationId = donRes.data.donationId;

    // Admin login
    const adminLoginRes = await request('/admin/auth/login', {
      method: 'POST',
      body: { login_identifier: 'admin', password: 'Admin@UniLife2026' }
    });
    assert.strictEqual(adminLoginRes.status, 200);
    const adminToken = adminLoginRes.data.token;

    // Admin verify donation
    const verifyRes = await request(`/admin/donations/${donationId}/verify`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(verifyRes.status, 200);

    // Check public donation stats reflect verified amount
    const statsRes = await request('/public/donation-stats');
    assert.strictEqual(statsRes.status, 200);
    assert.ok(statsRes.data.stats.totalVerifiedAmount >= 200);
    console.log('  Passed: Donation submitted, verified by admin, and updated in public totals');

    // 10. Admin Analytics Endpoint
    console.log('Test 10: Admin Real Analytics');
    const analyticsRes = await request('/admin/analytics', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(analyticsRes.status, 200);
    assert.ok(analyticsRes.data.summary.totalStudents >= 1);
    assert.ok(analyticsRes.data.summary.totalCourses >= 1);
    console.log('  Passed: Admin analytics returned live database metrics');

    console.log('\n======================================================');
    console.log('🎉 ALL 10 BACKEND SUITE TESTS PASSED WITH 100% SUCCESS!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close(() => {
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }
}

runTests();
