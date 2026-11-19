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
const blogFiles = htmlFiles.filter((path) => path.includes('/blog/') && !path.includes('/blog/page/') && path !== join(root,'blog','index.html'));
const seoRelease = JSON.parse(readFileSync(resolve('src/data/seoRelease.json'), 'utf8'));
const evergreenRelease = JSON.parse(readFileSync(resolve('src/data/evergreenRelease.json'), 'utf8'));
const year3Release = JSON.parse(readFileSync(resolve('src/data/year3Release.json'), 'utf8'));
const expectedBlogCount = 9 + seoRelease.published.length + evergreenRelease.published.length + year3Release.published.length;
if (blogFiles.length !== expectedBlogCount) errors.push('Expected '+expectedBlogCount+' blog article pages, found ' + blogFiles.length);
const queuedSeoPosts = JSON.parse(readFileSync(resolve('src/data/seoQueue.json'), 'utf8'));
const {buildEvergreenArticles} = await import('../src/evergreenEditorial.mjs');
const evergreenFiles = ['01-career-and-preparation','02-travel-and-housing','03-money-health-family-culture-work','04-safety-digital-everyday-community'];
const evergreenSeeds = evergreenFiles.flatMap(name => JSON.parse(readFileSync(resolve('src/data/evergreen', name+'.json'),'utf8')));
const evergreenPosts = buildEvergreenArticles(evergreenSeeds);
const {buildYear3Articles} = await import('../src/year3Editorial.mjs');
const year3Files = ['01-careers-and-employment','02-flight-and-travel','03-housing-and-money','04-family-health-community','05-work-digital-safety','06-long-term-and-return'];
const year3Seeds = year3Files.flatMap(name => JSON.parse(readFileSync(resolve('src/data/year3', name+'.json'),'utf8')));
const year3Posts = buildYear3Articles(year3Seeds);
const scheduledDates = new Map([...queuedSeoPosts,...evergreenPosts,...year3Posts].map(post => [post.slug, post.date]));
const actualDates = {...(seoRelease.publishedAt||{}),...(evergreenRelease.publishedAt||{}),...(year3Release.publishedAt||{})};
for (const file of blogFiles) {
  const txt = pages.get(file);
  const slug = relative(root, file).split('/')[1];
  const expectedDate = actualDates[slug] ?? scheduledDates.get(slug) ?? '2026-09-26';
  if (!txt.includes(expectedDate) || (!txt.includes('Official resources') && !file.includes('how-to-find-visa-sponsor-jobs-abroad'))) {
    errors.push('Blog page lacks official sources or publication date: ' + relative(root, file));
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

const compactSpacingChecks = [
  ['Desktop section spacing', /\.rw-section\s*\{\s*padding:\s*clamp\(48px,\s*5\.2vw,\s*76px\)\s+0;/],
  ['Section heading spacing', /\.rw-section-head\s*\{[^}]*margin-bottom:\s*26px;/],
  ['Newsletter section spacing', /\.rw-newsletter-inner\s*\{[^}]*padding:\s*clamp\(48px,5vw,72px\)\s+0;/],
  ['Mobile section spacing', /@media\s*\(max-width:620px\)\s*\{[\s\S]*?\.rw-section\s*\{\s*padding:\s*42px\s+0;/]
];
for (const [label, pattern] of compactSpacingChecks) {
  if (!pattern.test(redesignCss)) errors.push(label + ' has unexpectedly reverted to oversized spacing');
}

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
const homeSource = readFileSync(resolve('src/pages/index.astro'), 'utf8');
if (!headerSource.includes('<svg class="rw-chevron"') ||
    headerSource.includes('<span class="rw-chevron"') ||
    !redesignCss.includes('.rw-nav-details[open] .rw-chevron { transform:rotate(180deg); }')) {
  errors.push('Countries dropdown does not use its aligned, reversible SVG chevron');
}
if (homeSource.includes('rw-visual-note') || homeSource.includes('rw-star-two') ||
    redesignCss.includes('.rw-visual-note') || redesignCss.includes('.rw-star-two')) {
  errors.push('Homepage hero still includes overlapping decorative text or a stray floating star');
}

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
// A single field-level focus ring prevents the native search input outline
// from crossing into the submit button when the user types a destination.
const countrySearchCssChecks = [
  ['field-level focus ring', /\.rw-country-search-field:focus-within\s*\{[^}]*border-color:#2563eb;[^}]*box-shadow:0 0 0 3px rgba\(37,99,235,\.15\);/],
  ['remove nested input focus outline', /\.rw-main \.rw-country-search-field input:focus-visible\s*\{\s*outline:none; box-shadow:none;/],
  ['prevent search button shrinking', /\.rw-country-search-field button\s*\{\s*flex:0 0 auto;[^}]*white-space:nowrap;/],
  ['preserve distinct submit keyboard focus', /\.rw-main \.rw-country-search-field button:focus-visible\s*\{\s*outline:2px solid #1e40af;/]
];
for (const [label, pattern] of countrySearchCssChecks) {
  if (!pattern.test(redesignCss)) errors.push('Country search ' + label + ' missing');
}

// Weekly Jobs evidence heading has one content column. The general two-column
// section-heading grid previously compressed it into five uneven lines.
const weeklyJobs = pages.get(join(root, 'jobs', 'free-preview', 'index.html')) || '';
if (!weeklyJobs.includes('weekly-evidence-section') || !weeklyJobs.includes('weekly-evidence-heading')) {
  errors.push('Weekly Jobs evidence heading lacks its full-width layout hook');
}
if (!/\.weekly-evidence-heading\s*\{\s*display:\s*block;/.test(redesignCss) ||
    !/\.weekly-evidence-heading\s+h2\s*\{[^}]*text-wrap:\s*balance;/.test(redesignCss)) {
  errors.push('Weekly Jobs evidence headline has reverted to narrow two-column wrapping');
}

// Weekly Jobs must work as an uncluttered Substack landing, not repeat
// all 14 country cards or leave the subscribe CTA cramped against text.
const weeklyLandingSource = readFileSync(resolve('src/pages/jobs/free-preview.astro'), 'utf8');
if (!headerSource.includes("const isWeeklyLanding = path === '/jobs/free-preview';") ||
    !headerSource.includes('isWeeklyLanding ? "Subscribe" : "Read the newsletter"') ||
    !headerSource.includes('rw-header-weekly')) {
  errors.push('Weekly Jobs header has lost the contextual Subscribe CTA');
}
if (!weeklyJobs.includes('Subscribe on Substack') ||
    !weeklyJobs.includes('href="#how-we-research"') ||
    !weeklyJobs.includes('rw-weekly-bottom-actions')) {
  errors.push('Weekly Jobs landing is missing its primary or closing subscriber action');
}
if (!weeklyLandingSource.includes("const featuredCountries = countries.filter") ||
    weeklyLandingSource.includes('otherCountries.map(') ||
    !weeklyJobs.includes('Browse all 14 country guides')) {
  errors.push('Weekly Jobs guide links no longer use the compact featured-country treatment');
}
if (!/\.weekly-evidence-section > \.container\.narrow \{ max-width: 1160px; \}/.test(redesignCss) ||
    !/\.weekly-evidence-heading h2\s*\{[^}]*font-size:\s*clamp\(2\.1rem,\s*2\.65vw,\s*2\.75rem\)/.test(redesignCss)) {
  errors.push('Weekly Jobs evidence title has regressed to oversized narrow-column wrapping');
}
if (!/\.rw-weekly-bottom-actions\s*\{\s*display:grid;justify-items:start;gap:19px;/.test(redesignCss)) {
  errors.push('Weekly Jobs closing subscription button is no longer spaced from supporting content');
}
if (!/\.rw-header\.rw-header-weekly \.rw-header-cta\s*\{[^}]*display:inline-flex;/.test(redesignCss)) {
  errors.push('Weekly Jobs subscribe control disappeared from mobile navigation');
}

const countryDirectory = pages.get(join(root, 'countries', 'index.html')) || '';
const guideDirectory = pages.get(join(root, 'guides', 'index.html')) || '';
if (!guideDirectory.includes('THE RELOCATION LIBRARY') || !guideDirectory.includes('rw-topic-grid')) errors.push('Redesigned relocation guides directory missing');
if (!countryDirectory.includes('data-country-search') || !countryDirectory.includes('data-country-filters')) errors.push('Destination search or region filter missing');
if ((countryDirectory.match(/<div\b[^>]*\bdata-country-result(?=[\s=>])/g) || []).length < countrySlugs.length) errors.push('Country directory does not expose all filterable guide cards');
if (!home.includes('action="/search"') || !home.includes('name="q"')) errors.push('Homepage site search is not wired to the searchable library');
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

// AI discovery pages must stay distinct from verified vacancies and preserve referral attribution.
const aiSource = readFileSync(resolve('src/data/aiOpportunities.ts'), 'utf8');
const aiSlugs = [...aiSource.matchAll(/category\('([^']+)'/g)].map(match => match[1]);
const aiPaths = ['remote-ai-jobs', ...aiSlugs.map(slug => 'remote-ai-jobs/' + slug)];
const aiTitles = new Set();
const sitemap = readFileSync(resolve(root, 'sitemap-0.xml'), 'utf8');
for (const path of aiPaths) {
  const html = pages.get(join(root, path, 'index.html'));
  if (!html) throw new Error('AI page missing: ' + path);
  if ((html.match(/<h1\b/g) || []).length !== 1) throw new Error('AI page must have one H1: ' + path);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  if (!title || aiTitles.has(title)) throw new Error('Duplicate or missing AI title: ' + path);
  aiTitles.add(title);
  if (!html.includes('https://relocateworks.com/' + path) || !sitemap.includes('https://relocateworks.com/' + path)) throw new Error('AI canonical or sitemap missing: ' + path);
  if (!html.includes('Independent information. Transparent referrals.') || !html.includes('BreadcrumbList')) throw new Error('AI disclosure or breadcrumbs missing: ' + path);
  if (html.includes('"@type":"JobPosting"')) throw new Error('Discovery guides must not use JobPosting: ' + path);
  for (const tag of html.matchAll(/<a\b[^>]*href="https:\/\/t\.mercor\.com\/[^>]+>/g)) {
    if (!/rel="[^"]*sponsored/.test(tag[0]) || !tag[0].includes('noopener') || !tag[0].includes('noreferrer')) throw new Error('Referral link attributes missing: ' + path);
  }
}
const expectedCodes = ['4sRpZ','LxJlJ','TFrS8','g7ct2','Qt0mR','JVgnY','E3LlQ','wuOOr','7tJpq','NGl8o','62IxC','MIb1m','rZIzD','UqJP0'];
for (const code of expectedCodes) if (!aiSource.includes('https://t.mercor.com/' + code)) throw new Error('Owner referral code missing: ' + code);
for (const path of ['jobs/index.html','jobs/free-preview/index.html','index.html']) {
  if (!pages.get(join(root,path))?.includes('/remote-ai-jobs')) throw new Error('AI navigation missing from ' + path);
}
console.log(`AI discovery checks passed for ${aiPaths.length} routes and ${expectedCodes.length} configured referral links.`);

// Shared brand normalization must cover HTML metadata and JSON-LD on every route.
const brandName = 'Relocate Works & Remote AI Works';
for (const [file, html] of pages) {
  const title = decodeHtml(html.match(/<title>(.*?)<\/title>/)?.[1] || '');
  if (/Relocate Works/.test(title) && !title.includes(brandName)) throw new Error('Old brand in title: ' + file);
  for (const tag of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const graph = JSON.parse(tag[1]);
    if (!graph.some(item => item['@type'] === 'Organization' && item.name === brandName)) throw new Error('Organization brand missing: ' + file);
  }
  if (!html.includes('Remote AI Works</span>')) throw new Error('Expanded visible brand missing: ' + file);
}
if (!decodeHtml(home).includes('RELOCATION & REMOTE AI OPPORTUNITIES')) throw new Error('Homepage does not communicate both career paths');
console.log('Expanded site brand checks passed across all built pages.');

// Research participation has a flat completion fee and must never become an hourly job claim.
const studyRoute = 'remote-ai-jobs/opportunities/stanford-youth-study-us-parents-kids';
const studyHtml = pages.get(join(root, studyRoute, 'index.html'));
if (!studyHtml) throw new Error('Youth study article missing');
for (const required of ['USD $110 total', 'paid once on completion', 'active SIM', 'January', 'does not specify the year', 'https://t.mercor.com/OhmJc', 'not been independently confirmed']) {
  if (!studyHtml.includes(required)) throw new Error('Study information missing: ' + required);
}
if (studyHtml.includes('"@type":"JobPosting"') || /\$110\s*\/\s*hour/.test(studyHtml)) throw new Error('Research study misrepresented as hourly employment');
for (const path of ['remote-ai-jobs', 'remote-ai-jobs/research']) {
  if (!pages.get(join(root, path, 'index.html'))?.includes('/' + studyRoute)) throw new Error('Research study discovery link missing: ' + path);
}
if (!sitemap.includes(studyRoute)) throw new Error('Research study absent from sitemap');
console.log('Youth study accuracy, discovery and sitemap checks passed.');
