import { query, getOne, run } from '../db/db.js';

export async function getGradingScale(req, res) {
  try {
    // Check if student has custom grading scale
    let scales = await query(
      'SELECT * FROM grading_scales WHERE user_id = ? ORDER BY grade_point DESC, min_score DESC',
      [req.user.id]
    );

    if (scales.length === 0) {
      // Default standard scale
      scales = await query(
        'SELECT * FROM grading_scales WHERE user_id IS NULL ORDER BY grade_point DESC, min_score DESC'
      );
    }

    return res.json({ success: true, scales });
  } catch (err) {
    console.error('Get grading scale error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve grading scale.' });
  }
}

export async function updateGradingScale(req, res) {
  try {
    const { scales } = req.body;
    if (!Array.isArray(scales) || scales.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid grading scale data.' });
    }

    // Delete existing custom scales for user
    await run('DELETE FROM grading_scales WHERE user_id = ?', [req.user.id]);

    for (const item of scales) {
      await run(
        `INSERT INTO grading_scales (user_id, grade_letter, min_score, max_score, grade_point, is_default)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [
          req.user.id,
          item.grade_letter.trim(),
          Number(item.min_score),
          Number(item.max_score),
          Number(item.grade_point)
        ]
      );
    }

    return res.json({ success: true, message: 'Grading scale preferences saved successfully.' });
  } catch (err) {
    console.error('Update grading scale error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update grading scale.' });
  }
}

export async function getSemesterResults(req, res) {
  try {
    const results = await query(
      `SELECT r.*, s.name as semester_ref_name 
       FROM semester_results r
       LEFT JOIN semesters s ON r.semester_id = s.id
       WHERE r.user_id = ?
       ORDER BY r.semester_name ASC, r.created_at ASC`,
      [req.user.id]
    );

    return res.json({ success: true, results });
  } catch (err) {
    console.error('Get semester results error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve semester results.' });
  }
}

export async function saveSemesterResult(req, res) {
  try {
    const {
      semester_name,
      semester_id,
      course_id,
      course_code,
      course_name,
      credit_hours,
      grade_letter,
      is_retake,
      retake_mode
    } = req.body;

    if (!semester_name || !course_code || !course_name || !credit_hours || !grade_letter) {
      return res.status(400).json({ success: false, message: 'All course and grade details are required.' });
    }

    // Lookup grade point for letter
    let scaleEntry = await getOne(
      'SELECT grade_point FROM grading_scales WHERE user_id = ? AND grade_letter = ?',
      [req.user.id, grade_letter.trim()]
    );

    if (!scaleEntry) {
      scaleEntry = await getOne(
        'SELECT grade_point FROM grading_scales WHERE user_id IS NULL AND grade_letter = ?',
        [grade_letter.trim()]
      );
    }

    const grade_point = scaleEntry ? scaleEntry.grade_point : 0.0;
    const isRetakeFlag = is_retake ? 1 : 0;
    const mode = retake_mode || 'replace';

    const result = await run(
      `INSERT INTO semester_results 
        (user_id, semester_id, semester_name, course_id, course_code, course_name, credit_hours, grade_letter, grade_point, is_retake, retake_mode, include_in_gpa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        req.user.id,
        semester_id ? Number(semester_id) : null,
        semester_name.trim(),
        course_id ? Number(course_id) : null,
        course_code.trim().toUpperCase(),
        course_name.trim(),
        Number(credit_hours),
        grade_letter.trim(),
        grade_point,
        isRetakeFlag,
        mode
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Course result recorded successfully.',
      id: result.lastInsertId,
      grade_point
    });
  } catch (err) {
    console.error('Save semester result error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save course result.' });
  }
}

export async function deleteSemesterResult(req, res) {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT id FROM semester_results WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Result record not found.' });
    }

    await run('DELETE FROM semester_results WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Course result deleted.' });
  } catch (err) {
    console.error('Delete semester result error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete result.' });
  }
}

