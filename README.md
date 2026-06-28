# RelocateAtlas Astro Website

RelocateAtlas is a static Astro website for visa sponsor jobs, country guides, industry guides, relocation resources, and Substack conversion.

## What is included

- Astro static site
- SEO layout with title, description, canonical URL, robots meta, Open Graph, Twitter cards, Organization schema, WebSite schema, page-level schema
- Sitemap via `@astrojs/sitemap`
- RSS feed at `/rss.xml`
- Robots file at `/robots.txt`
- `llms.txt`
- Cloudflare `_headers`
- Responsive desktop and mobile navigation
- Countries dropdown
- Industries dropdown
- Country guide pages
- Industry guide pages
- Resource landing pages: Visas, Taxes, Salaries, Cost of Living, Relocation Companies, Jobs
- Country-specific resource pages
- Cookie notice
- Scroll-to-top button
- Smooth anchor navigation
- LinkedIn, Facebook, and Substack links
- Founding pricing copy: `$9/month` and `$49/year`

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Cloudflare Pages

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`

## Important setup after domain is ready

Update these values:

- `src/data.ts` → `SITE.url`
- `astro.config.mjs` → `site`
- `public/robots.txt` → sitemap URL

## Content warning

The current country, visa, tax, salary, cost of living, and industry content is starter editorial content. Before commercial launch, verify any factual or time-sensitive data with official sources.
