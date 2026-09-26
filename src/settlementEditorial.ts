/**
 * Distinguishes an entry/work permission from subsequent residence or settlement.
 * Government references are starting points; no pathway or application is guaranteed.
 * Review immigration pages whenever rules change, rather than baking in unsourced scores.
 */
export type SettlementNote = {
  entry: string;
  nextStep: string;
  verify: readonly string[];
  sourceLabel: string;
  sourceUrl: string;
};

export const settlementNotes: Record<string, SettlementNote> = {
  australia: {
    entry: 'Skilled workers may research an employer-sponsored temporary visa or a permanent employer nomination stream. Not every employer or occupation qualifies for both.',
    nextStep: 'The Employer Nomination Scheme (subclass 186) includes permanent residence streams with different skills, nomination and work-history requirements; an ordinary temporary job does not guarantee transition.',
    verify: ['Exact subclass and nomination stream', 'Occupation, skills assessment and English conditions', 'Any qualifying employment-history or age conditions and exceptions'],
    sourceLabel: 'Australian Home Affairs — Employer Nomination Scheme',
    sourceUrl: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/employer-nomination-scheme-186'
  },
  'new-zealand': {
    entry: 'An Accredited Employer Work Visa and a skilled residence pathway are different applications. Employer accreditation alone does not make a job eligible for residence.',
    nextStep: 'Skilled Migrant Category and other applicable residence programmes apply their own work, pay, points, qualification and experience conditions. Permanent Resident Visa is separate from first obtaining Resident Visa.',
    verify: ['Current rules for the chosen skilled residence pathway', 'The actual job, pay and employer conditions', 'Whether qualifying New Zealand work or other criteria still need to be completed'],
    sourceLabel: 'Immigration New Zealand — Skilled Migrant Resident Visa',
    sourceUrl: 'https://www.immigration.govt.nz/visas/skilled-migrant-category-resident-visa/'
  },
  'united-kingdom': {
    entry: 'The Skilled Worker route depends on an approved employer, an appropriate Certificate of Sponsorship and the visa rules applicable when applying.',
    nextStep: 'Indefinite leave to remain is a later, separate application with residence, employment, salary and other requirements. Review current government rules because proposed and enacted settlement reforms must not be confused.',
    verify: ['Continuous qualifying lawful residence under the applicable rules', 'Employer confirmation and the most recent salary requirements', 'Absences, language and Life in the UK requirements'],
    sourceLabel: 'GOV.UK — Skilled Worker settlement',
    sourceUrl: 'https://www.gov.uk/indefinite-leave-to-remain-tier-2-t2-skilled-worker-visa'
  },
  germany: {
    entry: 'The EU Blue Card and other qualified-worker permits have distinct employment, qualification and pay requirements.',
    nextStep: 'A German settlement permit may be available later under the specific residence title. The official EU Blue Card pathway describes different qualifying periods linked to employment, pension contributions and German language skills.',
    verify: ['Applicable work permit and qualifying employment history', 'Pension contributions and financial self-sufficiency', 'Language, housing and integration requirements'],
    sourceLabel: 'Make it in Germany — Settlement permit',
    sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/living-permanently/settlement-permit'
  },
  canada: {
    entry: 'Employer-linked work permits and federal or provincial permanent residence programmes have different requirements; a job offer is not always mandatory for every permanent residence route.',
    nextStep: 'Eligible candidates may investigate Express Entry or a suitable provincial nominee programme. Pool eligibility does not guarantee an invitation or permanent-residence approval.',
    verify: ['Exact federal programme or province eligibility', 'Language tests, education assessment and documented experience', 'Current invitation selection and any required provincial or job offer evidence'],
    sourceLabel: 'Immigration, Refugees and Citizenship Canada — Express Entry',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html'
  },
  singapore: {
    entry: 'Employment Pass and S Pass each authorise qualifying employment subject to their own salary, role and employer conditions.',
    nextStep: 'Certain work-pass holders can submit a permanent-residence application to ICA, but decisions are discretionary. No fixed period of employment guarantees permanent residence.',
    verify: ['Current Employment Pass or S Pass validity and eligibility', 'ICA permanent-residence application categories and evidence', 'Family circumstances and long-term plans'],
    sourceLabel: 'Singapore Immigration & Checkpoints Authority — Permanent residence',
    sourceUrl: 'https://www.ica.gov.sg/reside/PR'
  },
  ireland: {
    entry: 'A Critical Skills Employment Permit and a General Employment Permit have different occupation, remuneration and duration requirements.',
    nextStep: 'Some qualifying Critical Skills permit holders can move to Stamp 4 after the relevant period of qualifying employment. Stamp 4 changes work permission but is not permanent residence or citizenship.',
    verify: ['The exact employment permit and eligible qualifying work history', 'Current Stamp 4 upgrade requirements and permitted evidence', 'Any later Long Term Residency or citizenship conditions in a separate application'],
    sourceLabel: 'Irish Immigration — Stamp 4 employment-permit upgrades',
    sourceUrl: 'https://www.irishimmigration.ie/registering-your-immigration-permission/how-to-renew-your-current-permission/information-on-stamp-4-upgrades/'
  },
  netherlands: {
    entry: 'The normal Highly Skilled Migrant route requires an IND-recognised employer and the current salary and contract conditions.',
    nextStep: 'IND has a separate permanent-residence process. It generally requires qualifying continuous residence, a current non-temporary purpose, sufficient income and civic integration or a lawful exemption.',
    verify: ['Whether the permit and periods of residence count', 'Registration, income and any absence history', 'Applicable integration obligations or exemptions'],
    sourceLabel: 'IND — Permanent residence permit',
    sourceUrl: 'https://ind.nl/en/replace-extend-renew-and-change/permanent-residency/permanent-residence-permit'
  },
  denmark: {
    entry: 'A work permit under the Positive List or Pay Limit Scheme relates to a particular qualifying job and has its own renewal or job-change rules.',
    nextStep: 'Danish permanent residence is a separate process, normally with substantial residence, employment, language and integration conditions. An accelerated period is possible only under additional statutory conditions.',
    verify: ['Current qualifying residence history and employment', 'Basic and supplementary permanent-residence requirements', 'Danish-language, housing and relevant integration conditions'],
    sourceLabel: 'New to Denmark — Permanent residence',
    sourceUrl: 'https://www.nyidanmark.dk/en-GB/Applying/Permanent%20residence%20permit/Permanent%20residence'
  },
  japan: {
    entry: 'Engineer/Specialist in Humanities/International Services and Highly Skilled Professional are different statuses of residence with specific duty and eligibility rules.',
    nextStep: 'Permanent residence is a separate Japanese immigration decision. The general continuous-residence expectation has specific exceptions, including qualifying highly skilled cases, but no job title automatically satisfies them.',
    verify: ['Appropriate status, contracted duties and compliant residence history', 'Tax, pension and other public obligations', 'Whether a highly skilled exception actually applies'],
    sourceLabel: 'Immigration Services Agency — Permanent-residence guidance',
    sourceUrl: 'https://www.moj.go.jp/isa/applications/resources/nyukan_nyukan50.html'
  },
  sweden: {
    entry: 'An ordinary Swedish employment permit and an EU Blue Card have separate job, remuneration and insurance requirements.',
    nextStep: 'Certain workers may apply for permanent residence when extending their work permit, after sufficient qualifying work/residence history and subject to the current self-support and conduct tests.',
    verify: ['Permit type and relevant employment history', 'Sustainable maintenance and other current permanent-residence criteria', 'Conditions for each accompanying family member'],
    sourceLabel: 'Swedish Migration Agency — Work-permit extension and permanent residence',
    sourceUrl: 'https://www.migrationsverket.se/en/you-want-to-extend/work/employee-or-self-employed/employees.html'
  },
  finland: {
    entry: 'A confirmed qualifying job may support a Specialist residence permit or a different suitable employment residence route.',
    nextStep: 'For applications from January 2026, Finnish permanent residence is assessed under distinct application paths. Residence length alone does not satisfy all routes: work history, language, qualification or income conditions can matter.',
    verify: ['Which of Migri’s permanent residence paths applies', 'Eligible continuous residence and work history', 'Required Finnish/Swedish integration, education or income evidence for the selected path'],
    sourceLabel: 'Finnish Immigration Service — Permanent residence',
    sourceUrl: 'https://migri.fi/permanent-residence-permit'
  },
  portugal: {
    entry: 'Remote work for an overseas entity and local employment are distinct immigration arrangements; first obtain and maintain the appropriate Portuguese residence route.',
    nextStep: 'AIMA administers a separate permanent-residence application with residence-history, identity, means, accommodation and other documentation rules. Approval of a digital-nomad residence permit is not permanent residence.',
    verify: ['Lawful qualifying residence and current permit validity', 'AIMA’s current permanent-residence documentary requirements', 'Tax and social-security obligations associated with the actual work structure'],
    sourceLabel: 'AIMA — Permanent residence, Article 80',
    sourceUrl: 'https://aima.gov.pt/pt/viver/autorizacao-de-residencia-permanente-art-80-o'
  },
  spain: {
    entry: 'International telework authorisation applies to qualifying remote activity for overseas entities; Spanish local employment has separate routes.',
    nextStep: 'National long-term residence is a separate Spanish immigration process with its own qualifying continuous-residence and documentation requirements. An international telework visa is not automatic permanent residence.',
    verify: ['Whether the residence status and actual time count', 'Absence limits and other legal long-term-residence conditions', 'Current official rules for applicants and family members'],
    sourceLabel: 'Spain Migration Ministry — National long-term residence',
    sourceUrl: 'https://www.inclusion.gob.es/web/migraciones/w/49.-autorizacion-de-residencia-de-larga-duracion-nacional'
  }
};
