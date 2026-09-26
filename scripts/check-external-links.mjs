/**
 * Optional editorial review for generated external links.
 * Run npm run build && npm run check:site && npm run check:external.
 * An HTTP 403/429, timeout or other bot challenge is "manual review",
 * never proof that a government page or employer vacancy is dead.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const inventory = resolve('reports/external-links.txt');
if (!existsSync(inventory)) throw new Error('Run npm run check:site before this command');
const sources = [...new Set(readFileSync(inventory, 'utf8').split(/\r?\n/).filter(Boolean))];
const limitFlag = process.argv.find((value) => value.startsWith('--limit='));
const limit = limitFlag ? Number(limitFlag.split('=')[1]) : sources.length;
if (!Number.isInteger(limit) || limit < 1) throw new Error('Invalid --limit; use a positive integer');
const urls = sources.slice(0, limit);
const results = new Array(urls.length);

async function tryRequest(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'RelocateWorks-Editorial-LinkCheck/1.0 (manual QA)' }
    });
    return { code: response.status, final: response.url, message: '' };
  } catch (error) {
    return { code: 0, final: '', message: String(error?.message ?? error).slice(0, 130) };
  } finally {
    clearTimeout(timer);
  }
}

async function check(url) {
  const head = await tryRequest(url, 'HEAD');
  if (head.code >= 200 && head.code < 400) return { status: 'reachable', ...head };
  if ([403, 405].includes(head.code)) {
    const get = await tryRequest(url, 'GET');
    if (get.code >= 200 && get.code < 400) return { status: 'reachable', ...get };
    if ([404, 410].includes(get.code)) return { status: 'review-404-or-410', ...get };
    return { status: 'manual-review', ...get };
  }
  if ([404, 410].includes(head.code)) return { status: 'review-404-or-410', ...head };
  return { status: 'manual-review', ...head };
}

let next = 0;
async function worker() {
  while (next < urls.length) {
    const index = next++;
    results[index] = { url: urls[index], ...await check(urls[index]) };
    process.stdout.write('.');
  }
}
await Promise.all(Array.from({ length: Math.min(3, urls.length) }, worker));
process.stdout.write('\n');
mkdirSync(resolve('reports'), { recursive: true });
const escapeCell = (value) => String(value ?? '').replaceAll('\t', ' ').replaceAll('\n', ' ');
writeFileSync(resolve('reports/external-status.tsv'), [
  'status\tHTTP\toriginal\tfinal\tmessage',
  ...results.map((entry) => [entry.status,entry.code,entry.url,entry.final,entry.message].map(escapeCell).join('\t'))
].join('\n') + '\n');
const stats = results.reduce((acc, row) => { acc[row.status] = (acc[row.status] ?? 0) + 1; return acc; }, {});
console.log(JSON.stringify(stats));
console.log('Review reports/external-status.tsv. HTTP errors and automated blocking are not conclusive: recheck flagged links in a normal browser.');
