import { authorized, response, validDestination, validSlug } from '../../server/referrals.js';

export async function onRequest({ request, env }) {
  if (!env.REFERRAL_DB || !env.REFERRAL_ADMIN_TOKEN || env.REFERRAL_ADMIN_TOKEN.length < 32 || env.REFERRAL_ADMIN_TOKEN.length > 256) {
    return response({ error: 'Referral manager is not configured. Complete the database and admin-key setup.' }, 503);
  }
  if (!(await authorized(request, env.REFERRAL_ADMIN_TOKEN))) return response({ error: 'Invalid admin key.' }, 401);
  if (!['GET', 'POST', 'PATCH'].includes(request.method)) return response({ error: 'Method not allowed.' }, 405, { Allow: 'GET, POST, PATCH' });
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return response({ error: 'Use the manager on this website.' }, 403);

  try {
    if (request.method === 'GET') {
      // One record per UTC date and source. No visitor identifiers are stored.
      const { results } = await env.REFERRAL_DB.prepare(`
        SELECT l.*, COALESCE(SUM(c.clicks), 0) AS clicks,
          COALESCE(SUM(CASE WHEN c.source = 'linkedin' THEN c.clicks ELSE 0 END), 0) AS linkedin,
          COALESCE(SUM(CASE WHEN c.source = 'facebook' THEN c.clicks ELSE 0 END), 0) AS facebook,
          COALESCE(SUM(CASE WHEN c.source = 'website' THEN c.clicks ELSE 0 END), 0) AS website,
          COALESCE(SUM(CASE WHEN c.source = 'other' THEN c.clicks ELSE 0 END), 0) AS other,
          COALESCE(SUM(CASE WHEN c.day = date('now') THEN c.clicks ELSE 0 END), 0) AS today
        FROM referral_links l LEFT JOIN referral_clicks c ON l.slug = c.slug
        GROUP BY l.slug ORDER BY l.created_at DESC, l.slug ASC
      `).all();
      return response({ links: results });
    }

    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return response({ error: 'Send JSON data.' }, 415);
    const raw = await request.text();
    if (raw.length > 8192) return response({ error: 'Request is too large.' }, 413);
    let data;
    try { data = JSON.parse(raw); } catch { return response({ error: 'Invalid JSON.' }, 400); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return response({ error: 'Invalid link data.' }, 400);
    const { slug, title, destination, active } = data;
    if (!validSlug(slug)) return response({ error: 'Use 3–80 lowercase letters, numbers and single hyphens for the slug.' }, 400);
    if (typeof title !== 'string' || !title.trim() || title.length > 160) return response({ error: 'Enter a job title of up to 160 characters.' }, 400);
    if (!validDestination(destination, env)) return response({ error: 'Use a complete HTTPS referral URL on an allowed Alignerr or Mercor host.' }, 400);
    if (active !== undefined && typeof active !== 'boolean') return response({ error: 'Active must be true or false.' }, 400);

    if (request.method === 'POST') {
      const result = await env.REFERRAL_DB.prepare(`
        INSERT INTO referral_links (slug, title, destination, active)
        VALUES (?, ?, ?, ?) ON CONFLICT(slug) DO NOTHING
      `).bind(slug, title.trim(), destination, active === false ? 0 : 1).run();
      if (!result.meta.changes) return response({ error: 'This slug already exists. Edit that job or choose a different slug.' }, 409);
      return response({ slug }, 201);
    }

    // Slugs stay stable when destinations change. Counters are never reset by edits.
    const result = await env.REFERRAL_DB.prepare(`
      UPDATE referral_links SET title = ?, destination = ?, active = ?, updated_at = datetime('now') WHERE slug = ?
    `).bind(title.trim(), destination, active === false ? 0 : 1, slug).run();
    return result.meta.changes ? response({ slug }) : response({ error: 'Link not found.' }, 404);
  } catch {
    return response({ error: 'The database is unavailable. Check the binding and schema, then refresh before retrying.' }, 503);
  }
}
