/**
 * Three date-gated publication lanes:
 *   - country/industry SEO: Nov 20, 2026, then every 3 days (100 articles)
 *   - relocation evergreen: Nov 21, 2026, then every 3 days (200 articles)
 *   - next-year evergreen: July 11, 2028, then DAILY (365 articles)
 *
 * Year-three publications start only after BOTH earlier queues complete.
 * A delayed workflow catches up at most one article per run, never backdating
 * datePublished or exposing draft articles in public HTML/RSS/sitemap.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {buildEvergreenArticles,releaseDay} from '../src/evergreenEditorial.mjs';
import {buildYear3Articles,publicationDate,YEAR3_START} from '../src/year3Editorial.mjs';

const readJson=path=>JSON.parse(readFileSync(resolve(path),'utf8'));
const originalQueue=readJson('src/data/seoQueue.json');
const evergreenFiles=['01-career-and-preparation','02-travel-and-housing','03-money-health-family-culture-work','04-safety-digital-everyday-community'];
const evergreenQueue=buildEvergreenArticles(evergreenFiles.flatMap(name=>readJson('src/data/evergreen/'+name+'.json')));
const year3Files=['01-careers-and-employment','02-flight-and-travel','03-housing-and-money','04-family-health-community','05-work-digital-safety','06-long-term-and-return'];
const year3Queue=buildYear3Articles(year3Files.flatMap(name=>readJson('src/data/year3/'+name+'.json')));

const lanes=[
 {label:'SEO',path:'src/data/seoRelease.json',start:'2026-11-20',interval:3,queue:originalQueue,slot:0},
 {label:'evergreen',path:'src/data/evergreenRelease.json',start:'2026-11-21',interval:3,queue:evergreenQueue,slot:1},
 {label:'next-year evergreen',path:'src/data/year3Release.json',start:YEAR3_START,interval:1,queue:year3Queue,slot:null}
];
const dryRun=process.argv.includes('--dry-run');
const override=process.argv.find(arg=>arg.startsWith('--date='));
const bangkokDate=date=>{
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
 const part=type=>parts.find(p=>p.type===type)?.value;
 return [part('year'),part('month'),part('day')].join('-');
};
const today=override?override.slice(7):bangkokDate(new Date());
if(!/^\d{4}-\d{2}-\d{2}$/.test(today)||Number.isNaN(Date.parse(today+'T00:00:00Z')))throw new Error('Invalid release date');
const stateLanes=lanes.map(lane=>({...lane,state:readJson(lane.path)}));
for(const lane of stateLanes){
 if(lane.state.startDate!==lane.start||lane.state.intervalDays!==lane.interval||lane.queue.length!==({SEO:100,evergreen:200,'next-year evergreen':365}[lane.label]))throw new Error('Release contract mismatch: '+lane.label);
 if(new Set(lane.queue.map(post=>post.slug)).size!==lane.queue.length)throw new Error('Duplicate article IDs within '+lane.label);
 if(lane.state.published.some((slug,index)=>lane.queue[index]?.slug!==slug))throw new Error('Published manifest is not a continuous release-order prefix: '+lane.label);
}
if(new Set([...originalQueue,...evergreenQueue,...year3Queue].map(post=>post.slug)).size!==665)throw new Error('Cross-queue article slug collision');

const [first,second,third]=stateLanes;
const previousComplete=first.state.published.length===100 && second.state.published.length===200;
if(third.state.published.length>0&&!previousComplete)throw new Error('Next-year releases exist while earlier queues are incomplete');
const baseline=Date.parse('2026-11-20T00:00:00Z');
const dayDifference=Math.round((Date.parse(today+'T00:00:00Z')-baseline)/86400000);
let lane;
if(today>=YEAR3_START&&previousComplete){
 lane=third;
} else {
 if(dayDifference<0){
  console.log('Nothing due: next 2026-11-20 '+originalQueue[0].slug);
  process.exit(0);
 }
 const slot=dayDifference%3;
 if(slot===2){
  console.log('No publication slot today: '+today+' (intentional gap day or completing earlier queues)');
  process.exit(0);
 }
 lane=slot===0?first:second;
}
const index=lane.state.published.length;
if(index>=lane.queue.length){
 console.log(lane.label+' queue complete: '+index+'/'+lane.queue.length);
 process.exit(0);
}
const due=lane.interval===1?publicationDate(index):releaseDay(lane.start,index);
const article=lane.queue[index];
if(article.date!==due)throw new Error('Scheduled article date mismatch: '+article.slug+' expected '+due);
if(today<due){
 console.log('Nothing due: next '+due+' '+article.slug);
 process.exit(0);
}
const editorial=article.editorial;
const words=[editorial.intro,...editorial.sections.flatMap(section=>[...section.paragraphs,...section.bullets])].join(' ').trim().split(/\s+/).length;
if(words<500||editorial.sections.length<5||editorial.resources.length<2||editorial.resources.some(([name,url])=>!name||!/^https:\/\//.test(url)))throw new Error('Editorial QA failed: '+article.slug);
if(dryRun){
 console.log('DRY RUN: would publish '+article.slug+' on '+today+' ('+lane.label+' lane, slot '+(index+1)+'/'+lane.queue.length+')');
 process.exit(0);
}
lane.state.published.push(article.slug);
lane.state.publishedAt={...(lane.state.publishedAt||{}),[article.slug]:today};
writeFileSync(resolve(lane.path),JSON.stringify(lane.state,null,2)+'\n');
console.log('READY: '+lane.label+' '+article.slug+' planned '+due+' published '+today+' ('+lane.state.published.length+'/'+lane.queue.length+')');
