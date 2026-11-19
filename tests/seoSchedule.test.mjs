import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildEvergreenArticles} from '../src/evergreenEditorial.mjs';
import {selectPublicationLane,laneDueDate} from '../src/releaseCalendar.mjs';

test('date before Nov 20 has no eligible article regardless of manifest',()=>{
 assert.deepEqual(selectPublicationLane('2026-11-19',false),{index:null,reason:'before-start'});
});
test('first two lanes alternate every three days with a deliberate gap',()=>{
 for(const [date,index] of [
  ['2026-11-20',0],['2026-11-21',1],['2026-11-22',null],
  ['2026-11-23',0],['2026-11-24',1],['2026-11-25',null],
  ['2026-11-26',0],['2026-11-27',1]
 ]){
  assert.equal(selectPublicationLane(date,false).index,index,date);
 }
});
test('date gate advances without duplicate publication when a manifest grows',()=>{
 assert.equal(laneDueDate(0,0),'2026-11-20');
 assert.equal(laneDueDate(0,1),'2026-11-23');
 assert.equal(laneDueDate(1,0),'2026-11-21');
 assert.equal(laneDueDate(1,1),'2026-11-24');
 assert.equal('2026-11-20'<laneDueDate(0,1),true);
 assert.equal('2026-11-21'<laneDueDate(1,1),true);
});
test('missed releases can catch up only on their own slot',()=>{
 const delayedSeoDue=laneDueDate(0,1);
 assert.equal(delayedSeoDue,'2026-11-23');
 assert.equal(selectPublicationLane('2026-11-29',false).index,0);
 assert.equal('2026-11-29'>=delayedSeoDue,true);
 assert.equal(selectPublicationLane('2026-11-30',false).index,1);
});
test('original evergreen draft count and boundaries remain unchanged',()=>{
 const files=['01-career-and-preparation','02-travel-and-housing','03-money-health-family-culture-work','04-safety-digital-everyday-community'];
 const seeds=files.flatMap(name=>JSON.parse(readFileSync('src/data/evergreen/'+name+'.json','utf8')));
 const posts=buildEvergreenArticles(seeds);
 assert.equal(posts.length,200);
 assert.equal(new Set(posts.map(p=>p.slug)).size,200);
 assert.equal(posts[0].date,laneDueDate(1,0));
 assert.equal(posts.at(-1).date,laneDueDate(1,199));
});
test('calendar tests never assume publication manifests are empty',()=>{
 const seo=JSON.parse(readFileSync('src/data/seoRelease.json','utf8'));
 const evergreen=JSON.parse(readFileSync('src/data/evergreenRelease.json','utf8'));
 assert.ok(seo.published.length<=100);
 assert.ok(evergreen.published.length<=200);
 assert.equal(laneDueDate(0,seo.published.length)>=seo.startDate,true);
 assert.equal(laneDueDate(1,evergreen.published.length)>=evergreen.startDate,true);
});
