import { channelFor, response, shouldCount, validDestination, validSlug } from '../../server/referrals.js';

export async function onRequest(context) {
  const { request, env, params } = context;
  if (!['GET', 'HEAD'].includes(request.method)) return response({ error: 'Method not allowed.' }, 405, { Allow: 'GET, HEAD' });
  const slug = params.slug;
  if (!validSlug(slug)) return response({ error: 'Link not found.' }, 404);
  if (!env.REFERRAL_DB) return response({ error: 'This referral service is not available yet.' }, 503);
  let link;
  try {
    link = await env.REFERRAL_DB.prepare('SELECT destination, active FROM referral_links WHERE slug = ?').bind(slug).first();
  } catch {
    return response({ error: 'This referral service is temporarily unavailable.' }, 503);
  }
  if (!link) return response({ error: 'Link not found.' }, 404);
  if (!link.active) return response({ error: 'This referral link has been paused.' }, 410);
  if (!validDestination(link.destination, env)) return response({ error: 'The saved destination needs an administrator review.' }, 503);

  if (shouldCount(request)) {
    // Atomic increments tolerate concurrent clicks. A stats failure must not break an application link.
    const record = Promise.resolve().then(() => env.REFERRAL_DB.prepare(`
      INSERT INTO referral_clicks (slug, day, source, clicks) VALUES (?, date('now'), ?, 1)
      ON CONFLICT(slug, day, source) DO UPDATE SET clicks = clicks + 1
    `).bind(slug, channelFor(request)).run()).catch(() => undefined);
    context.waitUntil(record);
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: link.destination,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
