import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// GET /api/areas
router.get('/', async (req, res) => {
  try {
    const areas = await db.getAreas(true);
    return res.json(areas);
  } catch (err) {
    console.error('Error fetching areas:', err);
    return res.status(500).json({ error: 'Failed to retrieve areas' });
  }
});

// GET /api/areas/:citySlug/:areaSlug
router.get('/:citySlug/:areaSlug', async (req, res) => {
  try {
    const { citySlug, areaSlug } = req.params;
    const areaData = await db.getAreaBySlug(citySlug, areaSlug);
    if (!areaData) {
      return res.status(404).json({ error: 'Area not found in directory' });
    }

    const bizResult = await db.searchBusinesses({
      citySlug,
      areaSlug,
      limit: 15,
      sort: 'popular'
    });

    const allServices = await db.getServices();

    return res.json({
      area: areaData,
      businesses: bizResult.businesses,
      totalBusinesses: bizResult.total,
      nearbyAreas: areaData.nearbyAreas,
      availableServices: allServices.slice(0, 6)
    });
  } catch (err) {
    console.error('Error fetching area details:', err);
    return res.status(500).json({ error: 'Failed to retrieve area directory' });
  }
});

export default router;
