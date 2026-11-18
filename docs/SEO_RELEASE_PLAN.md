# Relocate Works SEO publication plan — 100 articles

- **Total:** 100 fully drafted English articles.
- **Start:** 2026-11-20 (Asia/Bangkok).
- **Cadence:** 1 new article every 3 calendar days, through 2027-09-13.
- **Themes:** 70 country-specific guides (14 countries × 5 specific reader questions); 30 industry guides (6 sectors × 5 distinct career decisions).
- **Source standard:** Every article has official government/reference links and internal related guides. Sources are research starting points, not verification that an individual is eligible, an employer is hiring or a price is current.
- **Release state:** src/data/seoRelease.json. Initial published list is empty; no draft pages appear in HTML, sitemap or RSS before their slot.
- **Editorial queue:** src/data/seoQueue.json. Release sequence and per-article dates are explicit.
- **Automation:** .github/workflows/publish-seo.yml runs daily 07:17 Asia/Bangkok, releases **at most one** eligible article; if a day is missed it catches up one article per next successful run.
- **Deployment:** GitHub Actions writes the published manifest to main after build and QA pass. Cloudflare Pages Git integration should then deploy that commit (verify after first scheduled run).
- **Manual trigger:** workflow_dispatch is available for testing, but it **does not bypass** the date gate. Run \`npm run release:seo -- --dry-run --date=2026-11-20\` to simulate eligibility without publishing.
- **Review policy:** Sources, legal rules, taxes, salary and employer conditions can change. Recheck official destinations and specifics before relying on these articles, especially on topics published months after drafting. No current-vacancy claims.
- **Safety:** Never commit unverified pay ranges, invented government requirements or automatically paid applications. Articles can be paused by disabling workflow or removing scheduled release from main.
- **SEO note:** Publication volume is not an SEO guarantee. Every article must add practical reader value; monitor indexing, thin/repetitive content and search performance rather than publishing variations solely for ranking.

## Standard QA

\`\`\`bash
npm ci
npm test
npm run build
npm run check:site
npm run check:seo
\`\`\`

The QA checks exact count, dates, slug uniqueness, article completeness, source links, internal links and no unintended early exposure. External source URLs can change; use manual editorial verification rather than interpreting automated 403/429 responses as proof they are dead.
