import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {buildEvergreenArticles,releaseDay} from '../src/evergreenEditorial.mjs';
import {buildYear3Articles,publicationDate,YEAR3_START} from '../src/year3Editorial.mjs';

const readJson=path=>JSON.parse(readFileSync(resolve(path),'utf8'));
const seo=readJson('src/data/seoQueue.json');
const evergreen=buildEvergreenArticles([
 ...readJson('src/data/evergreen/01-career-and-preparation.json'),
 ...readJson('src/data/evergreen/02-travel-and-housing.json'),
 ...readJson('src/data/evergreen/03-money-health-family-culture-work.json'),
 ...readJson('src/data/evergreen/04-safety-digital-everyday-community.json')
]);
const year3=buildYear3Articles([
 ...readJson('src/data/year3/01-careers-and-employment.json'),
 ...readJson('src/data/year3/02-flight-and-travel.json'),
 ...readJson('src/data/year3/03-housing-and-money.json'),
 ...readJson('src/data/year3/04-family-health-community.json'),
 ...readJson('src/data/year3/05-work-digital-safety.json'),
 ...readJson('src/data/year3/06-long-term-and-return.json')
]);
const states=[
 readJson('src/data/seoRelease.json'),
 readJson('src/data/evergreenRelease.json'),
 readJson('src/data/year3Release.json')
];
const lanes=[
 {label:'original SEO',queue:seo,state:states[0],start:'2026-11-20',interval:3,count:100},
 {label:'relocation evergreen',queue:evergreen,state:states[1],start:'2026-11-21',interval:3,count:200},
 {label:'next-year evergreen',queue:year3,state:states[2],start:YEAR3_START,interval:1,count:365}
];
const errors=[],allSlugs=new Set(),allTitles=new Set(),allDates=new Set();
const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const proposedWords=[];
for(const lane of lanes){
 if(lane.queue.length!==lane.count||lane.state.startDate!==lane.start||lane.state.intervalDays!==lane.interval)errors.push('Wrong schedule/count: '+lane.label);
 if(lane.state.published.some((slug,i)=>lane.queue[i]?.slug!==slug))errors.push('Out-of-order release manifest: '+lane.label);
 if(lane.state.publishedAt&&Object.keys(lane.state.publishedAt).some(slug=>!lane.state.published.includes(slug)))errors.push('Unpublished actual date: '+lane.label);
 for(let i=0;i<lane.queue.length;i++){
  const post=lane.queue[i],date=lane.interval===1?publicationDate(i):releaseDay(lane.start,i),e=post.editorial;
  if(post.date!==date||post.updated!==date)errors.push('Wrong planned publication date: '+post.slug);
  if(allSlugs.has(post.slug)||allTitles.has(post.title.toLowerCase())||allDates.has(date))errors.push('Duplicate slug, title or date: '+post.slug);
  if(!slugPattern.test(post.slug))errors.push('Invalid slug: '+post.slug);
  allSlugs.add(post.slug);allTitles.add(post.title.toLowerCase());allDates.add(date);
  const words=[e.intro,...e.sections.flatMap(s=>[...s.paragraphs,...s.bullets])].join(' ').trim().split(/\s+/).length;
  if(words<500)errors.push('Article too thin ('+words+' words): '+post.slug);
  if(e.sections.length<5||e.sections.some(s=>s.paragraphs.length<2||s.bullets.length<3))errors.push('Incomplete structure: '+post.slug);
  if(e.resources.length<2||e.resources.some(([name,url])=>!name||!/^https:\/\//.test(url)))errors.push('Missing sources: '+post.slug);
  if(e.related.length<2||e.related.some(path=>!path.startsWith('/')))errors.push('Missing internal links: '+post.slug);
  if(lane.interval===1 && (!post.description||post.description.length<55||post.description.length>190))errors.push('Poor new-series meta description length: '+post.slug+' '+post.description?.length);
  if(post.title.length<20||post.title.length>115)errors.push('SEO title outside sensible range: '+post.slug);
  if(lane.interval===1)proposedWords.push(words);
 }
}
if(allDates.size!==665||allSlugs.size!==665)errors.push('Expected 665 unique planned dates and article slugs');
if(seo.at(-1)?.date!=='2027-09-13'||evergreen.at(-1)?.date!=='2028-07-10'||year3[0]?.date!=='2028-07-11'||year3.at(-1)?.date!=='2029-07-10')errors.push('Handoff dates changed');
if(states[2].published.length>0&&(states[0].published.length!==100||states[1].published.length!==200))errors.push('Year-three published before legacy queues completed');
if(existsSync(resolve('dist/sitemap-0.xml'))){
 const sitemap=readFileSync(resolve('dist/sitemap-0.xml'),'utf8'),rss=readFileSync(resolve('dist/rss.xml'),'utf8');
 const blog=readFileSync(resolve('dist/blog/index.html'),'utf8');
 const search=readFileSync(resolve('dist/search/index.html'),'utf8');
 for(const lane of lanes)for(let i=0;i<lane.queue.length;i++){
  const post=lane.queue[i],url='https://relocateworks.com/blog/'+post.slug;
  const page=resolve('dist/blog',post.slug,'index.html'),visible=i<lane.state.published.length;
  if(visible){
   if(!existsSync(page)||!sitemap.includes(url)||!rss.includes(url)||!blog.includes(post.slug)||!search.includes(post.slug))errors.push('Released article missing from public surfaces: '+post.slug);
  } else if(existsSync(page)||sitemap.includes(url)||rss.includes(url)||blog.includes(post.slug)||search.includes(post.slug)){
   errors.push('Unreleased article leaked into site: '+post.slug);
  }
 }
}
if(errors.length){console.error(errors.slice(0,55).join('\n'));process.exit(1);}
console.log('SEO QA passed: 665 unique articles (100 SEO + 200 evergreen + 365 daily); '+allDates.size+' non-overlapping dates. Published '+states.reduce((n,s)=>n+s.published.length,0)+' total. Year-three draft length '+Math.min(...proposedWords)+'–'+Math.max(...proposedWords)+' words (excluding headings).');
