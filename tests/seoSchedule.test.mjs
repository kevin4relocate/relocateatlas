import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const run=(date)=>spawnSync(process.execPath,['scripts/release-seo.mjs','--dry-run','--date='+date],{encoding:'utf8'});
test('does not publish ahead of first scheduled day',()=>{
 const r=run('2026-11-19');assert.equal(r.status,0);assert.match(r.stdout,/Nothing due: next 2026-11-20/);
});
test('first article becomes eligible on 20 Nov 2026',()=>{
 const r=run('2026-11-20');assert.equal(r.status,0);assert.match(r.stdout,/DRY RUN: would publish australia-verify-job-visa-sponsorship/);
});
test('later runs do not skip the first unpublished item',()=>{
 const r=run('2026-12-11');assert.equal(r.status,0);assert.match(r.stdout,/australia-verify-job-visa-sponsorship/);
});
