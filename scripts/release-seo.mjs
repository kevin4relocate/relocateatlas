/**
 * Two independent 3-day lanes, offset by one day. Original SEO: Nov 20, 23...
 * Evergreen: Nov 21, 24... The third day stays clear to prevent overlap.
 * One release maximum per daily run, including when catching up missed slots.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {buildEvergreenArticles,releaseDay} from '../src/evergreenEditorial.mjs';
const readJson=path=>JSON.parse(readFileSync(resolve(path),'utf8'));
const oldQueue=readJson('src/data/seoQueue.json');
const seeds=[
 ...readJson('src/data/evergreen/01-career-and-preparation.json'),
 ...readJson('src/data/evergreen/02-travel-and-housing.json'),
 ...readJson('src/data/evergreen/03-money-health-family-culture-work.json'),
 ...readJson('src/data/evergreen/04-safety-digital-everyday-community.json')
];
const evergreenQueue=buildEvergreenArticles(seeds);
const manifests=[
 {label:'SEO',path:'src/data/seoRelease.json',start:'2026-11-20',queue:oldQueue,slot:0},
 {label:'evergreen',path:'src/data/evergreenRelease.json',start:'2026-11-21',queue:evergreenQueue,slot:1}
];
const dryRun=process.argv.includes('--dry-run');
const override=process.argv.find(x=>x.startsWith('--date='));
const formatBangkok=date=>{
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
 const get=type=>parts.find(p=>p.type===type)?.value;
 return [get('year'),get('month'),get('day')].join('-');
};
const today=override?override.slice(7):formatBangkok(new Date());
if(!/^\d{4}-\d{2}-\d{2}$/.test(today)||Number.isNaN(Date.parse(today+'T00:00:00Z')))throw new Error('Invalid release date');
const base=Date.parse('2026-11-20T00:00:00Z');
const dayDifference=Math.round((Date.parse(today+'T00:00:00Z')-base)/86400000);
const labels=manifests.map(m=>({...m,state:readJson(m.path)}));
for(const lane of labels){
 if(lane.state.startDate!==lane.start||lane.state.intervalDays!==3||lane.queue.length!==(lane.slot===0?100:200))throw new Error('Release contract mismatch: '+lane.label);
 if(lane.state.published.some((slug,i)=>lane.queue[i]?.slug!==slug))throw new Error('Non-prefix publication manifest in '+lane.label);
 if(new Set(lane.queue.map(x=>x.slug)).size!==lane.queue.length)throw new Error('Duplicate slugs: '+lane.label);
}
if(new Set([...oldQueue,...evergreenQueue].map(x=>x.slug)).size!==300)throw new Error('Duplicate slug across lanes');
if(dayDifference<0){
 console.log('Nothing due: next 2026-11-20 '+oldQueue[0].slug);
 process.exit(0);
}
const slot=dayDifference%3;
if(slot===2){console.log('No publication slot today: '+today+' (intentional gap day)');process.exit(0);}
const lane=labels.find(l=>l.slot===slot);
const index=lane.state.published.length;
if(index>=lane.queue.length){console.log(lane.label+' queue complete: '+index+'/'+lane.queue.length);process.exit(0);}
const due=releaseDay(lane.start,index);
const post=lane.queue[index];
if(post.date!==due)throw new Error('Date mismatch: '+post.slug+' expected '+due);
if(today<due){console.log('Nothing due: next '+due+' '+post.slug);process.exit(0);}
const editorial=post.editorial;
const words=[editorial.intro,...editorial.sections.flatMap(s=>[...s.paragraphs,...s.bullets])].join(' ').trim().split(/\s+/).length;
if(words<500||editorial.sections.length<5||editorial.resources.length<2)throw new Error('Unready content: '+post.slug);
if(editorial.resources.some(([label,url])=>!label||!/^https:\/\//.test(url)))throw new Error('Invalid references: '+post.slug);
if(dryRun){console.log('DRY RUN: would publish '+post.slug+' on '+today+' ('+lane.label+' lane)');process.exit(0);}
lane.state.published.push(post.slug);
lane.state.publishedAt={...(lane.state.publishedAt||{}),[post.slug]:today};
writeFileSync(resolve(lane.path),JSON.stringify(lane.state,null,2)+'\n');
console.log('READY: '+lane.label+' article '+post.slug+' planned '+due+' actually published '+today+' ('+lane.state.published.length+'/'+lane.queue.length+')');
