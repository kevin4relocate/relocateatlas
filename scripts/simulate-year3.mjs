/**
 * CI-only simulation: complete legacy manifests in an isolated checkout.
 * Never run as a production GitHub Actions publication workflow step.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {buildEvergreenArticles} from '../src/evergreenEditorial.mjs';
if(process.env.CI!=='true')throw new Error('Future calendar simulation is CI-only; refusing to modify release manifests');
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const originals=read('src/data/seoQueue.json');
const oldSeeds=['01-career-and-preparation','02-travel-and-housing','03-money-health-family-culture-work','04-safety-digital-everyday-community'].flatMap(file=>read('src/data/evergreen/'+file+'.json'));
const legacy=[{path:'src/data/seoRelease.json',articles:originals},{path:'src/data/evergreenRelease.json',articles:buildEvergreenArticles(oldSeeds)}];
for(const item of legacy){
 const state=read(item.path);
 if(state.published.some((slug,i)=>item.articles[i]?.slug!==slug))throw new Error('Invalid current manifest; cannot simulate completion');
 state.published=item.articles.map(post=>post.slug);
 writeFileSync(item.path,JSON.stringify(state,null,2)+'\n');
 console.log('CI simulation: completed '+state.published.length+' legacy articles in '+item.path);
}
