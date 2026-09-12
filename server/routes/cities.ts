import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// GET /api/cities
router.get('/', async (req, res) => {
  try {
    const cities = await db.getCities(true);
    return res.json(cities);
  } catch (err) {
    console.error('Error fetching cities:', err);
    return res.status(500).json({ error: 'Failed to retrieve cities' });
  }
});

// GET /api/cities/:slug
router.get('/:slug', async (req, res) => {
  try {
    const city = await db.getCityBySlug(req.params.slug);
    if (!city) {
      return res.status(404).json({ error: 'City not found in directory' });
    }

    // Get businesses in this city
    const bizResult = await db.searchBusinesses({
      citySlug: city.slug,
      limit: 15,
      sort: 'popular'
    });

    // Get all cities to calculate nearby/other cities
    const allCities = await db.getCities(true);
    const otherCities = allCities.filter(c => c.id !== city.id).slice(0, 4);

    // Services available in this city
    const allServices = await db.getServices();
    const cityServices = allServices.filter(s => s.published_count > 0).slice(0, 8);

    return res.json({
      city,
      businesses: bizResult.businesses,
      totalBusinesses: bizResult.total,
      areas: city.areas,
      availableServices: cityServices,
      nearbyCities: otherCities
    });
  } catch (err) {
    console.error('Error fetching city details:', err);
    return res.status(500).json({ error: 'Failed to retrieve city directory' });
  }
});

export default router;
