import { Router } from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/contact
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const msg = await db.createContactMessage({ name, email, subject, message });
    return res.status(201).json({ message: 'Thank you for reaching out. We will respond shortly.', msg });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/contact (Admin)
router.get('/contact', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const msgs = await db.getContactMessages();
    return res.json(msgs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch contact inquiries' });
  }
});

// POST /api/reports (Report business inaccuracy)
router.post('/reports', async (req, res) => {
  try {
    const { business_id, report_type, message, reporter_email } = req.body;
    if (!business_id || !report_type || !message) {
      return res.status(400).json({ error: 'Business, report type, and description message are required.' });
    }

    const report = await db.createReport({ business_id, report_type, message, reporter_email });
    return res.status(201).json({
      message: 'Report submitted. Our editorial moderation team will inspect this listing.',
      report
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit report' });
  }
});

// GET /api/reports (Admin)
router.get('/reports', authenticateToken, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const reports = await db.getReports();
    return res.json(reports);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST /api/reports/:id/resolve (Admin)
router.post('/reports/:id/resolve', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { admin_notes } = req.body;
    const report = await db.resolveReport(id, admin_notes);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    return res.json({ message: 'Report resolved', report });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resolve report' });
  }
});

// POST /api/corrections (Propose listing correction)
router.post('/corrections', async (req, res) => {
  try {
    const { business_id, user_id, proposed_data, notes } = req.body;
    if (!business_id || !proposed_data) {
      return res.status(400).json({ error: 'Business ID and proposed data are required.' });
    }

    const corr = await db.createCorrection({ business_id, user_id, proposed_data, notes });
    return res.status(201).json({
      message: 'Correction proposal logged for administrator review.',
      correction: corr
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to log correction' });
  }
});

// GET /api/corrections (Admin)
router.get('/corrections', authenticateToken, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const corrections = await db.getCorrections();
    return res.json(corrections);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch corrections' });
  }
});

export default router;
