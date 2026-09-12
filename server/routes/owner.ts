import { Router } from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Require business_owner or admin
router.use(authenticateToken, requireRole('business_owner', 'admin'));

// GET /api/owner/businesses
router.get('/businesses', async (req: AuthenticatedRequest, res) => {
  try {
    const list = await db.getBusinessesByOwner(req.user!.id);
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve owner listings' });
  }
});

// PUT /api/owner/businesses/:id
router.put('/businesses/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await db.getBusinessById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Must be the owner or an admin
    if (existing.owner_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to manage this business listing' });
    }

    const updated = await db.updateBusiness(id, {
      name: req.body.name,
      description: req.body.description,
      phone: req.body.phone,
      email: req.body.email,
      website: req.body.website,
      booking_url: req.body.booking_url,
      address: req.body.address,
      google_maps_url: req.body.google_maps_url,
      service_ids: req.body.service_ids,
      hours: req.body.hours,
      photos: req.body.photos,
      seo_title: req.body.seo_title,
      meta_description: req.body.meta_description,
      keywords: req.body.keywords
    });

    await db.logAudit({
      user_id: req.user!.id,
      action: 'OWNER_UPDATE_BUSINESS',
      entity_type: 'BUSINESS',
      entity_id: id,
      details: { updatedFields: Object.keys(req.body) }
    });

    return res.json({ message: 'Listing updated successfully', business: updated });
  } catch (err: any) {
    console.error('Owner update error:', err);
    return res.status(500).json({ error: 'Failed to update business details' });
  }
});

// GET /api/owner/claims
router.get('/claims', async (req: AuthenticatedRequest, res) => {
  try {
    const claims = await db.getClaimsByUserId(req.user!.id);
    return res.json(claims);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve claims' });
  }
});

export default router;
