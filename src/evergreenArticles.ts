import batch1 from './data/evergreen/01-career-and-preparation.json';
import batch2 from './data/evergreen/02-travel-and-housing.json';
import batch3 from './data/evergreen/03-money-health-family-culture-work.json';
import batch4 from './data/evergreen/04-safety-digital-everyday-community.json';
import { buildEvergreenArticles } from './evergreenEditorial.mjs';
export const evergreenSeeds = [...batch1, ...batch2, ...batch3, ...batch4];
export const evergreenArticles = buildEvergreenArticles(evergreenSeeds);
