/**
 * Stateless calendar policy shared by the publisher and regression tests.
 * It must not depend on mutable publication manifests during date tests.
 */
const EARLIEST = '2026-11-20';
const YEAR3_START = '2028-07-11';
const DAY_MS = 86400000;

export function selectPublicationLane(day, legacyCompleted = false) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||Number.isNaN(Date.parse(day+'T00:00:00Z'))){
    throw new Error('Invalid calendar date');
  }
  if(day < EARLIEST) return {index:null,reason:'before-start'};
  if(day >= YEAR3_START && legacyCompleted) return {index:2,reason:'daily-evergreen'};
  const count=Math.round((Date.parse(day+'T00:00:00Z')-Date.parse(EARLIEST+'T00:00:00Z'))/DAY_MS);
  const slot=count%3;
  if(slot===2) return {index:null,reason:'gap-day'};
  return {index:slot,reason:'three-day-lane'};
}

export function laneDueDate(laneIndex, articleIndex) {
  const starts=['2026-11-20','2026-11-21',YEAR3_START];
  const interval=[3,3,1];
  if(!Number.isInteger(laneIndex)||laneIndex<0||laneIndex>2||!Number.isInteger(articleIndex)||articleIndex<0) throw new Error('Invalid article index');
  return new Date(Date.parse(starts[laneIndex]+'T00:00:00Z')+articleIndex*interval[laneIndex]*DAY_MS).toISOString().slice(0,10);
}
