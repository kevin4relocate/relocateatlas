import { SITE, blogPosts } from '../data';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export async function GET() {
  const items = blogPosts
    .map((post) => {
      const url = new URL(`/blog/${post.slug}`, SITE.url).toString();
      return `<item>
<title>${escapeXml(post.title)}</title>
<link>${url}</link>
<guid>${url}</guid>
<description>${escapeXml(post.description)}</description>
<pubDate>${new Date(post.date).toUTCString()}</pubDate>
<category>${escapeXml(post.category)}</category>
</item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(SITE.name)}</title>
<link>${SITE.url}</link>
<description>${escapeXml(SITE.description)}</description>
<language>en</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
