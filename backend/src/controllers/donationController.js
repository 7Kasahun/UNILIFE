import { query, getOne, run } from '../db/db.js';

export async function submitDonation(req, res) {
  try {
    const {
      donor_name,
      donor_email,
      amount,
      payment_method,
      transaction_reference,
      notes,
      is_anonymous
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid donation amount in ETB.' });
    }

    if (!payment_method || !transaction_reference) {
      return res.status(400).json({ success: false, message: 'Payment method and transaction reference are required.' });
    }

    const cleanRef = transaction_reference.trim().toUpperCase();

    // Check unique transaction reference
    const existing = await getOne('SELECT id FROM donations WHERE transaction_reference = ?', [cleanRef]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'This transaction reference has already been submitted.' });
    }

    const result = await run(
      `INSERT INTO donations 
        (donor_name, donor_email, amount, payment_method, transaction_reference, notes, is_anonymous, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        (donor_name || '').trim(),
        (donor_email || '').trim(),
        Number(amount),
        payment_method,
        cleanRef,
        (notes || '').trim(),
        is_anonymous ? 1 : 0
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you for supporting UniLife Ethiopia! Your contribution receipt has been submitted and will be verified shortly.',
      donationId: result.lastInsertId
    });
  } catch (err) {
    console.error('Submit donation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit donation. Please try again.' });
  }
}

export async function getPublicDonationStats(req, res) {
  try {
    const totalRes = await getOne(
      "SELECT SUM(amount) as total_amount, COUNT(*) as total_count FROM donations WHERE status = 'Verified'"
    );

    const totalVerifiedAmount = (totalRes && totalRes.total_amount) || 0;
    const totalVerifiedDonations = (totalRes && totalRes.total_count) || 0;

    // Recent verified contributions (respecting anonymity)
    const recentDonors = await query(
      `SELECT 
        CASE WHEN is_anonymous = 1 THEN 'Anonymous Supporter' ELSE COALESCE(NULLIF(donor_name, ''), 'Supporter') END as display_name,
        amount, notes, verified_at, created_at
       FROM donations
       WHERE status = 'Verified'
       ORDER BY verified_at DESC, created_at DESC
       LIMIT 15`
    );

    return res.json({
      success: true,
      stats: {
        totalVerifiedAmount: Number(totalVerifiedAmount),
        totalVerifiedDonations: Number(totalVerifiedDonations),
        currency: 'ETB',
        transparencyMessage: 'UniLife Ethiopia is completely free for all students. Voluntary donations cover server infrastructure, domain maintenance, and platform development.'
      },
      recentDonors
    });
  } catch (err) {
    console.error('Get donation stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve donation statistics.' });
  }
}

export async function getAdminDonations(req, res) {
  try {
    const { status, search } = req.query;
    let sql = 'SELECT * FROM donations WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (transaction_reference LIKE ? OR donor_name LIKE ? OR donor_email LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY created_at DESC';

    const donations = await query(sql, params);

    // Summary counts
    const pendingCountRes = await getOne("SELECT COUNT(*) as count FROM donations WHERE status = 'Pending'");
    const verifiedCountRes = await getOne("SELECT COUNT(*) as count, SUM(amount) as total FROM donations WHERE status = 'Verified'");
    const rejectedCountRes = await getOne("SELECT COUNT(*) as count FROM donations WHERE status = 'Rejected'");

    return res.json({
      success: true,
      donations,
      stats: {
        pendingCount: (pendingCountRes && pendingCountRes.count) || 0,
        verifiedCount: (verifiedCountRes && verifiedCountRes.count) || 0,
        totalVerifiedAmount: (verifiedCountRes && verifiedCountRes.total) || 0,
        rejectedCount: (rejectedCountRes && rejectedCountRes.count) || 0
      }
    });
  } catch (err) {
    console.error('Get admin donations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve donations.' });
  }
}

export async function verifyDonation(req, res) {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT id, amount, transaction_reference FROM donations WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    const nowIso = new Date().toISOString();
    await run(
      `UPDATE donations 
       SET status = 'Verified', verified_by_admin_id = ?, verified_at = ?, rejection_reason = NULL
       WHERE id = ?`,
      [req.admin.id, nowIso, id]
    );

    // Log admin activity
    await run(
      'INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details) VALUES (?, "verify_donation", "donations", ?, ?)',
      [req.admin.id, id, `Verified donation of ETB ${existing.amount} (Ref: ${existing.transaction_reference})`]
    );

    return res.json({ success: true, message: 'Donation has been verified and added to confirmed totals.' });
  } catch (err) {
    console.error('Verify donation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify donation.' });
  }
}

export async function rejectDonation(req, res) {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const existing = await getOne('SELECT id, amount, transaction_reference FROM donations WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    await run(
      `UPDATE donations 
       SET status = 'Rejected', verified_by_admin_id = ?, verified_at = NULL, rejection_reason = ?
       WHERE id = ?`,
      [req.admin.id, (rejection_reason || 'Transaction reference unverified').trim(), id]
    );

    // Log admin activity
    await run(
      'INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details) VALUES (?, "reject_donation", "donations", ?, ?)',
      [req.admin.id, id, `Rejected donation of ETB ${existing.amount} (Ref: ${existing.transaction_reference}). Reason: ${rejection_reason || 'Unverified'}`]
    );

    return res.json({ success: true, message: 'Donation has been marked as rejected.' });
  } catch (err) {
    console.error('Reject donation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject donation.' });
  }
}