export async function calculateFullAcademicSummary(req, res) {
  try {
    const allResults = await query(
      `SELECT * FROM semester_results WHERE user_id = ? ORDER BY semester_name ASC, created_at ASC`,
      [req.user.id]
    );

    if (allResults.length === 0) {
      return res.json({
        success: true,
        summary: {
          semesters: [],
          cumulative: {
            cgpa: '0.00',
            totalCreditHours: 0,
            totalGradePoints: 0,
            totalCourses: 0,
            formula: 'CGPA = Total Grade Points / Total Credit Hours'
          }
        }
      });
    }

    // Handle course retakes across semesters or within semesters
    // Course code grouping
    const coursesByCode = {};
    for (const r of allResults) {
      const code = r.course_code.toUpperCase();
      if (!coursesByCode[code]) {
        coursesByCode[code] = [];
      }
      coursesByCode[code].push(r);
    }

    // Determine which attempts are included based on retake policy
    const effectiveIncludedIds = new Set();

    for (const [code, attempts] of Object.entries(coursesByCode)) {
      if (attempts.length === 1) {
        effectiveIncludedIds.add(attempts[0].id);
      } else {
        // Multiple attempts: check latest attempt retake mode
        const latestAttempt = attempts[attempts.length - 1];
        const mode = latestAttempt.retake_mode || 'replace';

        if (mode === 'replace') {
          // Only latest attempt counts
          effectiveIncludedIds.add(latestAttempt.id);
        } else if (mode === 'best') {
          // Highest grade point counts
          let best = attempts[0];
          for (const att of attempts) {
            if (att.grade_point > best.grade_point) {
              best = att;
            }
          }
          effectiveIncludedIds.add(best.id);
        } else if (mode === 'average') {
          // Include all
          attempts.forEach(a => effectiveIncludedIds.add(a.id));
        } else if (mode === 'excluded') {
          // Exclude the retake attempt
          effectiveIncludedIds.add(attempts[0].id);
        }
      }
    }

    // Group by semester
    const semesterMap = {};
    for (const item of allResults) {
      const sem = item.semester_name;
      if (!semesterMap[sem]) {
        semesterMap[sem] = [];
      }
      semesterMap[sem].push({
        ...item,
        is_counted: effectiveIncludedIds.has(item.id)
      });
    }

    let grandTotalCreditHours = 0;
    let grandTotalGradePoints = 0;
    let grandTotalCourses = 0;

    const semesterSummaries = [];

    for (const [semName, items] of Object.entries(semesterMap)) {
      let semCredits = 0;
      let semPoints = 0;

      for (const item of items) {
        if (item.is_counted) {
          const credits = Number(item.credit_hours);
          const points = credits * Number(item.grade_point);
          semCredits += credits;
          semPoints += points;

          grandTotalCreditHours += credits;
          grandTotalGradePoints += points;
          grandTotalCourses += 1;
        }
      }

      const gpa = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '0.00';

      semesterSummaries.push({
        semester_name: semName,
        courses: items,
        semester_credit_hours: semCredits,
        semester_grade_points: Number(semPoints.toFixed(2)),
        gpa,
        calculation_formula: `GPA = ${semPoints.toFixed(2)} pts / ${semCredits} cr = ${gpa}`
      });
    }

    const cgpa = grandTotalCreditHours > 0 
      ? (grandTotalGradePoints / grandTotalCreditHours).toFixed(2) 
      : '0.00';

    return res.json({
      success: true,
      summary: {
        semesters: semesterSummaries,
        cumulative: {
          cgpa,
          totalCreditHours: grandTotalCreditHours,
          totalGradePoints: Number(grandTotalGradePoints.toFixed(2)),
          totalCourses: grandTotalCourses,
          formula: `CGPA = ${grandTotalGradePoints.toFixed(2)} total pts / ${grandTotalCreditHours} total cr = ${cgpa}`
        }
      }
    });
  } catch (err) {
    console.error('Calculate academic summary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate academic summary.' });
  }
}
