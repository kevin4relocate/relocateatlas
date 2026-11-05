/** Owner-supplied referral destinations. Category links are discovery links, not verified vacancies. */
export const referralPartners = {
  mercor: {
    name: 'Mercor',
    officialUrl: 'https://mercor.com',
    programId: 'mercor-owner-referrals',
    links: {
      general: 'https://t.mercor.com/4sRpZ',
      generalApplication: 'https://t.mercor.com/LxJlJ',
      medicine: 'https://t.mercor.com/TFrS8',
      law: 'https://t.mercor.com/g7ct2',
      software: 'https://t.mercor.com/Qt0mR',
      data: 'https://t.mercor.com/JVgnY',
      finance: 'https://t.mercor.com/E3LlQ',
      business: 'https://t.mercor.com/wuOOr',
      sciences: 'https://t.mercor.com/7tJpq',
      art: 'https://t.mercor.com/NGl8o',
      language: 'https://t.mercor.com/62IxC',
      miscellaneous: 'https://t.mercor.com/MIb1m',
      humanities: 'https://t.mercor.com/rZIzD',
      engineering: 'https://t.mercor.com/UqJP0',
    },
  },
} as const;
export type PartnerId = keyof typeof referralPartners;
export type ReferralKey = keyof typeof referralPartners.mercor.links;
export type Category = { slug: string; title: string; summary: string; preparation: string[]; referralKey: ReferralKey; linkScope: string };
const category = (slug: string, title: string, summary: string, preparation: string[], referralKey: ReferralKey, linkScope = title): Category => ({ slug, title, summary, preparation, referralKey, linkScope });
export const aiCategories: Category[] = [
  category('software-engineers', 'Software Engineering', 'Explore how programming, code review and technical reasoning experience can translate into AI evaluation work.', ['Prepare examples of code you can explain and review.', 'Review the languages, technical assessment and experience requested by each listing.'], 'software'),
  category('qa-testing', 'QA & Software Testing', 'A starting point for testers interested in evaluating software behavior, reasoning quality and reproducibility.', ['Prepare clear examples of defects, reproduction steps and risk assessment.', 'Check whether a listing requires testing, coding or application expertise.'], 'general', 'General Mercor opportunities'),
  category('ai-training', 'AI Training & Evaluation', 'Understand work that may involve comparing outputs, applying rubrics and explaining why an answer succeeds or fails.', ['Practice explaining judgments with specific evidence.', 'Read each project’s scope, assessment and time requirements.'], 'general', 'General Mercor opportunities'),
  category('finance', 'Finance & Accounting', 'Explore AI-related work through the lens of financial analysis, accounting and professional judgment.', ['Prepare examples of your analytical specialties.', 'Check professional credentials, jurisdiction and experience requirements.'], 'finance'),
  category('healthcare', 'Medicine & Healthcare', 'A guide for medical professionals exploring expert evaluation and domain reasoning opportunities.', ['Identify your clinical or medical specialty and current credentials.', 'Check licensing, location and confidentiality requirements in the official listing.'], 'medicine', 'Medicine'),
  category('legal', 'Law & Legal', 'Explore opportunities where legal research, interpretation and careful written reasoning may be relevant.', ['Prepare a concise description of your legal expertise.', 'Check jurisdiction, qualification and practice requirements.'], 'law', 'Law'),
  category('research', 'Research & Sciences', 'A starting point for researchers exploring work involving scientific reasoning and specialist knowledge.', ['Summarize your research methods and subject expertise.', 'Check degree, publication and discipline requirements for each role.'], 'sciences', 'Life, Physical & Social Sciences'),
  category('data-analysis', 'Data Analysis', 'Explore the connection between data interpretation, quantitative reasoning and evaluating AI-generated analysis.', ['Prepare examples of analytical methods and tools you use.', 'Review statistical, coding and domain requirements.'], 'data'),
  category('business-operations', 'Business Operations', 'Explore opportunities through experience in business processes, operations and practical decision-making.', ['Describe processes you have managed or improved.', 'Check the requested industry, seniority and project scope.'], 'business'),
  category('art-design', 'Art & Design', 'Explore the relevance of visual judgment, design craft and creative expertise to AI-related work.', ['Prepare relevant portfolio examples.', 'Review medium, software and portfolio requirements in each listing.'], 'art'),
  category('language-audio', 'Language & Audio', 'Explore opportunities through language proficiency, linguistic judgment and audio experience.', ['Describe your languages, proficiency and audio specialties.', 'Check dialect, recording equipment and location requirements.'], 'language'),
  category('humanities', 'Humanities', 'Explore the role of interpretation, argumentation and subject expertise in evaluating complex material.', ['Summarize your subject expertise and writing experience.', 'Review degree, research and language requirements.'], 'humanities'),
  category('other-engineering', 'Other Engineering', 'A starting point for engineers outside software who want to explore specialist AI opportunities.', ['Describe your engineering discipline and practical experience.', 'Check licensing, tools and technical assessment requirements.'], 'engineering'),
  category('miscellaneous', 'Other Specialties', 'Explore other professional categories and check official listings for opportunities matching your background.', ['Identify the specialist knowledge you can demonstrate.', 'Check the exact responsibilities and eligibility of each opportunity.'], 'miscellaneous'),
];
export interface AIOpportunity {
  id: string; title: string; partnerId: PartnerId; categorySlug: string;
  description: string; qualifications: string[]; experience: string | null;
  eligibleCountries: string[] | null; remoteRequirements: string | null;
  compensation: { min: number; max: number; currency: string; unit: 'hour' | 'project' | 'year' } | null;
  employmentClassification: string | null; originalUrl: string; referralKey: ReferralKey;
  referralProgramId: string; lastVerified: string; status: 'open' | 'closed'; featured: boolean;
  seo: { title: string; description: string };
}
// Populate only after checking a genuine individual official listing. Never seed sample jobs.
export const aiOpportunities: AIOpportunity[] = [];
export const activeOpportunities = aiOpportunities.filter(item => item.status === 'open');
export const referralUrl = (key: ReferralKey, partner: PartnerId = 'mercor') => referralPartners[partner].links[key];
