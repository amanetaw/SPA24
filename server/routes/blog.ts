import { Router } from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/blog (Public articles)
router.get('/', async (req, res) => {
  try {
    const posts = await db.getBlogPosts('published');
    return res.json(posts);
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    return res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/blog/:slug (Single article with related links)
router.get('/:slug', async (req, res) => {
  try {
    const post = await db.getBlogPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ error: 'Article not found' });
    }
    return res.json(post);
  } catch (err) {
    console.error('Error fetching article:', err);
    return res.status(500).json({ error: 'Failed to retrieve article' });
  }
});

// POST /api/blog (Admin create)
router.post('/', authenticateToken, requireRole('admin', 'editor'), async (req: AuthenticatedRequest, res) => {
  try {
    const { title, excerpt, content, featured_image, category_id, status } = req.body;
    if (!title || !content || !excerpt) {
      return res.status(400).json({ error: 'Title, excerpt, and content are required' });
    }

    const post = await db.createBlogPost({
      title,
      excerpt,
      content,
      featured_image,
      category_id,
      status: status || 'published',
      author: req.user!.full_name
    });

    await db.logAudit({
      user_id: req.user!.id,
      action: 'CREATE_BLOG_POST',
      entity_type: 'BLOG',
      entity_id: post.id,
      details: { title: post.title }
    });

    return res.status(201).json(post);
  } catch (err) {
    console.error('Error creating blog post:', err);
    return res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// PUT /api/blog/:id (Admin update)
router.put('/:id', authenticateToken, requireRole('admin', 'editor'), async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const post = await db.updateBlogPost(id, req.body);
    if (!post) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await db.logAudit({
      user_id: req.user!.id,
      action: 'UPDATE_BLOG_POST',
      entity_type: 'BLOG',
      entity_id: post.id,
      details: { title: post.title }
    });

    return res.json(post);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE /api/blog/:id (Admin delete)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await db.deleteBlogPost(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Article not found' });
    }
    return res.json({ message: 'Article deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;
