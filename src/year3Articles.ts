import batch1 from './data/year3/01-careers-and-employment.json';
import batch2 from './data/year3/02-flight-and-travel.json';
import batch3 from './data/year3/03-housing-and-money.json';
import batch4 from './data/year3/04-family-health-community.json';
import batch5 from './data/year3/05-work-digital-safety.json';
import batch6 from './data/year3/06-long-term-and-return.json';
import { buildYear3Articles } from './year3Editorial.mjs';

export const year3Seeds = [...batch1, ...batch2, ...batch3, ...batch4, ...batch5, ...batch6];
export const year3Articles = buildYear3Articles(year3Seeds);
