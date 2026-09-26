# Phase 2 country-library editorial and release QA

**Scope:** Expand the free Relocate Works country library from 10 to 14 destinations, refresh the five previously generic market records and make long-term settlement research visible. This is not legal, tax or regulated financial advice. Do not publish a dated editorial-edition banner on the site.

## Publication model

- The website has **14 informational country guides**: Australia, New Zealand, United Kingdom, Germany, Canada, Singapore, Ireland, Netherlands, Denmark, Japan, Sweden, Finland, Portugal and Spain.
- The **separate Substack newsletter** has an established set of 10 weekly job-research markets (the first ten listed above). A free country guide does not promise that new market's vacancies in any newsletter issue.
- Live vacancy dates, individual active hiring claims and direct apply URLs stay **exclusively on Substack**. Generic on-site job-market *guides* are not a live job board.

## Country material and provenance

- `src/data.ts`: data-driven 14-country listing and per-country visa, taxation, careers, costs, healthcare, cities and settling-in paragraphs. Five previously reused generic records (Singapore, Ireland, Netherlands, Denmark and Japan) were rewritten with differentiated legal and practical details.
- `src/countryEditorial.ts`: personalised pre-departure checklists plus one immigration, tax, healthcare and education *official starting-point link* per country.
- `src/settlementEditorial.ts`: country-specific distinction between entry/work permission and later long-term/permanent residence, with an independent official immigration source and checklist. No "X years guarantees PR" language.
- `src/components/CountryResourcePage.astro`: nine expanded destinations use **qualitative, destination-specific research tasks instead of unsourced numerical pay, rent or shipping estimates**. The original five focus-market numeric templates remain historical illustrative figures, **not independently verified market data**; fact-check or replace them before treating the numbers as investment-grade evidence. The original five are Australia, New Zealand, United Kingdom, Germany and Canada.
- Source links are destinations for reader verification, **not line-by-line attribution for every legacy claim**. Visa thresholds, health entitlements, income-tax bands, applicable calendar periods and immigration administration change over time; if a figure cannot be reliably sourced and dated, do not fabricate it.

### Primary official starting points for the four new destinations

| Country | Immigration | Long-term residence |
| --- | --- | --- |
| Sweden | Swedish Migration Agency — EU Blue Card: https://www.migrationsverket.se/en/you-want-to-apply/work/employee-or-self-employed/eu-blue-cards.html | Agency employee extension/permanent-residence guidance: https://www.migrationsverket.se/en/you-want-to-extend/work/employee-or-self-employed/employees.html |
| Finland | Migri — Specialist residence permit: https://migri.fi/en/specialist | Migri — revised Jan 2026 permanent residence: https://migri.fi/permanent-residence-permit |
| Portugal | AIMA — remote work outside Portugal: https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-o-exercicio-de-atividade-profissional-prestada-de-forma-remota-com-visto-de-residencia-para-o-exe | AIMA — permanent residence Article 80: https://aima.gov.pt/pt/viver/autorizacao-de-residencia-permanente-art-80-o |
| Spain | Spain UGE — international teleworkers: https://www.inclusion.gob.es/en/web/unidadgrandesempresas/teletrabajadores | Ministry of Inclusion — national long-term residence: https://www.inclusion.gob.es/web/migraciones/w/49.-autorizacion-de-residencia-de-larga-duracion-nacional |

These government sources were spot-checked via public web search on 26 September 2026. Automated requests to some government hosts can be blocked; a bot block is not a broken link.

## Build and content gates

```bash
npm ci
npm run build
npm run check:site
```

The script verifies all 14 country overview routes and on-page residence sections, internal links and page anchors, and all six subject routes for the **nine expanded destinations**. It also asserts that these nine destinations have the qualitative approach rather than legacy hardcoded numeric profiles. It checks for nine distinct original blog articles.

Before shipping, inspect all 14 overviews and sample `/visas/`, `/salaries/`, `/cost-of-living/` and `/jobs/` subpages on actual desktop and mobile browsers. Click direct government source links manually. Run the optional external-link inventory script, interpreting rate limits and bot protection as manual review rather than hard failures.

## Editorial release risks and next audits

1. **Older numerical claims** in original focus-market resource templates have not undergone a fresh independently sourced audit; they now display an illustrative-data caveat. Replace with attributable, date-stamped statistics or qualitative research prompts as appropriate.
2. The new markets' employer categories and example occupations are **research starting points**, not verified live vacancy volumes or visa eligibility.
3. Review policy changes when announced, especially work-permit salary updates, residence-law reforms and cross-border tax treatment.
4. After merging redesign PR #4 into `main`, retarget and merge Phase 2 PR #5 only after CI on the final head and manual visual/link checks. Confirm the resulting production deployment and search indexing separately.
