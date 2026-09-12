import { Router } from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes
router.use(authenticateToken, requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const dbStatus = db.getStatus();
    const submissions = await db.getSubmissions();
    const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;

    const claims = await db.getClaims();
    const pendingClaims = claims.filter(c => c.status === 'pending').length;

    const reports = await db.getReports();
    const pendingReports = reports.filter(r => r.status === 'pending').length;

    const users = await db.listUsers();
    const areas = await db.getAreas(false);
    const cities = await db.getCities(false);
    const services = await db.getServices();
    const payments = await db.getPaymentsSummary();

    return res.json({
      dbStatus,
      totalBusinesses: dbStatus.totalBusinesses,
      pendingSubmissions,
      pendingClaims,
      pendingReports,
      totalUsers: users.length,
      totalCities: cities.length,
      totalAreas: areas.length,
      totalServices: services.length,
      totalRevenue: payments.summary.totalRevenue,
      activeSubscriptions: payments.summary.activeSubscriptions,
      pendingPayments: payments.summary.pendingCount
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ error: 'Failed to generate admin statistics' });
  }
});

// GET /api/admin/businesses
router.get('/businesses', async (req, res) => {
  try {
    const status = req.query.status as string;
    const query = req.query.q as string;
    const cityId = req.query.city_id ? Number(req.query.city_id) : undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const result = await db.searchBusinesses({
      query,
      city_id: cityId,
      status: status && status !== 'all' ? status : undefined,
      page,
      limit,
      sort: 'newest'
    });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// GET /api/admin/businesses/:id
router.get('/businesses/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const biz = await db.getBusinessById(id);
    if (!biz) return res.status(404).json({ error: 'Business not found' });
    return res.json(biz);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// POST /api/admin/businesses
router.post('/businesses', async (req: AuthenticatedRequest, res) => {
  try {
    const { name, address, city_id, area_id, city_name, area_name } = req.body;
    const hasCity = Boolean(city_id || (city_name && city_name.trim()));
    const hasArea = Boolean(area_id || (area_name && area_name.trim()));
    if (!name || !address || !hasCity || !hasArea) {
      return res.status(400).json({ error: 'Name, address, city, and area are required.' });
    }

    const newBiz = await db.createBusiness({
      ...req.body,
      status: req.body.status || 'published',
      verification_status: req.body.verification_status || 'verified'
    });

    await db.logAudit({
      user_id: req.user!.id,
      action: 'ADMIN_CREATE_BUSINESS',
      entity_type: 'BUSINESS',
      entity_id: newBiz.id,
      details: { name: newBiz.name, city_id, area_id, status: newBiz.status }
    });

    return res.status(201).json(newBiz);
  } catch (err: any) {
    console.error('Admin create business error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create business' });
  }
});

// PUT /api/admin/businesses/:id
router.put('/businesses/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await db.updateBusiness(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Business not found' });

    await db.logAudit({
      user_id: req.user!.id,
      action: 'ADMIN_UPDATE_BUSINESS',
      entity_type: 'BUSINESS',
      entity_id: id,
      details: { name: updated.name, status: updated.status }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update business' });
  }
});

// PUT /api/admin/businesses/:id/status
router.put('/businesses/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const biz = await db.updateBusinessStatus(id, status);
    if (!biz) return res.status(404).json({ error: 'Business not found' });

    await db.logAudit({
      user_id: req.user!.id,
      action: 'ADMIN_UPDATE_BUSINESS_STATUS',
      entity_type: 'BUSINESS',
      entity_id: id,
      details: { status }
    });

    return res.json({ message: `Business status updated to ${status}`, business: biz });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /api/admin/businesses/:id
router.delete('/businesses/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await db.deleteBusiness(id);
    if (!deleted) return res.status(404).json({ error: 'Business not found' });

    await db.logAudit({
      user_id: req.user!.id,
      action: 'ADMIN_DELETE_BUSINESS',
      entity_type: 'BUSINESS',
      entity_id: id
    });

    return res.json({ message: 'Business successfully deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete business' });
  }
});

// Cities management
router.get('/cities', async (req, res) => {
  try {
    const cities = await db.getCities(false);
    return res.json(cities);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

router.get('/cities/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const city = await db.getCityById(id);
    if (!city) return res.status(404).json({ error: 'City not found' });
    return res.json(city);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch city' });
  }
});

router.post('/cities', async (req: AuthenticatedRequest, res) => {
  try {
    const city = await db.createCity(req.body);
    await db.logAudit({
      user_id: req.user!.id,
      action: 'ADMIN_CREATE_CITY',
      entity_type: 'CITY',
      entity_id: city.id,
      details: { name: city.name }
    });
    return res.status(201).json(city);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create city' });
  }
});

router.put('/cities/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const city = await db.updateCity(id, req.body);
    return res.json(city);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update city' });
  }
});

router.delete('/cities/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await db.deleteCity(id);
    return res.json({ success: deleted });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete city' });
  }
});

// Areas management
router.get('/areas', async (req, res) => {
  try {
    const areas = await db.getAreas(false);
    return res.json(areas);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch areas' });
  }
});

