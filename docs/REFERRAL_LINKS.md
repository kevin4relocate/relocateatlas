# Referral link manager

The owner workspace is `/admin/referrals`. It is excluded from the sitemap and marked noindex. A visitor can load the login screen, but the server requires a private admin key before returning or changing any saved link or statistics. The key is held in tab memory only. Reloading or locking the workspace clears it.

Public links use `/go/<slug>`. For example, create the slug `alignerr-agentic-coding`, paste the complete Alignerr URL, and copy the generated links. The LinkedIn link ends in `?src=linkedin` and the Facebook link ends in `?src=facebook`. Put these different URLs in the corresponding prepared social posts. The original destination is stored unchanged, including its referral-code, program and referralJobId parameters. Query parameters on the short URL cannot replace the saved referral parameters.

## One-time Cloudflare Pages setup

This repository builds static Astro pages plus Cloudflare Pages Functions. Deploy through the existing Cloudflare Pages Git integration so the root `functions/` directory is included. An upload of only the static `dist/` folder does not deploy these Functions.

1. In Cloudflare, create a D1 database named `relocateworks-referrals`.
2. In its SQL console, execute `migrations/referrals.sql` from this repository. The schema is additive and safe to apply again.
3. In the existing Pages project, open Settings, Bindings and add a D1 binding named `REFERRAL_DB` pointing to that database. Use the production environment. Use a separate database for previews.
4. Generate a random admin key using a password manager, at least 32 characters and at most 256. Add it as an encrypted Pages secret named `REFERRAL_ADMIN_TOKEN`. Keep it out of Git, URLs and public build variables. There is no `PUBLIC_` prefix. Save the key in your password manager.
5. Redeploy the Pages project after adding the binding and secret.
6. Open `https://relocateworks.com/admin/referrals` and enter the key. Create a job link, then copy the channel links.

Until the database, schema and key are configured, the manager returns a setup error and cannot create links. Existing static site pages continue to work. To rotate the key, replace the secret and redeploy. Old keys immediately fail on subsequent API requests to the new deployment.

The default destination hosts are `app.alignerr.com`, `alignerr.com`, `www.alignerr.com`, `t.mercor.com`, `mercor.com`, `www.mercor.com` and `work.mercor.com`. If another provider is needed, set the server environment variable `REFERRAL_ALLOWED_HOSTS` to the complete comma-separated list of allowed hostnames. Only HTTPS destinations without embedded credentials or a nonstandard port are accepted.

## Using the workspace

- Enter the job title and original referral URL. The title suggests a slug, which you can edit before saving. Duplicate slugs are rejected.
- Copy the General, LinkedIn, Facebook or Website short link. The copy action itself does not visit or count the link.
- Edit an existing record to change its title or destination, or pause it. Its slug and accumulated counters remain stable. A paused link returns an unavailable response instead of redirecting.
- Refresh the dashboard to read the latest statistics. Export CSV to save the job names, URLs and channel totals.
- Keep a referral disclosure in your prepared social content when using a short link.

## Counting and verification

Counts are GET redirect requests, aggregated by job, UTC day and one of four source labels. HEAD requests, explicit prefetches and common identifiable bots or link previews are excluded. Some bots cannot be distinguished from people, and repeated visits are counted. Source labels can be copied or changed by visitors. These are approximate click counts, not unique visitors, applications, signups or referral earnings.

No IP address, visitor cookie or user-agent string is stored in the referral database. The user-agent and purpose headers are inspected transiently for preview filtering. A failed counter write does not interrupt the redirect. A missing database or failed destination lookup produces a temporary-unavailable response. Redirects use 302 with no-store so later edits and pauses take effect.

Run `npm run test:referrals`, `npm run build` and `npm run check:site`. The API tests use Node’s built-in SQLite with the same migration SQL. They cover authentication, unauthorized origins, URL validation, duplicate slugs, query preservation, concurrency, preview filtering and paused links. A production check with the configured D1 binding is still required after deployment. The Astro dev server serves the admin interface but does not run Pages Functions.

Cloudflare references

- https://developers.cloudflare.com/pages/functions/bindings/
- https://developers.cloudflare.com/pages/functions/routing/
- https://developers.cloudflare.com/pages/functions/get-started/
