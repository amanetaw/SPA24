import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// GET /api/businesses (Search & filter)
router.get('/', async (req, res) => {
  try {
    const {
      q,
      city,
      area,
      service,
      open_now,
      sort = 'popular',
      page = 1,
      limit = 12
    } = req.query;

    const result = await db.searchBusinesses({
      search: typeof q === 'string' ? q : undefined,
      citySlug: typeof city === 'string' ? city : undefined,
      areaSlug: typeof area === 'string' ? area : undefined,
      serviceSlug: typeof service === 'string' ? service : undefined,
      openNow: open_now === 'true' || open_now === '1',
      status: 'published',
      sort: (sort === 'newest' || sort === 'name' || sort === 'popular') ? sort : 'popular',
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(50, Math.max(1, Number(limit) || 12))
    });

    return res.json(result);
  } catch (err: any) {
    console.error('Error fetching businesses:', err);
    return res.status(500).json({ error: 'Failed to retrieve businesses' });
  }
});

// GET /api/businesses/check-duplicate
router.get('/check-duplicate', async (req, res) => {
  try {
    const { name, phone, website, address, city } = req.query;

    const duplicates = await db.checkDuplicateBusiness({
      name: typeof name === 'string' ? name : undefined,
      phone: typeof phone === 'string' ? phone : undefined,
      website: typeof website === 'string' ? website : undefined,
      address: typeof address === 'string' ? address : undefined,
      cityName: typeof city === 'string' ? city : undefined
    });

    return res.json({
      hasMatches: duplicates.length > 0,
      matches: duplicates
    });
  } catch (err: any) {
    console.error('Duplicate check error:', err);
    return res.status(500).json({ error: 'Failed to verify potential duplicates' });
  }
});

// GET /api/businesses/slug/:citySlug/:areaSlug/:businessSlug
router.get('/slug/:citySlug/:areaSlug/:businessSlug', async (req, res) => {
  try {
    const { citySlug, areaSlug, businessSlug } = req.params;

    const business = await db.getBusinessBySlugs(citySlug, areaSlug, businessSlug);
    if (!business) {
      return res.status(404).json({ error: 'Business listing not found' });
    }

    return res.json(business);
  } catch (err: any) {
    console.error('Error fetching business by slug:', err);
    return res.status(500).json({ error: 'Failed to fetch business details' });
  }
});

// GET /api/businesses/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid business ID' });
    }

    const business = await db.getBusinessById(id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    return res.json(business);
  } catch (err: any) {
    console.error('Error fetching business by ID:', err);
    return res.status(500).json({ error: 'Failed to fetch business' });
  }
});

export default router;
