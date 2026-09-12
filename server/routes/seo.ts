import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

const getBaseUrl = () => {
  return process.env.APP_URL || 'https://spa24.online';
};

// GET /robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = getBaseUrl();
  const robots = `# SPA24 (spa24.online) Robots Configuration
User-agent: *
Disallow: /admin
Disallow: /admin/
Disallow: /dashboard
Disallow: /dashboard/
Disallow: /api/
Disallow: /login
Disallow: /register

# Allow crawlable public directories
Allow: /
Allow: /spa/
Allow: /cities/
Allow: /areas/
Allow: /services/
Allow: /blog/
Allow: /list-your-spa/
Allow: /claim-listing/
Allow: /about/
Allow: /contact/

# Canonical XML Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;
  res.type('text/plain').send(robots);
});

// GET /sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = getBaseUrl();
    interface SitemapItem {
      loc: string;
      priority: string;
      changefreq: string;
      lastmod?: string;
    }

    const staticUrls: SitemapItem[] = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/spa/`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/cities/`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/areas/`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/services/`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/blog/`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/list-your-spa/`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/claim-listing/`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/about/`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/contact/`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/privacy-policy/`, priority: '0.3', changefreq: 'yearly' },
      { loc: `${baseUrl}/terms/`, priority: '0.3', changefreq: 'yearly' },
      { loc: `${baseUrl}/disclaimer/`, priority: '0.3', changefreq: 'yearly' }
    ];

    const dynamicUrls: SitemapItem[] = [];

    // Cities
    const cities = await db.getCities(true);
    for (const city of cities) {
      if (city.published_count > 0) {
        dynamicUrls.push({
          loc: `${baseUrl}/spa/${city.slug}/`,
          priority: '0.85',
          changefreq: 'weekly'
        });
      }
    }

    // Areas
    const areas = await db.getAreas(true);
    for (const area of areas) {
      if (area.published_count > 0 && area.city_slug) {
        dynamicUrls.push({
          loc: `${baseUrl}/spa/${area.city_slug}/${area.slug}/`,
          priority: '0.8',
          changefreq: 'weekly'
        });
      }
    }

    // Services
    const services = await db.getServices();
    for (const svc of services) {
      dynamicUrls.push({
        loc: `${baseUrl}/services/${svc.slug}/`,
        priority: '0.8',
        changefreq: 'weekly'
      });
    }

    // Businesses
    const bizResult = await db.searchBusinesses({ limit: 1000, status: 'published' });
    for (const biz of bizResult.businesses) {
      if (biz.city_slug && biz.area_slug) {
        dynamicUrls.push({
          loc: `${baseUrl}/spa/${biz.city_slug}/${biz.area_slug}/${biz.slug}/`,
          priority: '0.9',
          changefreq: 'weekly',
          lastmod: biz.updated_at ? new Date(biz.updated_at).toISOString().split('T')[0] : undefined
        });
      }
    }

    // Blog posts
    const posts = await db.getBlogPosts('published');
    for (const post of posts) {
      dynamicUrls.push({
        loc: `${baseUrl}/blog/${post.slug}/`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : undefined
      });
    }

    const allUrls = [...staticUrls, ...dynamicUrls];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const u of allUrls) {
      xml += `  <url>\n`;
      xml += `    <loc>${u.loc}</loc>\n`;
      if (u.lastmod) {
        xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
      }
      xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
      xml += `    <priority>${u.priority}</priority>\n`;
      xml += `  </url>\n`;
    }
    xml += `</urlset>`;

    res.type('application/xml').send(xml);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
