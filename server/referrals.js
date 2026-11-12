const DEFAULT_HOSTS = ['app.alignerr.com', 'alignerr.com', 'www.alignerr.com', 't.mercor.com', 'mercor.com', 'www.mercor.com', 'work.mercor.com'];
export const CHANNELS = ['linkedin', 'facebook', 'website', 'other'];

export function response(body, status = 200, headers = {}) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
      ...headers,
    },
  });
}

export function validSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 80;
}

export function validDestination(destination, env = {}) {
  if (typeof destination !== 'string' || destination.length > 4096 || destination !== destination.trim() || /[\r\n\t]/.test(destination)) return false;
  try {
    const url = new URL(destination);
    const hosts = env.REFERRAL_ALLOWED_HOSTS ? env.REFERRAL_ALLOWED_HOSTS.split(',').map(host => host.trim().toLowerCase()) : DEFAULT_HOSTS;
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && hosts.includes(url.hostname);
  } catch {
    return false;
  }
}

export async function authorized(request, token) {
  if (typeof token !== 'string' || token.length < 32 || token.length > 256) return false;
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ') || header.length > 263) return false;
  const encode = new TextEncoder();
  const [provided, expected] = await Promise.all([header.slice(7), token].map(value => crypto.subtle.digest('SHA-256', encode.encode(value))));
  const actualBytes = new Uint8Array(provided);
  const expectedBytes = new Uint8Array(expected);
  let difference = 0;
  for (let index = 0; index < actualBytes.length; index++) difference |= actualBytes[index] ^ expectedBytes[index];
  return difference === 0;
}

export function channelFor(request) {
  const source = new URL(request.url).searchParams.get('src');
  return CHANNELS.includes(source) ? source : 'other';
}

export function shouldCount(request) {
  return request.method === 'GET'
    && !/bot|crawler|spider|slurp|facebookexternalhit|facebot|linkedinbot|preview|headless|curl|wget/i.test(request.headers.get('User-Agent') || '')
    && !/prefetch|prerender/i.test(`${request.headers.get('Purpose') || ''} ${request.headers.get('Sec-Purpose') || ''}`);
}
