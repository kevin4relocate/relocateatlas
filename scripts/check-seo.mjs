import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const readJson=path=>JSON.parse(readFileSync(resolve(path),'utf8'));
const queue=readJson('src/data/seoQueue.json');
const state=readJson('src/data/seoRelease.json');
const errors=[];
if(queue.length!==100||state.startDate!=='2026-11-20'||state.intervalDays!==3)errors.push('Expected 100 drafts with one article every 3 days from Nov 20, 2026');
const unique=new Set(),titles=new Set();
for(let i=0;i<queue.length;i++){
 const post=queue[i];
 const due=new Date(Date.parse(state.startDate+'T00:00:00Z')+i*3*86400000).toISOString().slice(0,10);
 if(post.date!==due||post.updated!==due)errors.push('Wrong publish date for '+post.slug);
 if(unique.has(post.slug)||titles.has(post.title))errors.push('Duplicate article '+post.slug);
 unique.add(post.slug);titles.add(post.title);
 const e=post.editorial;
 const words=[e.intro,...e.sections.flatMap(s=>[...s.paragraphs,...s.bullets])].join(' ').trim().split(/\s+/).length;
 if(words<500)errors.push('Article shorter than editorial floor: '+post.slug);
 if(e.sections.length<5||e.sections.some(s=>s.paragraphs.length<2||s.bullets.length<3))errors.push('Incomplete outline: '+post.slug);
 if(e.resources.length<2||e.resources.some(([label,url])=>!label||!/^https:\/\//.test(url)))errors.push('Missing official sources: '+post.slug);
 if(e.related.length<2||e.related.some(path=>!path.startsWith('/')))errors.push('Missing internal links: '+post.slug);
}
if(state.published.some((slug,i)=>queue[i]?.slug!==slug))errors.push('Published manifest must be a release-order prefix');
if(existsSync(resolve('dist/sitemap-0.xml'))){
 const sitemap=readFileSync(resolve('dist/sitemap-0.xml'),'utf8');
 const rss=readFileSync(resolve('dist/rss.xml'),'utf8');
 for(let i=0;i<queue.length;i++){
  const post=queue[i];
  const url='https://relocateworks.com/blog/'+post.slug;
  const path=resolve('dist/blog',post.slug,'index.html');
  if(i<state.published.length){
   if(!existsSync(path)||!sitemap.includes(url)||!rss.includes(url))errors.push('Published page absent from dist, sitemap or RSS: '+post.slug);
  } else {
   if(existsSync(path)||sitemap.includes(url)||rss.includes(url))errors.push('Unpublished article exposed: '+post.slug);
  }
 }
}
if(errors.length){console.error(errors.slice(0,30).join('\n'));process.exit(1);}
console.log('SEO QA passed: 100 unique sourced articles, '+state.published.length+' live, '+(100-state.published.length)+' queued.');
