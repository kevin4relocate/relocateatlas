/**
 * One date-gated release per run. Run daily at 07:17 Asia/Bangkok via GitHub Actions.
 * An offline/missed day is caught up on the next run without bulk publishing.
 * Manual workflow_dispatch does not bypass the date gate.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const manifestPath=resolve('src/data/seoRelease.json');
const queue=JSON.parse(readFileSync(resolve('src/data/seoQueue.json'),'utf8'));
const state=JSON.parse(readFileSync(manifestPath,'utf8'));
const dryRun=process.argv.includes('--dry-run');
const mock=process.argv.find(x=>x.startsWith('--date='));
const formatBangkok=(date)=>{
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const get=type=>parts.find(p=>p.type===type)?.value;
  return [get('year'),get('month'),get('day')].join('-');
};
const today=mock?mock.slice(7):formatBangkok(new Date());
if(!/^\d{4}-\d{2}-\d{2}$/.test(today))throw new Error('Invalid local date');
if(state.intervalDays!==3||state.startDate!=='2026-11-20'||queue.length!==100)throw new Error('SEO queue schedule contract changed');
const unique=new Set(queue.map(post=>post.slug));
if(unique.size!==100)throw new Error('Duplicate slugs');
if(state.published.some((slug,i)=>queue[i]?.slug!==slug))throw new Error('Published list must be ordered, no gaps or duplicates');
const index=state.published.length;
if(index===queue.length){console.log('SEO queue complete: 100/100');process.exit(0);}
const start=Date.parse(state.startDate+'T00:00:00Z');
const due=new Date(start+index*state.intervalDays*86400000).toISOString().slice(0,10);
const article=queue[index];
if(article.date!==due)throw new Error('Scheduled date mismatch at index '+index);
if(today<due){console.log('Nothing due: next '+due+' '+article.slug);process.exit(0);}
const countWords=(post)=>[post.editorial.intro,...post.editorial.sections.flatMap(s=>[...s.paragraphs,...s.bullets])].join(' ').trim().split(/\s+/).length;
if(countWords(article)<500||article.editorial.resources.length<2||article.editorial.sections.length<5)throw new Error('Unready article: '+article.slug);
const allowed=article.editorial.resources.every(([,url])=>url.startsWith('https://')&&!/mercor|substack/i.test(url));
if(!allowed)throw new Error('Non-official or malformed source: '+article.slug);
if(dryRun){console.log('DRY RUN: would publish '+article.slug+' on '+today);process.exit(0);}
state.published.push(article.slug);
writeFileSync(manifestPath,JSON.stringify(state,null,2)+'\n');
console.log('READY: '+article.slug+' scheduled '+due+' released '+today+' ('+state.published.length+'/100)');
