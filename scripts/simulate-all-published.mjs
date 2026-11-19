/**
 * Verify complete content inventory in isolated GitHub CI, never in production.
 * Simulates all 365 future releases to catch broken deep links, rendering bugs
 * and missing sitemap/RSS/archive entries that first-article smoke tests miss.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {buildYear3Articles} from '../src/year3Editorial.mjs';
if(process.env.CI!=='true')throw new Error('Full publication simulation is CI-only');
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const original=read('src/data/seoRelease.json');
const evergreen=read('src/data/evergreenRelease.json');
if(original.published.length!==100||evergreen.published.length!==200)throw new Error('Complete legacy manifests in isolated CI before full audit');
const files=['01-careers-and-employment','02-flight-and-travel','03-housing-and-money','04-family-health-community','05-work-digital-safety','06-long-term-and-return'];
const articles=buildYear3Articles(files.flatMap(file=>read('src/data/year3/'+file+'.json')));
const path='src/data/year3Release.json';
const state=read(path);
if(state.published.some((slug,i)=>articles[i]?.slug!==slug))throw new Error('Year-three release order is invalid');
state.published=articles.map(article=>article.slug);
writeFileSync(path,JSON.stringify(state,null,2)+'\n');
console.log('CI audit: simulate all 665 articles published, including 365 next-year guides');
