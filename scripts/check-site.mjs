/**
 * Static Relocate Works content/route QA, run after astro build.
 * Checks local navigation targets and same-page anchor references in generated HTML.
 * Live external URL monitoring is a separate editorial task; HTTP 200 != open vacancy.
 */
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { resolve, relative, join, extname } from 'node:path';

const root = resolve('dist');
if (!existsSync(root)) throw new Error('Run npm run build first; dist/ is missing');
const errors = [];
const warnings = [];
const external = new Set();
const htmlFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.html')) htmlFiles.push(path);
  }
}
walk(root);

const pages = new Map(htmlFiles.map((file) => [file, readFileSync(file, 'utf8')]));
const readHref = (text) => text.match(/\bhref\s*=\s*(["'])(.*?)\1/is)?.[2] ?? null;
const decodeHtml = (value) => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const checkLocal = (urlPath) => {
  const local = decodeURIComponent(urlPath);
  const clean = local.replace(/^\//, '');
  const direct = resolve(root, clean);
  const variants = [join(direct, 'index.html'), direct];
  if (local === '/') variants.push(join(root, 'index.html'));
  if (extname(local) === '') variants.push(resolve(root, clean + '.html'));
  return variants.find((p) => existsSync(p) && statSync(p).isFile());
};
const checkIds = (file, fragment) => {
  const html = pages.get(file) ?? (existsSync(file) && extname(file) === '.html' ? readFileSync(file, 'utf8') : null);
  if (!html) return false;
  const id = decodeURIComponent(fragment).replace(/\\/g, '');
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\bid=["\\\']' + escaped + '["\\\']').test(html)
    || new RegExp('\\bname=["\\\']' + escaped + '["\\\']').test(html);
};
let checked = 0;
for (const [file, html] of pages) {
  const canonicalTag = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0];
  if (!canonicalTag) warnings.push('Missing canonical tag: ' + relative(root, file));
  const descriptionTag = html.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i)?.[0];
  if (!descriptionTag) warnings.push('Missing meta description: ' + relative(root, file));
  for (const anchor of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = readHref(anchor[0]);
    if (!href) continue;
    const decoded = decodeHtml(href);
    if (/^(?:mailto:|tel:|sms:|javascript:|data:)/i.test(decoded)) continue;
    let url;
    try { url = new URL(decoded, 'https://relocateworks.com' + '/' + relative(root, file).replace(/(?:index)?\.html$/, '')); }
    catch { warnings.push('Unparseable URL ' + decoded + ' in ' + relative(root, file)); continue; }
    if (url.origin !== 'https://relocateworks.com') { external.add(url.href); continue; }
    const destination = checkLocal(url.pathname);
    checked++;
    if (!destination) {
      errors.push('Broken internal route ' + decoded + ' from ' + relative(root, file));
    } else if (url.hash && extname(destination) === '.html' && !checkIds(destination, url.hash.slice(1))) {
      errors.push('Missing anchor ' + decoded + ' from ' + relative(root, file));
    }
  }
}
for (const slug of ['australia','new-zealand','united-kingdom','germany','canada','singapore','ireland','netherlands','denmark','japan']) {
  const file = join(root, 'countries', slug, 'index.html');
  const txt = pages.get(file);
  if (!txt) errors.push('Country guide not generated: ' + slug);
  else if (!txt.includes('Official starting points')) errors.push('Country guide missing official references: ' + slug);
  else if (txt.includes('Editorial edition: September 2026')) errors.push('Country guide contains obsolete editorial edition notice: ' + slug);
}
const blogFiles = htmlFiles.filter((path) => path.includes('/blog/') && path !== join(root,'blog','index.html'));
if (blogFiles.length !== 9) errors.push('Expected 9 unique blog article pages, found ' + blogFiles.length);
for (const file of blogFiles) {
  const txt = pages.get(file);
  if (!txt.includes('2026-09-26') || !txt.includes('Official resources') && !file.includes('how-to-find-visa-sponsor-jobs-abroad')) {
    errors.push('Blog page lacks current editorial content or date: ' + relative(root, file));
  }
}
const home = pages.get(join(root,'index.html')) || '';
if (home.includes('"SearchAction"')) errors.push('Homepage still advertises nonexistent /search in structured data');
if (home.includes('Expanding after launch') || home.includes('prepared as next-market country guides')) errors.push('Homepage implies already available guides are not yet launched');
if (home.includes('Sponsor Confidence') || home.includes('8.2/10')) errors.push('Homepage still shows fictitious job scores');

/* Phase 1 redesign smoke checks: no invented search route or dead-end design navigation. */
const countryDirectory = pages.get(join(root, 'countries', 'index.html')) || '';
const guideDirectory = pages.get(join(root, 'guides', 'index.html')) || '';
if (!guideDirectory.includes('THE RELOCATION LIBRARY') || !guideDirectory.includes('rw-topic-grid')) errors.push('Redesigned relocation guides directory missing');
if (!countryDirectory.includes('data-country-search') || !countryDirectory.includes('data-country-filters')) errors.push('Destination search or region filter missing');
if ((countryDirectory.match(/data-country-result=/g) || []).length < 10) errors.push('Country directory does not expose all 10 filterable guide cards');
if (!home.includes('action="/countries"') || !home.includes('name="q"')) errors.push('Homepage country search is not wired to the directory');
if (!home.includes('rw-newsletter-section') || !home.includes('rw-hero')) errors.push('Redesigned homepage sections missing');
for (const slug of ['australia','new-zealand','united-kingdom','germany','canada','singapore','ireland','netherlands','denmark','japan']) {
  const txt = pages.get(join(root,'countries',slug,'index.html')) || '';
  if (!txt.includes('rw-country-detail-hero') || !txt.includes('rw-country-toc')) errors.push('Destination detail redesign missing: ' + slug);
}

mkdirSync(resolve('reports'), { recursive: true });
writeFileSync(resolve('reports', 'external-links.txt'), [...external].sort().join('\n') + '\n');
console.log(`Checked ${pages.size} built HTML pages and ${checked} internal links; ${external.size} unique external destinations are listed in reports/external-links.txt`);
for (const warning of warnings) console.warn('WARNING: ' + warning);
for (const error of errors) console.error('ERROR: ' + error);
if (errors.length) process.exitCode = 1;
