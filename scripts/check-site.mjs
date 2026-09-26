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
// Keep the audit synchronised with the single source of country data.
const countryDataSource = readFileSync(resolve('src/data.ts'), 'utf8');
const countryDataMatch = countryDataSource.match(/export const countries = (\[[\s\S]*?\]) as const;/);
if (!countryDataMatch) throw new Error('Cannot parse source country data for route QA');
const marketData = JSON.parse(countryDataMatch[1]);
const countrySlugs = marketData.map((market) => market.slug);
if (marketData.length !== 14 || new Set(countrySlugs).size !== marketData.length) {
  errors.push('Expected 14 unique destination guides, found ' + marketData.length);
}
const newCountrySlugs = ['sweden','finland','portugal','spain'];
const refreshedCountrySlugs = ['singapore','ireland','netherlands','denmark','japan'];
const expandedCountrySlugs = [...refreshedCountrySlugs, ...newCountrySlugs];

for (const slug of countrySlugs) {
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

const ogImageFile = resolve(root, 'og-image.svg');
if (!existsSync(ogImageFile)) errors.push('Editorial social preview image is missing');
else if (/Sponsor Score|82%|Sponsor Confidence/i.test(readFileSync(ogImageFile, 'utf8'))) errors.push('Social preview still contains fictional sponsorship scoring');

// The phase 1/2 layout must not silently introduce an unrelated green brand.
// Preserve the original navy / royal-blue / teal tokens and original favicon.
const redesignCss = readFileSync(resolve('src/redesign.css'), 'utf8');
if (!/--rw-forest:\s*#102a43/i.test(redesignCss) ||
    !/--rw-primary:\s*#2563eb/i.test(redesignCss) ||
    !/--rw-teal:\s*#2563eb/i.test(redesignCss) ||
    !/--rw-sage:\s*#60a5fa/i.test(redesignCss)) {
  errors.push('Redesigned site does not use the requested navy/royal-blue/light-blue palette');
}
if (/#12352f|#dcee98|#0f766e|#14b8a6|#2dd4bf|#99f6e4|#5eead4|#ccfbf1/i.test(redesignCss)) {
  errors.push('Green/teal visual accents remain in redesigned pages');
}
if (!/\.rw-hero\s*\{background:linear-gradient\(165deg,#fff 0%,#f8fafc 40%,#eff6ff 100%\)/i.test(redesignCss)) {
  errors.push('Light blue homepage hero composition was removed');
}
if (!/\.rw-main \.rw-kicker \{color:#1d4ed8;\}/.test(redesignCss) ||
    !/\.rw-menu-label \{color:#1d4ed8;\}/.test(redesignCss)) {
  errors.push('Eyebrow or country dropdown heading is no longer royal blue');
}
const headerSource = readFileSync(resolve('src/components/Header.astro'), 'utf8');
const footerSource = readFileSync(resolve('src/components/Footer.astro'), 'utf8');
if (!headerSource.includes('src="/brand-mark-blue.svg"') ||
    !footerSource.includes('src="/brand-mark-blue.svg"')) {
  errors.push('Header or footer still references an old cached green logo');
}
const logoSource = readFileSync(resolve(root, 'brand-mark-blue.svg'), 'utf8');
const faviconSource = readFileSync(resolve(root, 'favicon-blue.svg'), 'utf8');
if ([logoSource,faviconSource].some(asset => !/#3B82F6/i.test(asset) || !/#1D4ED8/i.test(asset) || /#2DD4BF|#0f766e/i.test(asset))) {
  errors.push('New blue brand assets are missing or contain green accents');
}
const htmlHead = pages.get(join(root,'index.html')) || '';
if (!htmlHead.includes('favicon-blue.svg')) errors.push('Document still points at old favicon URL');
const manifest = JSON.parse(readFileSync(resolve(root,'site.webmanifest'),'utf8'));
if (manifest.theme_color?.toUpperCase() !== '#102A43' || manifest.background_color?.toUpperCase() !== '#F8FAFC') {
  errors.push('Browser colors do not match blue/cloud palette');
}
if (existsSync(ogImageFile) && (!/#2563eb/i.test(readFileSync(ogImageFile,'utf8')) ||
    /#0f766e|#2dd4bf/i.test(readFileSync(ogImageFile,'utf8')))) {
  errors.push('Social-preview text still contains old green accents');
}

/* Phase 1 redesign smoke checks: no invented search route or dead-end design navigation. */
const countryDirectory = pages.get(join(root, 'countries', 'index.html')) || '';
const guideDirectory = pages.get(join(root, 'guides', 'index.html')) || '';
if (!guideDirectory.includes('THE RELOCATION LIBRARY') || !guideDirectory.includes('rw-topic-grid')) errors.push('Redesigned relocation guides directory missing');
if (!countryDirectory.includes('data-country-search') || !countryDirectory.includes('data-country-filters')) errors.push('Destination search or region filter missing');
if ((countryDirectory.match(/<div\b[^>]*\bdata-country-result(?=[\s=>])/g) || []).length < countrySlugs.length) errors.push('Country directory does not expose all filterable guide cards');
if (!home.includes('action="/countries"') || !home.includes('name="q"')) errors.push('Homepage country search is not wired to the directory');
if (!home.includes('rw-newsletter-section') || !home.includes('rw-hero')) errors.push('Redesigned homepage sections missing');

// All nine expanded markets must have generated topic routes and evidence-first money research.
for (const slug of expandedCountrySlugs) {
  for (const topic of ['visas','taxes','salaries','cost-of-living','jobs','relocation-companies']) {
    const doc = pages.get(join(root,topic,slug,'index.html'));
    if (!doc) errors.push('Expanded market resource route missing: ' + topic + '/' + slug);
    else if (topic === 'visas' && !doc.includes('Work authorisation and long-term residence are different')) errors.push('Residence research missing from visa guide: ' + slug);
    else if (topic === 'salaries' && !doc.includes('No unsourced role-level pay numbers')) errors.push('Expanded country still relies on legacy salary range template: ' + slug);
    else if (topic === 'cost-of-living' && !doc.includes('These are research tasks')) errors.push('Expanded country still relies on historical rent figures: ' + slug);
  }
}

for (const slug of countrySlugs) {
  const txt = pages.get(join(root,'countries',slug,'index.html')) || '';
  if (!txt.includes('rw-country-detail-hero') || !txt.includes('rw-country-toc')) errors.push('Destination detail redesign missing: ' + slug);
  if (!txt.includes('id="residence"') || !txt.includes('rw-settlement-stages')) errors.push('Country residence pathway missing: ' + slug);
}

mkdirSync(resolve('reports'), { recursive: true });
writeFileSync(resolve('reports', 'external-links.txt'), [...external].sort().join('\n') + '\n');
console.log(`Checked ${pages.size} built HTML pages and ${checked} internal links; ${external.size} unique external destinations are listed in reports/external-links.txt`);
for (const warning of warnings) console.warn('WARNING: ' + warning);
for (const error of errors) console.error('ERROR: ' + error);
if (errors.length) process.exitCode = 1;
