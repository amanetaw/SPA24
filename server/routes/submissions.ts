import { Router } from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/submissions (Public listing submission)
router.post('/', async (req, res) => {
  try {
    const {
      business_name,
      category,
      description,
      phone,
      email,
      website,
      booking_url,
      full_address,
      city_name,
      area_name,
      pincode,
      google_maps_url,
      service_ids,
      opening_hours,
      photos,
      social_links,
      owner_name,
      keywords,
      view_count,
      plan_type,
      payment_status,
      payment_id,
      amount_paid,
      payment_method,
      paid_at
    } = req.body;

    if (!business_name || !phone || !email || !full_address || !city_name || !area_name || !owner_name) {
      return res.status(400).json({
        error: 'Please provide all required fields: Business name, phone, email, address, city, area, and owner contact name.'
      });
    }

    // Run duplicate check
    const duplicates = await db.checkDuplicateBusiness({
      name: business_name,
      phone,
      website,
      address: full_address,
      cityName: city_name
    });

    // Create submission record in 'pending' status
    const submission = await db.createSubmission({
      business_name,
      category: category || 'Day Spa & Wellness',
      description: description || 'Spa & Wellness business listing.',
      phone,
      email,
      website,
      booking_url,
      full_address,
      city_name,
      area_name,
      pincode: pincode ? String(pincode).trim() : '',
      google_maps_url,
      service_ids: Array.isArray(service_ids) ? service_ids : [],
      opening_hours: Array.isArray(opening_hours) ? opening_hours : [],
      photos: Array.isArray(photos) ? photos : [],
      social_links: social_links || {},
      owner_name,
      keywords: keywords ? String(keywords).trim() : '',
      view_count: view_count !== undefined ? Number(view_count) : 1,
      plan_type: plan_type || 'free',
      payment_status: payment_status || (plan_type && plan_type !== 'free' ? (payment_id ? 'paid' : 'pending') : 'free'),
      payment_id: payment_id || null,
      amount_paid: amount_paid !== undefined ? Number(amount_paid) : (plan_type === 'yearly' ? 8999 : plan_type === 'half_yearly' ? 4999 : plan_type === 'monthly' ? 999 : 0),
      payment_method: payment_method || null,
      paid_at: paid_at || (payment_id ? new Date().toISOString() : null)
    });

    await db.logAudit({
      user_id: null,
      action: 'SUBMIT_LISTING',
      entity_type: 'SUBMISSION',
      entity_id: submission.id,
      details: { business_name, city_name, area_name, duplicates_detected: duplicates.length }
    });

    return res.status(201).json({
      message: 'Your listing has been submitted for editorial verification. Listings are thoroughly reviewed prior to publishing on SPA24.',
      submissionId: submission.id,
      status: 'pending',
      possibleDuplicates: duplicates.length > 0 ? duplicates : undefined
    });
  } catch (err: any) {
    console.error('Error submitting listing:', err);
    return res.status(500).json({ error: 'Failed to submit business listing' });
  }
});

// GET /api/submissions (Admin review queue)
router.get('/', authenticateToken, requireRole('admin', 'editor'), async (req: AuthenticatedRequest, res) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const list = await db.getSubmissions(status);
    return res.json(list);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// POST /api/submissions/:id/approve (Admin approval)
router.post('/:id/approve', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const result = await db.approveSubmission(id, req.user!.id);
    if (!result) {
      return res.status(404).json({ error: 'Submission not found or already processed' });
    }
    return res.json({
      message: 'Listing successfully approved and published to the live directory',
      result
    });
  } catch (err: any) {
    console.error('Error approving submission:', err);
    return res.status(500).json({ error: 'Failed to approve listing submission' });
  }
});

// POST /api/submissions/:id/reject (Admin rejection)
router.post('/:id/reject', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const reason = req.body.reason || 'Does not meet verification standards';
    const sub = await db.rejectSubmission(id, req.user!.id, reason);
    if (!sub) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    return res.json({
      message: 'Submission rejected',
      submission: sub
    });
  } catch (err: any) {
    console.error('Error rejecting submission:', err);
    return res.status(500).json({ error: 'Failed to reject listing submission' });
  }
});

export default router;