router.get('/areas/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const area = await db.getAreaById(id);
    if (!area) return res.status(404).json({ error: 'Area not found' });
    return res.json(area);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch area' });
  }
});
router.post('/areas', async (req: AuthenticatedRequest, res) => {
  try {
    const area = await db.createArea(req.body);
    await db.logAudit({
      user_id: req.user!.id,
      action: 'ADMIN_CREATE_AREA',
      entity_type: 'AREA',
      entity_id: area.id,
      details: { name: area.name, city_id: area.city_id }
    });
    return res.status(201).json(area);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create area' });
  }
});

router.put('/areas/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const area = await db.updateArea(id, req.body);
    return res.json(area);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update area' });
  }
});

router.delete('/areas/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await db.deleteArea(id);
    return res.json({ success: deleted });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete area' });
  }
});

// Services management
router.get('/services', async (req, res) => {
  try {
    const services = await db.getServices();
    return res.json(services);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.get('/services/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const svc = await db.getServiceById(id);
    if (!svc) return res.status(404).json({ error: 'Service not found' });
    return res.json(svc);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch service' });
  }
});

router.post('/services', async (req: AuthenticatedRequest, res) => {
  try {
    const svc = await db.createService(req.body);
    await db.logAudit({
      user_id: req.user!.id,
      action: 'ADMIN_CREATE_SERVICE',
      entity_type: 'SERVICE',
      entity_id: svc.id,
      details: { name: svc.name }
    });
    return res.status(201).json(svc);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/services/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const svc = await db.updateService(id, req.body);
    return res.json(svc);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/services/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await db.deleteService(id);
    return res.json({ success: deleted });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Blog management (Admin)
router.get('/blog', async (req, res) => {
  try {
    const status = req.query.status as string || 'all';
    const posts = await db.getBlogPosts(status);
    return res.json(posts);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

router.get('/blog/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const post = await db.getBlogPostById(id);
    if (!post) return res.status(404).json({ error: 'Blog post not found' });
    return res.json(post);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

router.post('/blog', async (req: AuthenticatedRequest, res) => {
  try {
    const { title, excerpt, content } = req.body;
    if (!title || !excerpt || !content) {
      return res.status(400).json({ error: 'Title, excerpt, and content are required' });
    }
    const post = await db.createBlogPost(req.body);
    await db.logAudit({
      user_id: req.user!.id,
      action: 'ADMIN_CREATE_BLOG',
      entity_type: 'BLOG',
      entity_id: post.id,
      details: { title: post.title }
    });
    return res.status(201).json(post);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create blog post' });
  }
});

router.put('/blog/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const post = await db.updateBlogPost(id, req.body);
    if (!post) return res.status(404).json({ error: 'Blog post not found' });

    await db.logAudit({
      user_id: req.user!.id,
      action: 'ADMIN_UPDATE_BLOG',
      entity_type: 'BLOG',
      entity_id: id,
      details: { title: post.title, status: post.status }
    });
    return res.json(post);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update blog post' });
  }
});

router.delete('/blog/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await db.deleteBlogPost(id);
    if (!deleted) return res.status(404).json({ error: 'Blog post not found' });

    await db.logAudit({
      user_id: req.user!.id,
      action: 'ADMIN_DELETE_BLOG',
      entity_type: 'BLOG',
      entity_id: id
    });
    return res.json({ message: 'Blog post deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// Photos management
router.get('/photos', async (req, res) => {
  try {
    const photos = await db.getAllPhotos();
    return res.json(photos);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

router.delete('/photos/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await db.deletePhoto(id);
    return res.json({ success: deleted });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Corrections resolution
router.post('/corrections/:id/resolve', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const { status, notes } = req.body;
    const corr = await db.resolveCorrection(id, status || 'reviewed', notes);
    if (!corr) return res.status(404).json({ error: 'Correction not found' });

    await db.logAudit({
      user_id: req.user!.id,
      action: 'ADMIN_RESOLVE_CORRECTION',
      entity_type: 'CORRECTION',
      entity_id: id,
      details: { status, notes }
    });
    return res.json({ message: 'Correction resolved', correction: corr });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resolve correction' });
  }
});

// Users management
router.get('/users', async (req, res) => {
  try {
    const users = await db.listUsers();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list users' });
  }
});

router.put('/users/:id/role', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;
    const user = await db.updateUserRole(id, role);
    await db.logAudit({
      user_id: req.user!.id,
      action: 'ADMIN_CHANGE_USER_ROLE',
      entity_type: 'USER',
      entity_id: id,
      details: { role }
    });
    return res.json({ message: 'User role updated', user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await db.getAuditLogs(100);
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// DB Status info
router.get('/db-status', async (req, res) => {
  return res.json(db.getStatus());
});

// Payments & Subscriptions
router.get('/payments', async (req, res) => {
  try {
    const data = await db.getPaymentsSummary();
    return res.json(data);
  } catch (err) {
    console.error('Failed to get payments summary:', err);
    return res.status(500).json({ error: 'Failed to retrieve payments summary' });
  }
});

router.put('/businesses/:id/plan', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await db.updateBusinessPlan(id, req.body, req.user?.id);
    if (!updated) {
      return res.status(404).json({ error: 'Business not found' });
    }
    return res.json({ message: 'Listing subscription plan updated', business: updated });
  } catch (err) {
    console.error('Failed to update business plan:', err);
    return res.status(500).json({ error: 'Failed to update business plan' });
  }
});

export default router;
