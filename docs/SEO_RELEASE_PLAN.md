# Relocate Works — 665 evergreen and SEO articles in three scheduled queues

## Timeline (Asia/Bangkok)

| Editorial queue | Articles | First publication | Frequency | Final planned publication |
| --- | ---: | --- | --- | --- |
| Original relocation SEO | 100 | 2026-11-20 | Every 3 days | 2027-09-13 |
| Relocation experiences evergreen | 200 | 2026-11-21 | Every 3 days | 2028-07-10 |
| Next-year practical evergreen | 365 | 2028-07-11 | Daily | 2029-07-10 |

All dates are planned dates; if scheduled delivery is delayed, articles use the actual publication date in visible HTML, structured data and RSS. The third-year queue cannot start until both earlier release manifests are complete. The runner publishes at most one article per invocation.

## Content structure

- `src/data/seoQueue.json`: 100 original research guides; live state `src/data/seoRelease.json`.
- `src/data/evergreen/`: 200 relocation experience briefs; builder `src/evergreenEditorial.mjs`; live state `src/data/evergreenRelease.json`.
- `src/data/year3/`: 365 evergreen long-tail topic briefs in six batches, with a unique problem, two actions, a pitfall, and a concrete reader deliverable per page.
- `src/year3Editorial.mjs`: compiles each new brief into an English guide, a descriptive headline, unique search description, six sections, structured checklists, source references and internal links.
- `src/data/year3Release.json`: separate daily queue status, with `publishedAt` recording actual release dates.
- `src/seoPublished.ts` is the only way unfinished articles enter the blog. Drafts are excluded from generated blog pages, homepage, site search, sitemap and RSS.

## Publishing and editorial standards

The 365-article series covers international job research, recruitment safety, interviews and salary negotiations, air travel, luggage, shipping, renting, finances, family, healthcare, workplace integration, digital security, local mobility, personal wellbeing, long-term plans, return migration and moving a second time.

The 365 guides have detailed topic-specific editorial briefs and share a structured educational framework. They are **automatically assembled drafts**, not first-person accounts by real relocated people and not individually fact-checked expert articles. Sources are authoritative starting points, not proof of every statement or legal eligibility.

**Important SEO safeguard:** Google prioritises original, people-first help and warns that large-scale production of low-value, repetitive pages can breach its scaled content abuse policy. Before the third-year launch, review thematic duplication, genuinely distinct usefulness, language quality, current links and firsthand examples where available. Pause or improve the queue rather than publishing weak pages solely to hit a daily target.

Technical checks guarantee 665 distinct slugs, titles and non-overlapping planned dates, source-link presence, a minimum substantive length, unique descriptions, no premature URLs, and correct datePublished on tested releases. Technical SEO does not guarantee rankings or indexing. Monitor Google Search Console after real deployment.

GitHub workflow `.github/workflows/publish-seo.yml` checks every day at **07:17 Asia/Bangkok**; it only changes the correct manifest and commits to main after full build and QA. Cloudflare Pages production deployment depends on its connected Git integration.

## Verification

Run locally: `npm ci && npm test && npm run build && npm run check:site && npm run check:seo`.

The site quality workflow simulates original Nov 20, 2026; evergreen Nov 21, 2026; empty slot Nov 22; and next-year Jul 11, 2028 after completing older queues in an isolated CI checkout. It verifies the new route is in blog, site search, RSS and sitemap while the other 364 future URLs remain hidden.

## Pause or change cadence

Disable `Scheduled Relocate Works editorial release` in GitHub Actions. Manual `workflow_dispatch` also respects the date gate. Do not publish future drafts by directly adding them to public route listings. Confirm legal, financial and health details with the correct current authorities before publishing.
