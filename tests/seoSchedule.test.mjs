import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {buildEvergreenArticles} from '../src/evergreenEditorial.mjs';
const run=date=>spawnSync(process.execPath,['scripts/release-seo.mjs','--dry-run','--date='+date],{encoding:'utf8'});
test('does not publish ahead of 20 November 2026',()=>{
 const r=run('2026-11-19');assert.equal(r.status,0);assert.match(r.stdout,/Nothing due: next 2026-11-20/);
});
test('original queue starts on Nov 20',()=>{
 const r=run('2026-11-20');assert.equal(r.status,0);assert.match(r.stdout,/australia-verify-job-visa-sponsorship/);
});
test('200-item evergreen queue starts on Nov 21 without clashing',()=>{
 const r=run('2026-11-21');assert.equal(r.status,0);assert.match(r.stdout,/find-international-jobs-beyond-big-job-boards/);
});
test('Nov 22 is an intentionally empty slot',()=>{
 const r=run('2026-11-22');assert.equal(r.status,0);assert.match(r.stdout,/No publication slot today/);
});
test('Nov 23 remains reserved for original SEO',()=>{
 const r=run('2026-11-23');assert.equal(r.status,0);assert.match(r.stdout,/australia-verify-job-visa-sponsorship/);
});
test('Nov 24 is an evergreen catch-up slot',()=>{
 const r=run('2026-11-24');assert.equal(r.status,0);assert.match(r.stdout,/find-international-jobs-beyond-big-job-boards/);
});
test('200 evergreen drafts have distinct slugs and titles',()=>{
 const files=['01-career-and-preparation','02-travel-and-housing','03-money-health-family-culture-work','04-safety-digital-everyday-community'];
 const seeds=files.flatMap(name=>JSON.parse(readFileSync('src/data/evergreen/'+name+'.json','utf8')));
 const posts=buildEvergreenArticles(seeds);
 assert.equal(posts.length,200);
 assert.equal(new Set(posts.map(p=>p.slug)).size,200);
 assert.equal(new Set(posts.map(p=>p.date)).size,200);
 assert.equal(posts[0].date,'2026-11-21');
 assert.equal(posts.at(-1).date,'2028-07-10');
});
