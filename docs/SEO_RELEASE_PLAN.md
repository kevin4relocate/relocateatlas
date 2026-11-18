# Relocate Works editorial calendar — 100 SEO + 200 evergreen guides

## Release lanes

| Track | Articles | First release (Asia/Bangkok) | Cadence | Final planned date |
| --- | ---: | --- | --- | --- |
| Country and industry SEO | 100 | 2026-11-20 | Every 3 days | 2027-09-13 |
| Practical evergreen relocation | 200 | 2026-11-21 | Every 3 days | 2028-07-10 |

The original lane is planned on November 20, 23, 26 and every third day afterward. The evergreen lane is planned November 21, 24, 27 and every third day afterward. November 22, 25, 28 and the corresponding third-day slots are intentionally free. No two articles share a scheduled day. A missed run catches up only in its lane and releases at most one article per day.

The GitHub Action in .github/workflows/publish-seo.yml checks daily at 07:17 Asia/Bangkok. It commits one release manifest after passing full build and QA. Cloudflare must be connected to main for production deployment. Confirm first runs after scheduling.

## Content

Original SEO queue: src/data/seoQueue.json (100 original country and industry guides). Manifest: src/data/seoRelease.json.

Practical evergreen briefs: four JSON batches in src/data/evergreen/ containing exactly 200 unique titles, specific actions, pitfalls, and intended reader outputs. Content renderer: src/evergreenEditorial.mjs. Manifest: src/data/evergreenRelease.json.

Evergreen categories include international job search, CV, interviewing, offers, documents, flights, airports, baggage, first week, housing, money, health, family and pets, language, work culture, scams, digital setup, daily life, social belonging and long-term plans.

Drafts are excluded from blog routes, homepage, search, sitemap and RSS until the manifest marks them published. A live article uses the actual publication date even if its scheduled slot was missed.

## Editorial and release quality

Every new article has a separate practical topic brief, five sections, a checklist, source starting points and links to related tools or guides. These are practical educational guides, not firsthand relocation testimonials. Reference URLs are broad official sources and should not be presented as verifying every sentence. Review content for repetitiveness, topical relevance, current rules and human usefulness before publication, especially since the queue extends to 2028.

Automated CI validates 300 different titles, slugs and dates; minimum body length; sections; links; and absence of future URLs from HTML, sitemap and RSS. It simulates one release from each lane on adjacent dates. These tests are not a substitute for human editorial review or external link verification.

Run: npm ci && npm test && npm run build && npm run check:site && npm run check:seo

Pause by disabling the scheduled GitHub Action or editing a release manifest. Manual workflow dispatch respects date gates. GitHub Actions may run later than its cron time, and production publishing depends on Cloudflare deployment after each main commit.
