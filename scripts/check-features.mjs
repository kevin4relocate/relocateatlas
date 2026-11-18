import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve('dist');
const routes=['tools','search','compare-countries','relocation-budget','moving-checklist'];
const required={
 'tools':['/compare-countries','/relocation-budget','/moving-checklist'],
 'search':['data-site-search-item','noindex'],
 'compare-countries':['data-country-compare','data-compare-card'],
 'relocation-budget':['budget-form','budget-results'],
 'moving-checklist':['check-progress','data-check-id']
};
const errors=[];
for(const route of routes){
 const file=resolve(root,route,'index.html');
 if(!existsSync(file)){errors.push('Missing generated route: /'+route);continue;}
 const html=readFileSync(file,'utf8');
 for(const token of required[route])if(!html.includes(token))errors.push(route+' missing '+token);
 if(!html.includes('rel="canonical"'))errors.push(route+' canonical missing');
}
const home=readFileSync(resolve(root,'index.html'),'utf8');
if(!home.includes('action="/search"'))errors.push('Homepage search route missing');
if(!home.includes('href="/tools"'))errors.push('Homepage tools discoverability missing');
const robots=readFileSync(resolve(root,'robots.txt'),'utf8');
if(/Disallow:\s*\/_astro\//i.test(robots))errors.push('Astro assets blocked in robots.txt');
const p=readFileSync(resolve(root,'pricing','index.html'),'utf8');
if(p.includes('$9/month')||p.includes('$49/year'))errors.push('Unverified subscription prices still advertised');
const country=readFileSync(resolve(root,'cost-of-living','australia','index.html'),'utf8');
if(/AUD 3,600–5,600|AUD 1,900–3,600/.test(country))errors.push('Historical cost figures still live');
if(!country.includes('Data-quality notice'))errors.push('Legacy numeric withdrawal notice missing');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Feature QA passed for 5 routes, homepage, prices, robots and historical numbers.');
