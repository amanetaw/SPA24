import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// GET /api/services
router.get('/', async (req, res) => {
  try {
    const services = await db.getServices();
    return res.json(services);
  } catch (err) {
    console.error('Error fetching services:', err);
    return res.status(500).json({ error: 'Failed to retrieve services' });
  }
});

// GET /api/services/:slug
router.get('/:slug', async (req, res) => {
  try {
    const serviceData = await db.getServiceBySlug(req.params.slug);
    if (!serviceData) {
      return res.status(404).json({ error: 'Service category not found' });
    }

    return res.json(serviceData);
  } catch (err) {
    console.error('Error fetching service details:', err);
    return res.status(500).json({ error: 'Failed to retrieve service details' });
  }
});

export default router;
