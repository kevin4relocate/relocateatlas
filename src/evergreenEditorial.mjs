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
    const a=sentence(seed.first),b=sentence(seed.second),risk=sentence(seed.pitfall);
    const output=sentence(seed.deliverable);
    const focus=seed.cluster.replace(/-/g,' ');
    const note=guidance(seed.cluster);
    const cta=linksFor(seed.cluster);
    const editorial={
      intro:name+' is easier to handle when the practical choices are broken into small checks. '+opening+' This guide focuses on '+focus+', using concrete actions you can adapt to your own departure date, destination and household. It is a planning method, not an account of a real individual journey or a guarantee that a company, service or government will approve anything.',
      sections:[
       {
        heading:framing,
        paragraphs:[
          'Before acting on "'+name.toLowerCase()+'", write down what you are trying to achieve and which decision is irreversible. A move across borders can put time, money, personal data and legal obligations into the same process. The safest starting point is to identify what you control, what requires another party and what needs up-to-date verification. '+a,
          'Imagine making this decision a few days before departure, with several other tasks competing for attention. Instead of keeping the whole plan in your head, write the exact question that is still unanswered. Label evidence as confirmed, estimated or unknown, then give each unknown a clear owner and deadline. The method works even when your itinerary or employer changes.'
        ],
        bullets:[
          'Write one concrete decision you need to make about '+focus+'.',
          a,
          'Mark whether the information comes from an official source, a written agreement or an assumption.'
        ]
       },
       {
        heading:'The first practical check',
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
        heading:'A second check that makes the plan reliable',
        paragraphs:[
          b+' The second action should confirm that the first decision is operationally realistic, not simply attractive on paper. Compare the written terms, deadlines and alternatives that apply to your actual circumstances. A plan that depends on one service working perfectly has a different risk profile from one with a known fallback.',
          'Walk through the sequence in chronological order. What must happen before this step, and what would change if it were delayed? Keep a modest contingency for travel disruptions, unavailable appointments or communication problems where these are relevant. Confirm responsibilities with the people involved rather than assuming an employer, landlord, agent, airline or family member will handle an unspecified task.'
        ],
        bullets:[
          b,
          'Identify the dependency that could delay the next step.',
          'Write down the contact or alternative you would use if the primary plan fails.'
        ]
       },
       {
        heading:'A common shortcut that can backfire',
        paragraphs:[
          risk+' This is not proof that something will go wrong in your case; it is a reason to separate speed from certainty. Fast decisions often hide the cost of reversing an action, especially when deposits, reservations, job offers or essential records are involved. Stop when the evidence does not match the claim being made.',
          'A useful stress test is to ask what you would need if the decision had to be explained tomorrow. Would you have the original agreement, proof of payment, a verified contact and the assumptions used? If not, the problem is not necessarily the choice itself; it is the missing verification trail. Keeping the trail protects your time and makes later questions much easier to answer.'
        ],
        bullets:[
          'Treat this warning as a scenario to verify: '+clean(seed.pitfall)+'.',
          'Check whether any deadline, fee or personal-data request is genuine.',
          'Save enough evidence to reconstruct the decision if circumstances change.'
        ]
       },
       {
        heading:'Finish with something you can actually use',
        paragraphs:[
          'The most helpful outcome is not merely feeling more prepared. '+output+' Make this deliverable small, specific and easy to update. Include only the information you truly need, a current source for any changing condition and a next-review date. A checklist or comparison is useful because it turns one-time research into a repeatable process.',
          'Before calling the task finished, test the result against a realistic disruption: a delayed reply, a changed appointment, a missed connection or a higher-than-expected expense. Decide what you would do first and who you would contact. '+note+' Use the linked reference resources as general starting points, and consult the relevant authority or provider for rules that apply to you personally.'
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
