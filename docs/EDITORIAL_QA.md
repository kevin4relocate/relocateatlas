# Relocate Works: editorial and website QA

**Business model:** Relocate Works is an **information website** covering the 10 destination countries. Dated relocation vacancy roundups and individual application links are published **only on Substack**.

## Editing checklist

1. Use original government and regulator references for legal, tax, healthcare and school requirements. Never infer visa support from an employer being licensed, accredited or globally active.
2. Any salary, rent, fee, tax bracket or eligibility threshold requires a clear applicable period, population and primary source. If verification cannot be completed, use general planning language rather than publishing a supposedly current numerical fact.
3. Each article needs a distinct reader question, practical action steps, suitable internal reading links and relevant primary-source links. The blog template reads unique data from `src/blogEditorial.ts`; the original long-form sponsorship guide remains a separate authored page.
4. Country overview templates use `src/countryEditorial.ts` for country-specific visa, money, arrival and family checklists. Its links are **official starting points**, not evidence that every sentence of a separate historical guide is current. Treat existing numeric tables in `src/data.ts` and `CountryResourcePage.astro` as **illustrative planning scenarios pending market-data verification**, not official averages.
5. Use two clear newsletter classifications: **Confirmed** requires explicit support wording in the individual vacancy; **Potential** uses independently documented employer-level international recruitment evidence and does not promise support for that role. The site itself must not pretend to host live jobs.

## Release quality checks

Run after every editorial/code update:

```sh
npm ci
npm run build
npm run check:site
```

The site audit checks generated internal routes and anchors, all 10 country guide pages, all 9 distinct blog article pages, presence of SEO metadata and absence of fabricated home-page job scores. The GitHub Actions workflow runs these steps on pushes and PRs.

The route auditor also writes `reports/external-links.txt`. Live external verification is deliberately **separate and non-blocking**, because some official sites rate-limit or deny automated requests:

```sh
npm run check:external
npm run check:external -- --limit=30
```

Read `reports/external-status.tsv` after running. **Do not treat 403/429/timeouts as broken links.** Even a 200 response can be a login gate, a generic fallback or a closed job. For material sources, open the page in a normal browser and read its content.

## Manual checks before deployment

- Open the home page, country index, each country guide, visa/tax/salary/healthcare sub-guides, industry pages, blog posts, subscription information and privacy/terms on phone/tablet/desktop viewports.
- With keyboard only: open and close the mobile menu, use Tab and Shift+Tab, use Escape, follow article table-of-contents anchors and verify visible focus.
- Confirm latest subscription prices, payment availability and paid/free entitlements **on the actual Substack publication** before advertising a price as currently active.
- Review numerical cost/rent/salary/visa statements against government and reputable dated original sources. Document the source, applicable year and reviewer; do not reuse 2026 amounts in later years without rechecking.
- Check a representative set of official source links in the actual deployed site. The P1 review sampled principal immigration pages for 10 countries and tax/health references for a number of countries; this is **not** an exhaustive external or factual audit.
- Measure Lighthouse mobile/desktop performance on a Cloudflare preview deployment. Source-level mobile adjustments are not a substitute for real device, visual or performance testing.
- Replace the current SVG Open Graph default with an appropriately sized PNG/JPG if social-platform previews do not render it reliably; do not change the asset path without testing previews.

**Operational caution:** Merge P0 first, then P1 (P1 is a stacked branch based on P0). PRs are for review, not automatic production deployment.
