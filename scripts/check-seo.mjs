import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {buildEvergreenArticles,releaseDay} from '../src/evergreenEditorial.mjs';
const readJson=path=>JSON.parse(readFileSync(resolve(path),'utf8'));
const seo=readJson('src/data/seoQueue.json');
const evergreen=buildEvergreenArticles([
 ...readJson('src/data/evergreen/01-career-and-preparation.json'),
 ...readJson('src/data/evergreen/02-travel-and-housing.json'),
 ...readJson('src/data/evergreen/03-money-health-family-culture-work.json'),
 ...readJson('src/data/evergreen/04-safety-digital-everyday-community.json')
]);
const stateSeo=readJson('src/data/seoRelease.json');
const stateEvergreen=readJson('src/data/evergreenRelease.json');
const lanes=[{label:'SEO',queue:seo,state:stateSeo,start:'2026-11-20',count:100},
             {label:'evergreen',queue:evergreen,state:stateEvergreen,start:'2026-11-21',count:200}];
const errors=[],allSlugs=new Set(),allTitles=new Set(),allDates=new Set();
for(const lane of lanes){
 if(lane.queue.length!==lane.count||lane.state.startDate!==lane.start||lane.state.intervalDays!==3)errors.push('Invalid '+lane.label+' schedule/count');
 if(lane.state.published.some((slug,i)=>lane.queue[i]?.slug!==slug))errors.push('Out-of-order manifest: '+lane.label);
 for(let i=0;i<lane.queue.length;i++){
  const post=lane.queue[i],date=releaseDay(lane.start,i),e=post.editorial;
  if(post.date!==date||post.updated!==date)errors.push('Wrong schedule: '+post.slug);
  if(allSlugs.has(post.slug)||allTitles.has(post.title)||allDates.has(date))errors.push('Duplicate slug, title or publication date: '+post.slug);
  allSlugs.add(post.slug);allTitles.add(post.title);allDates.add(date);
  const words=[e.intro,...e.sections.flatMap(s=>[...s.paragraphs,...s.bullets])].join(' ').trim().split(/\s+/).length;
  if(words<500)errors.push('Too short ('+words+' words): '+post.slug);
  if(e.sections.length<5||e.sections.some(s=>s.paragraphs.length<2||s.bullets.length<3))errors.push('Incomplete guide: '+post.slug);
  if(e.resources.length<2||e.resources.some(([label,url])=>!label||!url.startsWith('https://')))errors.push('Missing source links: '+post.slug);
  if(e.related.length<2||e.related.some(url=>!url.startsWith('/')))errors.push('Missing internal links: '+post.slug);
 }
}
if(allDates.size!==300)errors.push('Dates collide between queues');
if(existsSync(resolve('dist/sitemap-0.xml'))){
 const sitemap=readFileSync(resolve('dist/sitemap-0.xml'),'utf8'),rss=readFileSync(resolve('dist/rss.xml'),'utf8');
 for(const lane of lanes)for(let i=0;i<lane.queue.length;i++){
  const post=lane.queue[i],url='https://relocateworks.com/blog/'+post.slug;
  const path=resolve('dist/blog',post.slug,'index.html'),visible=i<lane.state.published.length;
  if(visible){
   if(!existsSync(path)||!sitemap.includes(url)||!rss.includes(url))errors.push('Released content missing: '+post.slug);
  }else if(existsSync(path)||sitemap.includes(url)||rss.includes(url))errors.push('Future content leaked: '+post.slug);
 }
}
if(errors.length){console.error(errors.slice(0,45).join('\n'));process.exit(1);}
console.log('SEO QA passed: 300 unique guides (100 SEO + 200 evergreen); released '+(stateSeo.published.length+stateEvergreen.published.length)+'; queued '+(300-stateSeo.published.length-stateEvergreen.published.length)+'; 300 unique dates.');
