const { Router } = require('express');

const Post = require('../models/postModel');
const { POST_CATEGORIES } = require('../utils/constants');
const { siteUrl } = require('../config/env');

const router = Router();

const xml = (value) =>
  String(value).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

const isoDate = (date) => (date ? new Date(date).toISOString() : undefined);

const urlEntry = ({ loc, lastmod, image }) =>
  [
    '  <url>',
    `    <loc>${xml(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    image ? `    <image:image><image:loc>${xml(image)}</image:loc></image:image>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');

// GET /sitemap.xml: every public page of the client, generated from the database.
// The client host proxies its own /sitemap.xml here, so <loc> values use the client's SITE_URL.
router.get('/sitemap.xml', async (req, res) => {
  const posts = await Post.find({}, 'thumbnail creator category createdAt updatedAt').sort({ createdAt: -1 }).lean();
  const apiOrigin = `${req.protocol}://${req.get('host')}`;

  const latest = (list) => isoDate(list.reduce((max, p) => Math.max(max, new Date(p.updatedAt ?? p.createdAt).getTime()), 0) || null);
  const byCreator = new Map();
  for (const p of posts) {
    const id = String(p.creator);
    byCreator.set(id, [...(byCreator.get(id) ?? []), p]);
  }

  const entries = [
    { loc: `${siteUrl}/`, lastmod: latest(posts) },
    { loc: `${siteUrl}/authors`, lastmod: latest(posts) },
    ...POST_CATEGORIES.map((c) => {
      const inCat = posts.filter((p) => p.category === c);
      return inCat.length ? { loc: `${siteUrl}/posts/categories/${encodeURIComponent(c)}`, lastmod: latest(inCat) } : null;
    }).filter(Boolean),
    ...[...byCreator].map(([id, list]) => ({ loc: `${siteUrl}/posts/users/${id}`, lastmod: latest(list) })),
    ...posts.map((p) => ({
      loc: `${siteUrl}/posts/${p._id}`,
      lastmod: isoDate(p.updatedAt ?? p.createdAt),
      image: p.thumbnail ? `${apiOrigin}/uploads/${p.thumbnail}` : null,
    })),
  ];

  res
    .type('application/xml')
    .set('Cache-Control', 'public, max-age=3600')
    .send(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
        ...entries.map(urlEntry),
        '</urlset>',
        '',
      ].join('\n'),
    );
});

// The API host itself should not be indexed, except for the images it serves.
router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(['User-agent: *', 'Allow: /uploads/', 'Allow: /sitemap.xml', 'Disallow: /', ''].join('\n'));
});

module.exports = router;
