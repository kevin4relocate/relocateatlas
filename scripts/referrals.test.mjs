import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { onRequest as admin } from '../functions/api/referrals.js';
import { onRequest as redirect } from '../functions/go/[slug].js';
import { authorized, validDestination } from '../server/referrals.js';

const token = 'test-only-admin-key-with-at-least-32-characters';
const destination = 'https://app.alignerr.com/signin?referral-code=owner&program=program-1&referralJobId=job-1&keep=a%2Bb#apply';

function database() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../migrations/referrals.sql', import.meta.url), 'utf8'));
  return {
    db,
    prepare(sql) {
      const statement = db.prepare(sql);
      let args = [];
      return {
        bind(...values) { args = values; return this; },
        async first() { return statement.get(...args) || null; },
        async all() { return { results: statement.all(...args) }; },
        async run() { return { meta: statement.run(...args) }; },
      };
    },
  };
}

function fixture() {
  const store = database();
  const env = { REFERRAL_DB: store, REFERRAL_ADMIN_TOKEN: token };
  const api = (method = 'GET', body, authorization = token, origin = 'https://relocateworks.com') => admin({
    env,
    request: new Request('https://relocateworks.com/api/referrals', {
      method,
      headers: { Authorization: `Bearer ${authorization}`, Origin: origin, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  });
  const link = { slug: 'alignerr-agentic-coding', title: 'Agentic Coding', destination, active: true };
  async function visit({ slug = link.slug, method = 'GET', source = 'linkedin', userAgent = 'Mozilla/5.0', purpose = '' } = {}) {
    const tasks = [];
    const result = await redirect({
      env,
      params: { slug },
      request: new Request(`https://relocateworks.com/go/${slug}?src=${source}&referral-code=attacker`, { method, headers: { 'User-Agent': userAgent, Purpose: purpose } }),
      waitUntil(task) { tasks.push(task); },
    });
    await Promise.all(tasks);
    return result;
  }
  return { store, env, api, link, visit };
}

test('admin data and writes require a strong configured key', async () => {
  const { api, link } = fixture();
  assert.equal((await api('GET', undefined, 'wrong-key')).status, 401);
  assert.equal((await api('POST', link, 'wrong-key')).status, 401);
  assert.equal(await authorized(new Request('https://example.com'), token), false);
  assert.equal(await authorized(new Request('https://example.com', { headers: { Authorization: 'Bearer short' } }), 'short'), false);
  assert.equal((await admin({ request: new Request('https://example.com'), env: {} })).status, 503);
});

test('authenticated cross-origin writes are rejected', async () => {
  const { api, link } = fixture();
  assert.equal((await api('POST', link, token, 'https://untrusted.example')).status, 403);
});

test('destinations reject off-domain, insecure and credential-bearing URLs', () => {
  assert.equal(validDestination(destination), true);
  for (const url of ['http://app.alignerr.com/signin', 'https://app.alignerr.com.evil.example/', 'https://owner:password@app.alignerr.com/', 'javascript:alert(1)', 'https://app.alignerr.com:8080/', 'https://app.alignerr.com/\n']) assert.equal(validDestination(url), false, url);
});

test('create and edit preserve the entire original referral URL and stats', async () => {
  const { api, link, visit } = fixture();
  assert.equal((await api('POST', link)).status, 201);
  const result = await visit();
  assert.equal(result.status, 302);
  assert.equal(result.headers.get('Location'), destination);
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
  assert.equal((await api('PATCH', { ...link, title: 'Updated title' })).status, 200);
  const { links } = await (await api()).json();
  assert.equal(links[0].destination, destination);
  assert.equal(links[0].clicks, 1);
  assert.equal(links[0].linkedin, 1);
  assert.equal(links[0].title, 'Updated title');
});

test('duplicate slugs cannot overwrite an existing destination', async () => {
  const { api, link } = fixture();
  await api('POST', link);
  assert.equal((await api('POST', { ...link, destination: 'https://t.mercor.com/another' })).status, 409);
  const { links } = await (await api()).json();
  assert.equal(links.length, 1);
  assert.equal(links[0].destination, destination);
});

test('invalid slugs, missing fields and nonexistent edits fail without writes', async () => {
  const { api, link } = fixture();
  assert.equal((await api('POST', { ...link, slug: '../admin' })).status, 400);
  assert.equal((await api('POST', { ...link, title: '' })).status, 400);
  assert.equal((await api('PATCH', link)).status, 404);
  assert.equal((await api('POST', null)).status, 400);
  assert.equal((await api('POST', { ...link, active: 'false' })).status, 400);
});

test('bot previews, prefetches and HEAD requests redirect without counting', async () => {
  const { api, link, visit } = fixture();
  await api('POST', link);
  for (const options of [{ method: 'HEAD' }, { userAgent: 'facebookexternalhit/1.1' }, { userAgent: 'LinkedInBot' }, { purpose: 'prefetch' }]) assert.equal((await visit(options)).status, 302);
  const { links } = await (await api()).json();
  assert.equal(links[0].clicks, 0);
});

test('concurrent increments retain counts and classify unknown channels as other', async () => {
  const { api, link, visit } = fixture();
  await api('POST', link);
  await Promise.all(Array.from({ length: 20 }, () => visit({ source: 'facebook' })));
  await visit({ source: 'untrusted-source' });
  const { links } = await (await api()).json();
  assert.equal(links[0].clicks, 21);
  assert.equal(links[0].facebook, 20);
  assert.equal(links[0].other, 1);
  assert.equal(links[0].today, 21);
});

test('paused and unknown links cannot redirect or accrue new clicks', async () => {
  const { api, link, visit } = fixture();
  await api('POST', { ...link, active: false });
  assert.equal((await visit()).status, 410);
  assert.equal((await visit({ slug: 'missing-link' })).status, 404);
  assert.equal((await visit({ method: 'POST' })).status, 405);
  const { links } = await (await api()).json();
  assert.equal(links[0].clicks, 0);
});

test('failed analytics writes do not break the referral redirect', async () => {
  const tasks = [];
  const env = { REFERRAL_DB: { prepare(sql) {
    return { bind() { return this; }, first: async () => ({ destination, active: 1 }), run: async () => { throw new Error('Stats unavailable'); } };
  } } };
  const result = await redirect({ env, params: { slug: 'valid-link' }, request: new Request('https://relocateworks.com/go/valid-link'), waitUntil(task) { tasks.push(task); } });
  await Promise.all(tasks);
  assert.equal(result.status, 302);
  assert.equal(result.headers.get('Location'), destination);
});
