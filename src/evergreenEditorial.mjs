/**
 * Article renderer for 200 individually briefed evergreen relocation topics.
 * Each draft has its own title, practical actions, risk and concrete deliverable.
 * No fictitious personal testimony, salary, visa promise or live hiring claim.
 */
const DAY_MS = 86400000;
export const EVERGREEN_START = '2026-11-21';
const clean = text => String(text).trim().replace(/[.!?]$/, '');
const sentence = text => { const x=clean(text);return x.charAt(0).toUpperCase()+x.slice(1)+'.'; };
export const slugify = title => String(title).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const releaseDay = (start, index) => new Date(Date.parse(start+'T00:00:00Z')+index*3*DAY_MS).toISOString().slice(0,10);
const linksFor = cluster => {
  const base = ['/moving-checklist','/relocation-budget','/compare-countries'];
  if (/job|cv|interview|work|offer/.test(cluster)) return ['/jobs','/industries',...base.slice(0,1)];
  if (/booking|airport|packing|document|first-week/.test(cluster)) return ['/moving-checklist','/guides','/countries'];
  if (/housing|money/.test(cluster)) return ['/relocation-budget','/cost-of-living','/countries'];
  return base;
};
const guidance = cluster => {
  if (/job|cv|interview|offer|workplace/.test(cluster)) return 'Use the original employer website, written hiring documents and the government work-authorisation authority for any detail that could change your eligibility. Public employment services are discovery tools, not guarantees that a specific role is open to you.';
  if (/flight|booking|airport|packing|document|first-week|digital/.test(cluster)) return 'Travel restrictions, airline conditions, document rules and health requirements vary by passport, route and date. Always check the operating carrier and current official destination or transit rules before paying or departing.';
  if (/housing|money|safety/.test(cluster)) return 'When a decision involves money or identity documents, independently verify the person or organisation receiving them. Save the agreement, cancellation terms and payment proof; general research guidance does not replace local law or official requirements.';
  if (/health|family/.test(cluster)) return 'For healthcare, legal permission and dependent eligibility, consult qualified professionals and official authorities. General checklists are preparation aids and cannot determine the needs or entitlements of a particular person.';
  return 'Local processes and customs vary. Treat an online guide as a research starting point, confirm important details with the responsible local service, and adjust your plan after learning how the destination actually works.';
};
const clusterDetails = {
 'job-search': {
  context:'For an overseas job hunt, the real unit of work is one verified vacancy, not a saved keyword search. Keep employer careers pages separate from aggregators, and mark whether applicants outside the country can actually be considered.',
  next:'A dependable search pipeline needs an expiry rule. Revisit shortlisted openings, remove roles that have closed, and spend the saved time learning which employers respond to qualified international candidates.',
  warning:'A job advert can be copied long after it closes. Treat job-board snippets and unsolicited recruiter messages as leads that need verification, not as final evidence.',
  finish:'Keep a simple pipeline with the original role URL, contact history, eligibility note and next action so that each application teaches you something.'
 },
 'cv-portfolio':{
  context:'International recruiters may not recognise local titles, academic acronyms or the scope of an unfamiliar employer. Clear responsibilities and verifiable examples help bridge that gap without pretending qualifications are identical.',
  next:'A useful CV or portfolio should make the connection between a requested skill and an actual piece of work obvious. Show your own contribution, the context and what the reviewer can independently understand.',
  warning:'A document polished for appearance can still fail when dates disagree or confidential work samples are exposed. Accuracy, permissions and readability outrank decorative design.',
  finish:'Maintain a master evidence library privately, then select the strongest relevant examples for each genuine opening rather than sending the same generic document everywhere.'
 },
 'interviews':{
  context:'An international interview combines the ordinary challenge of demonstrating skill with practical constraints such as time zones, communication style and work-rights questions. Treat logistics and content as separate preparations.',
  next:'Prepare a small bank of real examples and a few questions about the team and role. Rehearse clarity, not a script, so you can adjust when an interviewer asks an unexpected follow-up.',
  warning:'Technical problems or unclear immigration assumptions may be mistaken for lack of preparation. Confirm the calendar, contact channel and your true eligibility before the meeting.',
  finish:'After the interview, write a factual debrief with what was asked, which claims need evidence and the agreed next date. Use it to improve the next conversation.'
 },
 'job-offers':{
  context:'A job offer becomes actionable only when its promises are written down. Base pay, work location, start date, visa help, moving costs and probation are different terms that should not be blended into one attractive headline.',
  next:'Translate the offer into a comparison table and identify which statements are contractual, which are estimates and which require local advice. Pay particular attention to costs you must advance before the first paycheck.',
  warning:'Rushing to resign or pay deposits before critical conditions are confirmed can create consequences that are difficult to reverse. Treat verbal assurances as questions for the written agreement.',
  finish:'Keep a decision file containing the actual offer, unresolved questions, written clarifications and a realistic deadline for your response.'
 },
 'documents':{
  context:'An international move spreads identity, employment, education, healthcare and banking documents across separate organisations. Each may use different names, formats, translations and verification procedures.',
  next:'A good document pack separates originals from shareable copies, tracks where each file was issued and lists the authority that requested it. Prepare backups that remain available if your phone or cloud account fails.',
  warning:'Unnecessary copying creates privacy exposure, while missing originals can stop a time-sensitive process. Verify the request before handing over sensitive identity records.',
  finish:'Use a document index with owner, purpose, current version, location and next verification date; it saves time throughout the first months abroad.'
 },
 'booking-flights':{
  context:'The cheapest flight is not necessarily the lowest-cost relocation journey. Separate tickets, baggage differences, transit rules and arrival-hour transport can change the risk and price substantially.',
  next:'Evaluate the itinerary as one door-to-door trip. Look at the operating carrier on every segment, luggage rules, airport transfers, booking protections and where you will sleep when you land.',
  warning:'A fare comparison screen rarely explains every condition that matters for an international move. Read the actual fare and routing terms before making a non-refundable choice.',
  finish:'Keep one itinerary record listing each sector, ticket condition, required travel documents, transfer plan and alternative contact route.'
 },
 'airport-navigation':{
  context:'Airports are easier to navigate when the next decision is already known: which counter, terminal, transfer path or official desk handles the problem. Signs and airline staff remain the live source when gates change.',
  next:'Break each airport into arrival, immigration or security, baggage and onward-transport tasks. Keep booking references and addresses accessible independently of mobile data.',
  warning:'Announcements, terminal maps and gate assignments can change quickly. A saved screenshot is useful backup, not proof that the information is still current.',
  finish:'Create a compact arrival card showing essential addresses, airline references, trusted transport options and emergency contacts.'
 },
 'packing-shipping':{
  context:'Packing for a move is different from packing for a holiday because delayed shipments and several weeks of temporary living are possible. Plan around what must be available immediately and what can arrive later.',
  next:'Sort belongings by urgency, replacement cost and legal transport restrictions. Check airline, customs and shipping rules separately, particularly for medicines, batteries and high-value electronics.',
  warning:'A carefully packed suitcase can still be wrong for the route if weight limits, restricted items or local electrical standards have not been checked.',
  finish:'Use an inventory that identifies carry-on essentials, checked bags, freight, stored items and what should be bought after arrival.'
 },
 'first-week':{
  context:'The first week abroad should establish safety and basic functioning before optimising the entire new life. Communication, shelter, food, rest and mandatory appointments take priority over decorative purchases.',
  next:'Turn urgent tasks into short trips that respect office hours, document rules and your energy level. Leave time to recover from travel and learn how local services operate.',
  warning:'Generic relocation lists often overstate what can be completed on the first day. Legal deadlines should be checked, but not every household decision must be immediate.',
  finish:'Keep a seven-day plan with confirmed appointments, transport routes, must-buy essentials and one fallback for delays.'
 },
 'housing':{
  context:'Housing decisions combine contract, neighbourhood and daily routine. Rent alone cannot reveal whether a place is suitable; deposits, utilities, commute, condition and trustworthy management matter too.',
  next:'Compare properties using the same checklist and request written details about fees and lease conditions. Arrange a reliable viewing or verification before transferring money.',
  warning:'Remote rental scams exploit urgency and the fact that newcomers may not know local practices. Validate the person, property and payment route independently.',
  finish:'Retain a property comparison and move-in condition record, including photos where appropriate, lease terms, deposit evidence and service contacts.'
 },
 'money':{
  context:'Moving across currencies makes even straightforward spending harder to compare. A sound budget separates gross salary from spendable income, one-time moving costs from monthly bills, and emergency cash from planned purchases.',
  next:'Check real fees and exchange conversions rather than relying on marketing rates. Record the currency and date attached to every number, especially when evaluating a rental deposit or transfer.',
  warning:'Irreversible transfers and unfamiliar billing terms can cause bigger problems than a small exchange-rate change. Verify recipients and retain written evidence.',
  finish:'Build a working ledger for recurring spending, initial expenses and available reserves; review it as actual bills replace estimates.'
 },
 'health-wellbeing':{
  context:'Relocating can interrupt ordinary healthcare routines at the same time as sleep and stress are changing. Continuity matters more than trying to solve every concern after arrival.',
  next:'Discuss personal medication and care questions with qualified clinicians, confirm insurance timing and identify the responsible local healthcare service before an urgent need arises.',
  warning:'Medicine legality, reimbursement and public-care entitlement vary by place and personal status. A generic travel blog cannot determine what is safe or covered for you.',
  finish:'Keep a secure care-summary folder and a simple list of emergency and non-emergency options appropriate for the new city.'
 },
 'family-pets':{
  context:'Every additional traveller creates separate documentation, insurance, schooling, daily-routine or animal-import considerations. The plan should be organised by person or pet as well as by destination.',
  next:'Confirm key requirements with the relevant official authority, school, airline or veterinarian. Coordinate commitments across family members instead of assuming one applicant’s approval covers everyone.',
  warning:'The household may have different start dates and eligibility conditions. A rushed booking for one member can leave another unable to travel.',
  finish:'Build a shared family timeline with individual document folders, practical needs, verified contacts and realistic backup arrangements.'
 },
 'culture-language':{
  context:'Culture is encountered in specific situations, not as a fixed list of national personality traits. Observe real people and local institutions, and ask respectfully before treating a new pattern as a rule.',
  next:'Learn functional phrases and communication habits that support daily errands, work and relationships. Check the formality and context of expressions instead of memorising slang without guidance.',
  warning:'Stereotypes can turn ordinary misunderstandings into unnecessary conflict. Interpret one interaction cautiously and seek direct, clear feedback where possible.',
  finish:'Keep a small notebook of useful phrases, observed routines and respectful questions that improve your day-to-day confidence.'
 },
 'workplace':{
  context:'Starting work in another country means learning a specific employer’s processes while adapting to new administrative rules. The manager, HR and government authority answer different kinds of questions.',
  next:'Confirm expectations in writing when they affect performance, pay or working conditions. Use modest first-month goals and ask for concrete examples rather than guessing unspoken rules.',
  warning:'An onboarding message may not resolve immigration, payroll or professional licensing requirements. Check the proper source before making consequential assumptions.',
  finish:'Maintain an onboarding record of contacts, approvals, responsibilities, deadlines and items that require formal clarification.'
 },
 'safety-scams':{
  context:'People under pressure to find housing, work or a functioning bank account can be targets for impersonation. An urgent message is not proof of authority, even if its branding resembles a familiar service.',
  next:'Reach the organisation through a verified channel you found independently. Pause before transferring money, sharing identity scans or installing unfamiliar software.',
  warning:'Scams often try to prevent comparison, impose a fake deadline or demand unusual payment methods. Verify first; do not let embarrassment stop you from seeking help.',
  finish:'Keep a short verification checklist and a recovery plan for relevant accounts, cards and documents before the emergency occurs.'
 },
 'digital-tools':{
  context:'Relocation changes phone networks, addresses and recovery numbers while you still depend on online banking, work accounts and bookings. A backup method is part of the move, not an afterthought.',
  next:'Inventory the systems needed in the first 48 hours and test access offline or on a spare device where reasonable. Confirm which services require SMS, voice calls or local identification.',
  warning:'Cloud storage and travel apps may all depend on one phone and one account. Losing that device without recovery access can interrupt multiple essential services.',
  finish:'Create a secure digital continuity pack with backups, recovery methods, essential files and a plan for replacing a lost device.'
 },
 'daily-life':{
  context:'The everyday costs of a new country become clear only through repeat errands such as shopping, commuting, cleaning and collecting deliveries. Observe actual routines before buying permanent solutions.',
  next:'Try a small, reversible setup first and note practical differences in opening hours, payment, building rules and transport reliability. Optimise after you understand your particular neighbourhood.',
  warning:'An online recommendation may not match your address, work schedule or household. Convenience and total effort matter as well as price.',
  finish:'Build a local quick-reference list for essential services and a routine that works without constant research.'
 },
 'social-life':{
  context:'Belonging abroad tends to develop through repeated low-pressure contact, not one networking event. Friendship, professional networking and family connection serve different needs and deserve separate space.',
  next:'Choose activities you genuinely enjoy, return regularly and approach people respectfully. Keep ties to home without making every free hour a remote call.',
  warning:'Expecting instant acceptance or treating new acquaintances as job leads can create frustration for everyone. A slower, reciprocal approach is easier to sustain.',
  finish:'Use a small social calendar with recurring activities, follow-ups and room for solitude and recovery.'
 },
 'long-term':{
  context:'The decisions made after settling abroad are different from the decisions made before departure. Real costs, career progress, household needs and legal status become clearer with experience.',
  next:'Review the plan periodically with current documents and honest observations. Separate what changed because of the location from what changed because of the particular job or household.',
  warning:'Sunk costs and the desire to justify an earlier choice can distort a decision to stay, move again or return. Use evidence and personal priorities rather than a single emotional week.',
  finish:'Keep a periodic review showing confirmed facts, unresolved legal questions, financial position and wellbeing priorities before choosing the next step.'
 }
};

