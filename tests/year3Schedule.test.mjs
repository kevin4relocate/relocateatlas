import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {buildYear3Articles,publicationDate,YEAR3_START} from '../src/year3Editorial.mjs';
import {buildEvergreenArticles} from '../src/evergreenEditorial.mjs';
const readJson=path=>JSON.parse(readFileSync(path,'utf8'));
const files=[
 '01-careers-and-employment','02-flight-and-travel','03-housing-and-money',
 '04-family-health-community','05-work-digital-safety','06-long-term-and-return'
];
const year3=buildYear3Articles(files.flatMap(f=>readJson('src/data/year3/'+f+'.json')));
test('365 unique future evergreen posts, titles and slugs',()=>{
 assert.equal(year3.length,365);
 assert.equal(new Set(year3.map(post=>post.slug)).size,365);
 assert.equal(new Set(year3.map(post=>post.title.toLowerCase())).size,365);
});
test('daily schedule begins immediately after legacy and ends a year later',()=>{
 assert.equal(YEAR3_START,'2028-07-11');
 assert.equal(year3[0].date,'2028-07-11');
 assert.equal(year3.at(-1).date,'2029-07-10');
 assert.equal(publicationDate(100),'2028-10-19');
 assert.equal(new Set(year3.map(post=>post.date)).size,365);
});
test('all 665 planned posts have distinct slugs and publication dates',()=>{
 const first=readJson('src/data/seoQueue.json');
 const oldEvergreen=buildEvergreenArticles(['01-career-and-preparation','02-travel-and-housing','03-money-health-family-culture-work','04-safety-digital-everyday-community'].flatMap(file=>readJson('src/data/evergreen/'+file+'.json')));
 const all=[...first,...oldEvergreen,...year3];
 assert.equal(all.length,665);
 assert.equal(new Set(all.map(post=>post.slug)).size,665);
 assert.equal(new Set(all.map(post=>post.date)).size,665);
});
test('year-three articles have explicit steps, sources and real editorial substance',()=>{
 for(const post of year3){
  assert.ok(post.editorial.sections.length>=5,post.slug);
  assert.ok(post.editorial.resources.length>=2,post.slug);
  assert.ok(post.editorial.related.every(url=>url.startsWith('/')),post.slug);
  assert.ok(!/\b2028\b|\b2029\b/.test(post.title),post.slug);
  const body=[post.editorial.intro,...post.editorial.sections.flatMap(s=>s.paragraphs)].join(' ');
  assert.ok(body.split(/\s+/).length>=480,post.slug);
  assert.ok(post.editorial.sections.some(s=>s.heading.startsWith('First action:')),post.slug);
 }
});
test('date gated script cannot publish third-year posts while old queues are incomplete',()=>{
 const result=spawnSync(process.execPath,['scripts/release-seo.mjs','--dry-run','--date=2028-07-11'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 assert.doesNotMatch(result.stdout,/would publish .*next-year evergreen/);
});
