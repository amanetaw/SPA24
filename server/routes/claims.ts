import { Router } from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/claims (Submit a claim request)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      business_id,
      applicant_name,
      applicant_email,
      applicant_phone,
      applicant_role,
      verification_method = 'email',
      proof_notes
    } = req.body;

    if (!business_id || !applicant_name || !applicant_email || !applicant_phone || !applicant_role) {
      return res.status(400).json({
        error: 'Please supply business, applicant full name, official email, phone, and role.'
      });
    }

    const business = await db.getBusinessById(Number(business_id));
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (business.verification_status === 'claimed' && business.owner_id) {
      return res.status(400).json({
        error: 'This business has already been claimed by a verified owner. Please contact support to dispute ownership.'
      });
    }

    const claim = await db.createClaim({
      business_id: Number(business_id),
      user_id: req.user!.id,
      applicant_name,
      applicant_email,
      applicant_phone,
      applicant_role,
      verification_method,
      proof_notes
    });

    await db.logAudit({
      user_id: req.user!.id,
      action: 'SUBMIT_CLAIM',
      entity_type: 'CLAIM',
      entity_id: claim.id,
      details: { business_id, business_name: business.name, verification_method }
    });

    return res.status(201).json({
      message: 'Claim request registered. Our editorial verification team will review your credentials.',
      claim
    });
  } catch (err: any) {
    console.error('Error submitting claim:', err);
    return res.status(500).json({ error: 'Failed to process claim request' });
  }
});

// GET /api/claims/my (User claims)
router.get('/my', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const claims = await db.getClaimsByUserId(req.user!.id);
    return res.json(claims);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user claims' });
  }
});

// GET /api/claims (Admin review queue)
router.get('/', authenticateToken, requireRole('admin', 'editor'), async (req: AuthenticatedRequest, res) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const claims = await db.getClaims(status);
    return res.json(claims);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// POST /api/claims/:id/review (Admin approve/reject)
router.post('/:id/review', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const claimId = Number(req.params.id);
    const { action, reason } = req.body;

    if (action !== 'verified' && action !== 'rejected') {
      return res.status(400).json({ error: 'Action must be "verified" or "rejected"' });
    }

    const claim = await db.reviewClaim(claimId, req.user!.id, action, reason);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    return res.json({
      message: `Claim successfully updated to ${action}`,
      claim
    });
  } catch (err: any) {
    console.error('Error reviewing claim:', err);
    return res.status(500).json({ error: 'Failed to update claim' });
  }
});

export default router;