const frames = [
 ['Turn an uncertain situation into a decision','Start with an answerable question rather than a large vague project.'],
 ['Plan the steps in the right order','A good relocation decision depends on sequence as much as enthusiasm.'],
 ['Check the details before you commit','Practical checks are usually less glamorous than the headline decision, but they prevent expensive rework.'],
 ['Make the plan easier to follow','Keep the next action small enough to complete, verify and document.'],
 ['Use evidence instead of assumptions','Separate what you know from what a listing, website or message merely suggests.']
];
export function buildEvergreenArticles(seeds) {
  const total=seeds.length;
  if(total!==200)throw new Error('Expected 200 evergreen briefs; received '+total);
  return seeds.map((seed,index)=>{
    const name=seed.title, [framing,opening]=frames[index%frames.length];
    const local=clusterDetails[seed.cluster];
    if(!local)throw new Error('Missing subject-specific context: '+seed.cluster);
    const a=sentence(seed.first),b=sentence(seed.second),risk=sentence(seed.pitfall);
    const output=sentence(seed.deliverable);
    const focus=seed.cluster.replace(/-/g,' ');
    const note=guidance(seed.cluster);
    const cta=linksFor(seed.cluster);
    const editorial={
      intro:name+' is easier to handle when the practical choices are broken into small checks. '+opening+' This guide focuses on '+focus+', using concrete actions you can adapt to your own departure date, destination and household. It is a planning method, not an account of a real individual journey or a guarantee that a company, service or government will approve anything.',
      sections:[
       {
        heading:framing+' for '+seed.category.toLowerCase(),
        paragraphs:[
          'Before acting on "'+name.toLowerCase()+'", write down what you are trying to achieve and which decision is irreversible. A move across borders can put time, money, personal data and legal obligations into the same process. The safest starting point is to identify what you control, what requires another party and what needs up-to-date verification. '+a,
          local.context+' Instead of keeping the whole plan in your head, write the exact question that is still unanswered. Label evidence as confirmed, estimated or unknown, then give each unknown an owner and a review date.'
        ],
        bullets:[
          'Write one concrete decision you need to make about '+focus+'.',
          a,
          'Mark whether the information comes from an official source, a written agreement or an assumption.'
        ]
       },
       {
        heading:'First action: '+clean(seed.first),
        paragraphs:[
          a+' This is the foundation of the topic because it exposes dependencies before you spend money or share sensitive details. Do not rely only on a result copied from a forum or an undated screenshot. Where a rule or eligibility condition is involved, identify the organisation responsible for it and find the current instructions in that organisation’s own channels.',
          'Create a short record containing the original source, the date you checked it, the relevant name or booking reference and the action that follows. If the information differs between two places, do not quietly choose the more convenient answer. Pause that part of the plan, seek clarification and record the response. A verified answer today is more useful than a confident guess that causes a problem later.'
        ],
        bullets:[
          'Collect the original documents or details needed for this first check.',
          'Record the current source, relevant conditions and date reviewed.',
          'Do not make an irreversible commitment while a critical requirement remains unknown.'
        ]
       },
       {
        heading:'Follow-up action: '+clean(seed.second),
        paragraphs:[
          b+' The second action should confirm that the first decision is operationally realistic, not simply attractive on paper. Compare the written terms, deadlines and alternatives that apply to your actual circumstances. A plan that depends on one service working perfectly has a different risk profile from one with a known fallback.',
          local.next+' Walk through the sequence in chronological order and identify what must happen before the next commitment. Confirm the responsibilities of everyone involved rather than assuming another party will handle an unspecified task.'
        ],
        bullets:[
          b,
          'Identify the dependency that could delay the next step.',
          'Write down the contact or alternative you would use if the primary plan fails.'
        ]
       },
       {
        heading:'Watch out for: '+clean(seed.pitfall),
        paragraphs:[
          risk+' This is not proof that something will go wrong in your case; it is a reason to separate speed from certainty. Fast decisions often hide the cost of reversing an action, especially when deposits, reservations, job offers or essential records are involved. Stop when the evidence does not match the claim being made.',
          local.warning+' Ask what evidence you would need to explain the decision tomorrow: the original agreement, a verified contact, the applicable terms or the assumptions used. Save the relevant items securely.'
        ],
        bullets:[
          'Treat this warning as a scenario to verify: '+clean(seed.pitfall)+'.',
          'Check whether any deadline, fee or personal-data request is genuine.',
          'Save enough evidence to reconstruct the decision if circumstances change.'
        ]
       },
       {
        heading:'Your practical output: '+clean(seed.deliverable),
        paragraphs:[
          'The most helpful outcome is not merely feeling more prepared. '+output+' Make this deliverable small, specific and easy to update. Include only the information you truly need, a current source for any changing condition and a next-review date. A checklist or comparison is useful because it turns one-time research into a repeatable process.',
          local.finish+' Test the result against a realistic disruption relevant to '+seed.category.toLowerCase()+'. Decide who you would contact and which part of the plan you could reverse. '+note+' Use the linked reference resources as general starting points, not as evidence that every personal condition is satisfied.'
        ],
        bullets:[
          output,
          'Set a reminder to recheck details that may change before departure or commitment.',
          'Keep your plan accessible offline or through a trusted backup when relevant.'
        ]
       }
      ],
      resources:seed.resources,
      related:cta
    };
    const date=releaseDay(EVERGREEN_START,index);
    return {slug:slugify(name),title:name,description:'Practical evergreen guide: '+clean(seed.first).toLowerCase()+'. Learn what to verify, how to avoid a common mistake and what to prepare before committing.',category:seed.category,kind:'evergreen',theme:seed.cluster,date,updated:date,editorial};
  });
}
