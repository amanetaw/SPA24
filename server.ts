import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db/index.js';

import authRouter from './server/routes/auth.js';
import businessesRouter from './server/routes/businesses.js';
import citiesRouter from './server/routes/cities.js';
import areasRouter from './server/routes/areas.js';
import servicesRouter from './server/routes/services.js';
import submissionsRouter from './server/routes/submissions.js';
import claimsRouter from './server/routes/claims.js';
import blogRouter from './server/routes/blog.js';
import interactionsRouter from './server/routes/interactions.js';
import ownerRouter from './server/routes/owner.js';
import adminRouter from './server/routes/admin.js';
import paymentsRouter from './server/routes/payments.js';
import seoRouter from './server/routes/seo.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Handle malformed JSON body errors gracefully
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err && (err as any).status === 400) {
      return res.status(400).json({ error: 'Malformed JSON payload.' });
    }
    next(err);
  });

  // Initialize database service
  await db.initialize();

  // SEO dynamic endpoints (served at root level for web crawlers)
  app.use('/', seoRouter);

  // Health and DB status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SPA24 Wellness Directory API',
      timestamp: new Date().toISOString(),
      database: db.getStatus()
    });
  });

  // REST API Route Mounts
  app.use('/api/auth', authRouter);
  app.use('/api/businesses', businessesRouter);
  app.use('/api/cities', citiesRouter);
  app.use('/api/areas', areasRouter);
  app.use('/api/services', servicesRouter);
  app.use('/api/submissions', submissionsRouter);
  app.use('/api/claims', claimsRouter);
  app.use('/api/blog', blogRouter);
  app.use('/api', interactionsRouter);
  app.use('/api/owner', ownerRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/payments', paymentsRouter);

  // Vite middleware in development or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SPA24] Production server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[SPA24] Fatal server boot error:', err);
  process.exit(1);
});
