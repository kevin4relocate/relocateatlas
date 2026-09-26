# Phase 1 redesign: component guide and release QA

The site remains an **informational relocation research library**. Active vacancies, dated job roundups and direct employer application links belong exclusively to the separate Substack publication. Do not generate mock vacancy listings or promise a job sponsorship outcome anywhere on this site.

## Design architecture

- `src/styles.css`: legacy styling for existing informational routes; retained for compatibility.
- `src/redesign.css`: Phase 1 editorial design tokens, masthead, footer, responsive homepage, country directory and country guide styles. Prefix all new styles with `rw-` to avoid regressions. Imported *after* legacy styles in `BaseLayout.astro`.
- `src/components/Header.astro`: main navigation; native HTML `<details>` for destination picker, keyboard and outside-click support. Mobile menu uses the existing layout menu controller.
- `src/components/TopicLinks.astro`: shared topic links with real, crawlable destination URLs, used in homepage, guide index and country details.
- `src/components/CountryCard.astro`: destination card. No unverified rankings, sponsor scores or fabricated eligibility claims.
- `src/components/CountryGuideHero.astro`: country hero and verified *starting point* link from `src/countryEditorial.ts`; does **not** imply that older numerical statements are independently audited.
- `src/pages/guides/index.astro`: new directory for existing informational research topics.
- `src/pages/countries/index.astro`: client-side filter by country, region, city and popular career sectors. The HTML contains all countries and direct links for users without JavaScript.

## Automated release checks

```bash
npm ci
npm run build
npm run check:site
```

The QA script checks all generated internal routes and same-page anchors. New smoke assertions cover the home destination search form, guide directory, all 10 country filter tiles and guide hero/topic navigation. All `check:site` checks must pass on the **final** PR SHA.

## Manual preview acceptance checklist

This phase needs manual browser checks on a real Cloudflare Preview deployment **before merging to `main`**. CI does not run visual/browser interaction tests. Do not report these as complete unless actually carried out.

- At widths **320, 375, 768, 1024 and 1440 px**, verify no horizontal scroll, clipped hero search input, off-screen dropdown, card overlap or overlapping sticky sidebar.
- Use **keyboard only** to open/close the Countries dropdown (`Enter`/`Space` and `Esc`), follow links and use visible focus indicators.
- On mobile open and close the drawer via both the hamburger, the inner close button and `Esc`; verify scroll locking, return focus, keyboard trap and all visible links.
- From the homepage search **New Zealand**, **Dublin** and **QA Engineer**; the GET form navigates to the directory and displays corresponding matches. Test a no-match term, clear the filter and switch between region chips.
- Directly load all 10 overview country URLs, follow the new section-jump tiles and navigate from the sticky menu. Confirm the official reference links are visible.
- Check home cards, `/guides`, `/countries`, an individual country guide and the existing `/visas/{country}`, `/jobs/{country}` on both desktop and mobile.
- Click Weekly Jobs and newsletter links: the website explains the publication, and actual dated opportunities remain on Substack. Do not add on-site sample/live jobs.
- Run Lighthouse on homepage, directory and a country detail page in mobile configuration; record measured **LCP, CLS, INP and accessibility** instead of inventing scores.
- Verify social share image in actual external previews when practical (SVG OG compatibility varies), and visually review the complete production deployment after merging.

## Scope boundary

This PR does **not** add new countries, validate historic visa thresholds or costs, add a job database, or migrate to a new framework. Country editorial depth is the next content-focused phase.
