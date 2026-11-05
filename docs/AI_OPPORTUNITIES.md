# AI Opportunities expansion

## Architecture audit and implementation

The existing site is Astro static generation with shared Header, Footer and BaseLayout, global styles, country/topic data, sitemap integration, and a GitHub Actions build/site audit. `/jobs` is a country research directory; `/jobs/free-preview` is the Substack landing page. Both are preserved. No dependencies, deployment settings, database, backend, newsletter destinations or existing guide implementations changed.

The new section reuses BaseLayout metadata, canonical/OG tags, shared navigation and the navy/blue brand. One dynamic static route generates category pages from typed data. It adds BreadcrumbList, but no JobPosting markup because no individual vacancies have been verified. Sitemap integration automatically includes the new routes.

## Created files

- `src/data/aiOpportunities.ts`: all 14 owner-supplied referral destinations, partner configuration, 14 discovery categories, typed individual opportunity schema and empty verified listing collection.
- `src/components/AIOpportunitiesPage.astro`: shared landing/category implementation, progressively enhanced search, application guidance, related fields and FAQ.
- `src/components/AIOpportunityCard.astro`: reusable individual verified opportunity presentation.
- `src/components/ReferralDisclosure.astro`: independent referral disclosure.
- `src/pages/remote-ai-jobs/index.astro`: main landing.
- `src/pages/remote-ai-jobs/[category].astro`: data-driven category routes, including all seven requested categories and the remaining supplied specialties.
- `src/ai-opportunities.css`: responsive section styling, focus indicators and hidden-state support.
- `docs/AI_OPPORTUNITIES.md`: implementation, operation and QA notes.

## Modified files

- `src/components/Header.astro`: AI Opportunities in desktop and mobile navigation.
- `src/components/Footer.astro`: AI discovery link.
- `src/pages/about.astro`, `contact.astro`, `privacy.astro`, `terms.astro`, `disclaimer.astro`: concise scope, referral, privacy and application support information; updated policy dates where present.
- `scripts/check-site.mjs`: checks all AI routes, unique titles, one H1, sitemap/canonical, breadcrumbs, disclosures, no JobPosting on discovery guides, referral security/monetization attributes, configured link codes and navigation.

## Referral management

Update `referralPartners` centrally. General 1 is the main exploration fallback; General 2 is used in application guidance. Specific categories use the corresponding supplied industry destination. QA and AI Training explicitly use general links. Research explicitly links to Life, Physical & Social Sciences. Category CTAs say “Explore on Mercor,” rather than claiming to apply to a specific role.

Referral links open in a new tab with `sponsored noopener noreferrer`. Links are stored exactly as supplied; no tracking query parameters are appended. These are owner-supplied destinations, not independently certified partner agreements.

## Adding verified opportunities

The collection is intentionally empty. Add only genuine official individual listings after verifying title, scope, qualifications, experience, country eligibility, pay/units, contract classification and availability. Set `lastVerified` only after an actual check, and mark closed roles `closed` to exclude them. Use `null` for undisclosed fields; the UI gives explicit official-check/Not disclosed fallbacks. The original URL is the individual official listing; the referral key must resolve through the central configuration. The schema supports partners through `partnerId`; adding a partner also requires adding its typed configuration and extending referral-key typing when its keys differ.

This version has category routes and individual cards, not individual vacancy detail pages. Add detail routes and evaluate JobPosting eligibility only when genuine listings are available.

## Analytics

No analytics provider or credentials were configured, so no new collection or network tracking was added. No application-click counts, conversions, partner attribution, hires or payouts are claimed. Configure an approved privacy-conscious provider and update notices before adding collection; obtain conversions/payouts from actual partner reporting. Clicks must remain distinct from referrals and paid conversions.

## QA — November 5, 2026

Passed:
- `npm ci` using the existing lockfile (214 packages installed).
- `npm run build`: 147 generated pages, including 15 new AI routes.
- `npm run check:site`: 12,793 internal links checked, existing guide/newsletter checks passed, all 15 AI routes and 14 configured referral URLs passed static checks.
- No production configuration, dependency manifests or existing country/job guide route sources changed.

Unresolved/manual:
- All 14 shortlinks returned HTTP 403 to this environment. Browser-search retrieval of two sample shortlinks also failed. Redirect destinations, category routing, partner terms, attribution and reward conditions have NOT been verified. This is not evidence that the links are broken for normal visitors.
- Desktop/mobile browser execution could not run because Chromium is not installed and browser downloads were unavailable. Responsive CSS and semantic/accessibility hooks are implemented, but visual layout, menu/search interaction and keyboard behavior still require a real browser check.
- Verify permission for commercial referral promotion, exact referral conditions, attribution and brand use before public launch or paid acquisition.
- No production deployment or merge is included. Any Cloudflare branch-preview behavior is controlled by the repository’s existing external integration.
