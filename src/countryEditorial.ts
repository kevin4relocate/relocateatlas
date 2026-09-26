/**
 * Country-specific editorial checklists and official starting points.
 * Relocate Works is an informational site; current vacancies are published on Substack only.
 * Edition: September 2026. Never interpret a pathway as guaranteed eligibility.
 */
export type OfficialResource = {
  label: string;
  url: string;
  detail: string;
};
export type CountryEditorial = {
  focus: string;
  visaChecklist: readonly string[];
  moneyChecklist: readonly string[];
  arrivalChecklist: readonly string[];
  familyNote: string;
  resources: {
    immigration: OfficialResource;
    tax: OfficialResource;
    healthcare: OfficialResource;
    education: OfficialResource;
  };
};

export const countryEditorial: Record<string, CountryEditorial> = {
  australia: {
    focus: 'Compare the employer-sponsored Skills in Demand pathway against other skilled migration options; occupation, nomination, English, salary and experience requirements depend on your circumstances.',
    visaChecklist: [
      'Ask whether the employer will nominate you for a specific work-visa stream; a job advertisement alone is not a sponsorship commitment.',
      'Check the nominated occupation, relevant experience, registration or skills assessment, English evidence and visa conditions.',
      'Compare employer-supported temporary and permanent pathways using the current Home Affairs guidance.'
    ],
    moneyChecklist: [
      'Compare after-tax pay and compulsory superannuation arrangements, not only advertised annual salary.',
      'Research rental bonds, upfront rent and commuting costs in your target city before signing an offer.'
    ],
    arrivalChecklist: [
      'Check Medicare eligibility for your exact visa and arrange appropriate cover where required.',
      'Plan a Tax File Number application, banking, housing inspection and professional registration where applicable.',
      'For accompanying children, compare state or territory school enrolment and possible temporary-resident fees.'
    ],
    familyNote: 'Partner work conditions, children’s schooling and access to public healthcare can differ by visa and state or territory. Verify them for your family before booking travel.',
    resources: {
      immigration: { label: 'Australian Department of Home Affairs — sponsored skilled visas', url: 'https://immi.homeaffairs.gov.au/employer-subsite/Pages/compare-sponsored-skilled-visa-options.aspx', detail: 'Compare current sponsored pathways and nomination requirements.' },
      tax: { label: 'Australian Taxation Office', url: 'https://www.ato.gov.au/', detail: 'Tax residency, tax rates, TFN and superannuation.' },
      healthcare: { label: 'Services Australia — Medicare', url: 'https://www.servicesaustralia.gov.au/medicare', detail: 'Check healthcare eligibility for your visa.' },
      education: { label: 'Australian Government — Education', url: 'https://www.education.gov.au/', detail: 'Starting point; check state and territory enrolment rules as well.' }
    }
  },
  'new-zealand': {
    focus: 'Distinguish the Accredited Employer Work Visa (AEWV) from potential residence pathways. An accredited employer alone does not establish visa or residence eligibility.',
    visaChecklist: [
      'Verify the employer in Immigration New Zealand’s accredited employer register and ask about the approved job check.',
      'Compare your occupation, offered pay, experience, English and any required occupational registration against the current visa rules.',
      'If long-term residence matters, check the current Skilled Migrant and Green List rules independently rather than assuming an AEWV leads automatically to residence.'
    ],
    moneyChecklist: [
      'Use Inland Revenue guidance to estimate PAYE and any other deductions that apply to your circumstances.',
      'Compare rent, bond, transport and short-term accommodation costs in your proposed city.'
    ],
    arrivalChecklist: [
      'Check public healthcare eligibility for your exact visa duration and family members before cancelling overseas insurance.',
      'Plan an IRD number, banking, tenancy arrangements and local licensing or professional registration.',
      'Check school enrolment and domestic/international fee status for every accompanying child.'
    ],
    familyNote: 'AEWV partner and dependent-child eligibility depends on the job, pay and other conditions. Check each family member’s route separately.',
    resources: {
      immigration: { label: 'Immigration New Zealand — AEWV', url: 'https://www.immigration.govt.nz/visas/accredited-employer-work-visa/', detail: 'Official work-visa eligibility, employer and job rules.' },
      tax: { label: 'Inland Revenue — individual tax rates', url: 'https://www.ird.govt.nz/en/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals', detail: 'Progressive tax brackets and PAYE starting points.' },
      healthcare: { label: 'New Zealand Government — health services', url: 'https://www.govt.nz/browse/health/', detail: 'Use official health services guidance and check migrant eligibility.' },
      education: { label: 'New Zealand Ministry of Education', url: 'https://www.education.govt.nz/', detail: 'Schooling and enrolment information.' }
    }
  },
  'united-kingdom': {
    focus: 'Start with the current Skilled Worker eligibility and sponsor-register rules. Salary, occupation and dependant rules vary by visa route and circumstances.',
    visaChecklist: [
      'Check whether the employer is approved to sponsor and whether the specific position includes a Certificate of Sponsorship.',
      'Review the current eligible occupation, salary, English and document requirements for the exact visa route.',
      'Check family eligibility and possible healthcare surcharge before comparing total relocation costs.'
    ],
    moneyChecklist: [
      'Estimate take-home pay including Income Tax and National Insurance; Scottish income-tax bands may differ.',
      'Budget for rent, council tax, commuting, visa application costs and upfront housing deposits.'
    ],
    arrivalChecklist: [
      'Verify NHS access and any immigration health surcharge obligations associated with your visa.',
      'Plan banking, tax and National Insurance administration and research tenant rights.',
      'Review school admissions under the rules for the relevant UK nation and local authority.'
    ],
    familyNote: 'Do not assume every sponsored worker can bring dependants under the same terms; check the specific visa route and current restrictions.',
    resources: {
      immigration: { label: 'GOV.UK — Skilled Worker visa', url: 'https://www.gov.uk/skilled-worker-visa', detail: 'Eligibility, sponsorship, occupation and application guidance.' },
      tax: { label: 'GOV.UK — Income Tax', url: 'https://www.gov.uk/income-tax', detail: 'Tax bands, allowances and links to current rates.' },
      healthcare: { label: 'NHS — visiting or moving to England', url: 'https://www.nhs.uk/nhs-services/visiting-or-moving-to-england/', detail: 'England-focused guidance; other UK nations publish their own guidance.' },
      education: { label: 'GOV.UK — school admissions', url: 'https://www.gov.uk/schools-admissions', detail: 'School admissions starting point, subject to local rules.' }
    }
  },
  germany: {
    focus: 'In Germany, a suitable work or residence pathway is not necessarily the same as employer visa sponsorship. Compare the EU Blue Card with other skilled-worker routes based on qualification and salary.',
    visaChecklist: [
      'Check whether your qualification requires recognition and whether the job and salary satisfy the relevant residence route.',
      'Ask employers whether they provide immigration paperwork assistance, relocation funding, both or neither.',
      'Check German-language requirements for your profession and municipality, including regulated occupations.'
    ],
    moneyChecklist: [
      'Estimate net pay after tax and mandatory social contributions; household circumstances can change deductions.',
      'Budget for rental deposits, temporary accommodation and registration-related setup expenses.'
    ],
    arrivalChecklist: [
      'Arrange health insurance with no coverage gap and check what begins through employment.',
      'Plan address registration, tax-identification administration and any qualification-recognition paperwork.',
      'Investigate local childcare places and school options early if relocating with children.'
    ],
    familyNote: 'Family reunification and settlement options depend on residence title, family circumstances and applicable language or financial rules.',
    resources: {
      immigration: { label: 'Make it in Germany — EU Blue Card', url: 'https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card', detail: 'Official federal portal describing Blue Card eligibility.' },
      tax: { label: 'Make it in Germany — salary, taxes and social security', url: 'https://www.make-it-in-germany.com/en/working-in-germany/working-environment/salary-taxes-social-security', detail: 'Official starting point for gross-to-net planning.' },
      healthcare: { label: 'Make it in Germany — health insurance', url: 'https://www.make-it-in-germany.com/en/living-in-germany/money-insurance/health-insurance', detail: 'Insurance models and practical first-arrival advice.' },
      education: { label: 'Make it in Germany — living in Germany', url: 'https://www.make-it-in-germany.com/en/living-in-germany', detail: 'Navigate family-life and settlement resources.' }
    }
  },
  canada: {
    focus: 'Work permits, provincial services and eventual permanent-residence options are separate questions. Review your exact province and employer-specific conditions.',
    visaChecklist: [
      'Clarify whether the offer supports an employer-specific work permit and whether an LMIA or exemption is relevant.',
      'Check professional licensing and credential recognition with the appropriate province or regulator.',
      'Research residence options separately; a work permit or a positive employer signal is not a guarantee of permanent residence.'
    ],
    moneyChecklist: [
      'Calculate federal and provincial/territorial taxes, pension and employment-insurance deductions for your destination.',
      'Estimate rental deposits, winter costs, transport and any private cover needed during healthcare waiting periods.'
    ],
    arrivalChecklist: [
      'Check provincial or territorial health-plan eligibility and any waiting or registration requirements.',
      'Plan a Social Insurance Number, banking, proof of address and local professional registration.',
      'Review school registration and the documents required in the intended province or territory.'
    ],
    familyNote: 'Spousal work permits, children’s school status and provincial healthcare rules depend on permit conditions and family circumstances.',
    resources: {
      immigration: { label: 'IRCC — work in Canada', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html', detail: 'Official work-permit routes and application requirements.' },
      tax: { label: 'Canada Revenue Agency', url: 'https://www.canada.ca/en/revenue-agency.html', detail: 'Federal tax information; investigate provincial rules too.' },
      healthcare: { label: 'Health Canada', url: 'https://www.canada.ca/en/health-canada.html', detail: 'Federal health resources; provincial/territorial plans determine coverage.' },
      education: { label: 'Government of Canada — education', url: 'https://www.canada.ca/en/services/benefits/education.html', detail: 'Federal starting point; confirm rules with provincial school authorities.' }
    }
  },
  singapore: {
    focus: 'Employment Pass and S Pass requirements are different. Salary, assessment frameworks and employer responsibilities must be checked against current Ministry of Manpower rules.',
    visaChecklist: [
      'Confirm which work pass the employer intends to apply for and whether the advertised salary satisfies the age- and sector-specific rules.',
      'For Employment Pass, review the current qualifying salary and COMPASS criteria unless exempt.',
      'Clarify relocation allowances, pass-application responsibilities and any dependant-pass eligibility.'
    ],
    moneyChecklist: [
      'Check your tax-residency situation with IRAS; do not assume a single resident rate applies from your first workday.',
      'Compare housing costs, deposits, public transport and the difference between an allowance and salary.'
    ],
    arrivalChecklist: [
      'Ask explicitly what employer medical insurance covers; Employment Pass insurance arrangements differ from those of some other pass types.',
      'Plan local banking, tenancy paperwork, pass issuance and arrival administration.',
      'Check international-school availability and Ministry of Education admission rules before a family move.'
    ],
    familyNote: 'Partner and child pass eligibility is not identical across work-pass categories and depends on current salary and other rules.',
    resources: {
      immigration: { label: 'Ministry of Manpower — Employment Pass eligibility', url: 'https://www.mom.gov.sg/passes-and-permits/employment-pass/eligibility', detail: 'Official current salary and COMPASS criteria.' },
      tax: { label: 'Inland Revenue Authority of Singapore — individual income tax', url: 'https://www.iras.gov.sg/taxes/individual-income-tax', detail: 'Tax residency and individual tax guidance.' },
      healthcare: { label: 'Singapore Ministry of Health', url: 'https://www.moh.gov.sg/', detail: 'Healthcare-system information; confirm employer insurance benefits separately.' },
      education: { label: 'Singapore Ministry of Education', url: 'https://www.moe.gov.sg/', detail: 'School admissions, international students and education information.' }
    }
  },
  ireland: {
    focus: 'Compare the Critical Skills Employment Permit and General Employment Permit against the occupation, remuneration and contract of the actual job.',
    visaChecklist: [
      'Check whether your occupation and proposed remuneration fit the current permit type, rather than relying on an employer’s general international profile.',
      'Verify the contract duration and whether the employer or employee will handle the employment-permit application.',
      'Review professional registration where required and distinguish the employment permit from subsequent immigration permission.'
    ],
    moneyChecklist: [
      'Estimate PAYE, USC and PRSI where applicable rather than using gross annual pay as take-home pay.',
      'Research the actual rental market near the job location, including deposits and temporary accommodation.'
    ],
    arrivalChecklist: [
      'Check public-health eligibility and whether the role includes private medical benefits.',
      'Plan registration, PPS number, banking, accommodation and any professional-body membership.',
      'Check local school placement and childcare availability if relocating with children.'
    ],
    familyNote: 'Family reunification and work permissions depend on the permit and immigration category; verify individual family circumstances.',
    resources: {
      immigration: { label: 'Department of Enterprise — employment permits', url: 'https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/', detail: 'Official permit categories and application eligibility.' },
      tax: { label: 'Revenue Ireland', url: 'https://www.revenue.ie/en/home.aspx', detail: 'PAYE, income tax, USC and newcomer guidance.' },
      healthcare: { label: 'Health Service Executive', url: 'https://www2.hse.ie/', detail: 'Public healthcare and eligibility starting point.' },
      education: { label: 'Department of Education and Youth', url: 'https://www.gov.ie/en/organisation/department-of-education/', detail: 'Schooling and family education information.' }
    }
  },
  netherlands: {
    focus: 'For the Dutch highly skilled migrant route, a recognised sponsor and the current salary criterion are essential. Do not treat register inclusion as a promise for every vacancy.',
    visaChecklist: [
      'Check whether the employer appears in the IND recognised-sponsor register and confirms support for your specific role.',
      'Review the current income threshold for your age and circumstance, qualification or registration rules where applicable.',
      'Ask about relocation support, the residence-permit process and any probation or contract conditions.'
    ],
    moneyChecklist: [
      'Estimate income tax, social contributions and any special tax treatment only if you can establish personal eligibility.',
      'Research housing availability, rental deposit, municipal charges and commuting costs in the specific city.'
    ],
    arrivalChecklist: [
      'Check Dutch health-insurance enrollment rules and plan required cover promptly after arrival.',
      'Plan municipal registration (BRP), BSN, banking and family housing logistics.',
      'Research school language and international-school options early if accompanying children need them.'
    ],
    familyNote: 'Family residence and work rights depend on the principal applicant’s permit and the family’s circumstances.',
    resources: {
      immigration: { label: 'IND — highly skilled migrant', url: 'https://ind.nl/en/residence-permits/work/highly-skilled-migrant', detail: 'Official route requirements and recognised-sponsor obligations.' },
      tax: { label: 'Dutch Tax Administration — individuals', url: 'https://www.belastingdienst.nl/wps/wcm/connect/en/individuals/individuals', detail: 'Income tax, tax residence and official guidance.' },
      healthcare: { label: 'Government of the Netherlands — health insurance', url: 'https://www.government.nl/topics/health-insurance', detail: 'Health insurance duties and coverage information.' },
      education: { label: 'Government of the Netherlands — education', url: 'https://www.government.nl/topics/education', detail: 'School system and admissions starting point.' }
    }
  },
  denmark: {
    focus: 'Compare the current Pay Limit and Positive List work schemes. Your chosen scheme determines salary or occupation requirements.',
    visaChecklist: [
      'Verify your contract salary against the current scheme rules, including salary elements that count for eligibility.',
      'If your role is on a Positive List, check the occupation and educational requirements, not just the job title.',
      'Ask whether the employer helps with work-permit paperwork and whether accompanying family permits are possible.'
    ],
    moneyChecklist: [
      'Estimate tax using the Danish Tax Agency’s current guidance; withholding depends on tax card and personal circumstances.',
      'Research rental deposits, prepaid rent, local transport and potential childcare costs.'
    ],
    arrivalChecklist: [
      'Plan residence registration, CPR number, tax card and healthcare access under your actual residence status.',
      'Check the conditions and timing for receiving the yellow health card.',
      'Review municipal schools and Danish-language or international-school options.'
    ],
    familyNote: 'Check family-accompanying rules and whether your employer provides practical registration support.',
    resources: {
      immigration: { label: 'New to Denmark — Pay Limit Schemes', url: 'https://nyidanmark.dk/en-GB/You-want-to-apply/Work/The-Pay-Limit-Schemes', detail: 'Official salary-based work permit guidance.' },
      tax: { label: 'Danish Tax Agency — individuals', url: 'https://skat.dk/en-us/individuals', detail: 'Tax-card and annual tax-assessment information.' },
      healthcare: { label: 'Life in Denmark — healthcare', url: 'https://lifeindenmark.borger.dk/healthcare', detail: 'Official resident healthcare starting point.' },
      education: { label: 'Life in Denmark', url: 'https://lifeindenmark.borger.dk/', detail: 'Government portal for family and school information.' }
    }
  },
  japan: {
    focus: 'Match the intended work to the correct Japanese status of residence. Visa paperwork support, relocation funding and English-speaking workplace access are separate questions.',
    visaChecklist: [
      'Confirm the employer’s proposed status of residence and which party will prepare the Certificate of Eligibility paperwork.',
      'Check whether qualifications and work experience satisfy the relevant status and whether professional registration is necessary.',
      'Ask directly about Japanese-language expectations, translated documents and support for family applications.'
    ],
    moneyChecklist: [
      'Estimate income tax, local inhabitant tax and employee social-insurance deductions using official guidance.',
      'Research moving-in fees, guarantor requirements, commute time and temporary accommodation.'
    ],
    arrivalChecklist: [
      'Clarify enrollment in eligible health and pension insurance and ask the employer which deductions appear on payroll.',
      'Plan residence registration, local banking, phone setup and any required paperwork for a driving licence.',
      'Check municipality and school admission requirements for accompanying children.'
    ],
    familyNote: 'Dependent status, partner work permissions and school arrangements require separate checks for your family and residence category.',
    resources: {
      immigration: { label: 'Ministry of Foreign Affairs — visas', url: 'https://www.mofa.go.jp/j_info/visit/visa/', detail: 'Official guidance including work or long-term residence applications.' },
      tax: { label: 'National Tax Agency of Japan (English)', url: 'https://www.nta.go.jp/english/', detail: 'Individual income tax and official publications.' },
      healthcare: { label: 'Ministry of Health, Labour and Welfare (English)', url: 'https://www.mhlw.go.jp/english/', detail: 'Official health, labour and social-insurance starting point.' },
      education: { label: 'Ministry of Education (English)', url: 'https://www.mext.go.jp/en/', detail: 'National education information; municipal school rules may differ.' }
    }
  }
};
