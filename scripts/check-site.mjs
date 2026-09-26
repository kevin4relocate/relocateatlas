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
  else if (!txt.includes('Official starting points') || !txt.includes('September 2026')) errors.push('Country guide missing editorial notes: ' + slug);
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
if (home.includes('Sponsor Confidence') || home.includes('8.2/10')) errors.push('Homepage still shows fictitious job scores');
mkdirSync(resolve('reports'), { recursive: true });
writeFileSync(resolve('reports', 'external-links.txt'), [...external].sort().join('\n') + '\n');
console.log(`Checked ${pages.size} built HTML pages and ${checked} internal links; ${external.size} unique external destinations are listed in reports/external-links.txt`);
for (const warning of warnings) console.warn('WARNING: ' + warning);
for (const error of errors) console.error('ERROR: ' + error);
if (errors.length) process.exitCode = 1;
