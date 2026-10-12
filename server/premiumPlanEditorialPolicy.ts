/**
 * Evidence-first, section-specific editorial policy for new paid memberships.
 * Never manufacture customers, funding, IP, citations or results.
 */
const EDITORIAL_SECTIONS: Record<number, { purpose: string; deliverables: string[] }> = {
  1: {purpose:"Decision-grade executive assessment, not a repeated introduction",deliverables:[
    "Present the innovation, viability and scalability thesis with evidence status for each",
    "Distinguish verified founder capability from unverified assertions",
    "Summarise the SAME three-year revenue, operating costs and operating profit/loss used in the financial section",
    "Identify the three pivotal uncertainties and what proof would change the decision",
    "Provide a practical 90-day evidence-readiness action sequence"]},
  2: {purpose:"Verifiable founder execution capability, not a hypothetical CV",deliverables:[
    "Map each stated credential and experience claim to its specific delivery responsibility",
    "Separate self-reported credentials from verified qualifications, references and work samples",
    "Create a verification register specifying artefact, owner, consent and validation step",
    "Discuss execution gaps with affordable alternatives, not invented advisors"]},
  3: {purpose:"Testable innovation beyond a generic product architecture",deliverables:[
    "Define the baseline alternative and measurable technical/service improvement hypothesis",
    "Detail proposed data flows, user trust boundaries, failure modes and MVP experiments",
    "Use metrics only when appropriate for THIS product: never force MAPE/RMSE on a non-forecasting marketplace",
    "Distinguish architecture specifications from built, evaluated or independently tested systems",
    "Describe privacy, accessibility, bias and operational trade-offs with measurable test gates"]},
  4: {purpose:"Defensible market methodology without invented totals",deliverables:[
    "Define paying customers, end users, buyer organisations and served geography separately",
    "Explain bottom-up TAM/SAM/SOM formulas and mark all missing inputs explicitly",
    "Create a source-check register for industry and competitor claims, publication dates and uncertainty",
    "Describe consented customer discovery and falsifiable willingness-to-pay thresholds",
    "Only populate competitor figures when their actual sources are available"]},
  5: {purpose:"Reconciled financial decision model, not generic finance commentary",deliverables:[
    "Give a canonical Year 1-3 financial bridge: units x fee, revenue, variable costs, fixed costs, operating surplus or deficit",
    "Separate cash flow, profit, funding and tax; do not invent opening cash balances",
    "Explain CAC, retention, repeat usage and LTV methodology but do not calculate ratios without defensible inputs",
    "Quantify downside and upside by varying explicitly labelled assumptions, preserving the supplied baseline",
    "Explain the inputs required for monthly runway and a funded cash-flow projection, including working capital and timing",
    "Derive the break-even equation and affordable go/no-go triggers; disclose persistent losses"]},
  6: {purpose:"Case-specific and conditional regulatory implementation",deliverables:[
    "Explain only relevant UK obligations and distinguish them from matters needing professional legal assessment",
    "Detail privacy, accessibility, retention, data security and incident-response ownership",
    "Provide staged, checkable compliance artefacts and budget methods where inputs are available",
    "Do not force FCA, SOC 2 or a made-up compliance budget onto an unrelated business"]},
  7: {purpose:"Cash-aware people and hiring plan",deliverables:[
    "Distinguish existing staff from proposed hires, contractors and unconfirmed partners",
    "Assign roles and timing to delivery milestones with dependencies",
    "Reconcile all candidate salaries and headcount with supplied fixed-cost envelopes",
    "Provide a slower growth hiring alternative if cash losses persist"]},
  8: {purpose:"Measurable scale mechanisms, not aspirational growth rhetoric",deliverables:[
    "Set verifiable pilot graduation gates for retention, quality, service safety and accessibility",
    "Explain per-person, per-provider and platform operational capacity and bottlenecks",
    "Distinguish transaction growth from contribution margin, cash availability and regulatory readiness",
    "Provide cohort and regional scaling experiments with explicit pause and pivot thresholds",
    "Separate planned numbers from achieved results and reveal resource requirements"]},
  9: {purpose:"Decision-useful risk register rather than a repeated SWOT",deliverables:[
    "Assign an owner or explicitly unassigned ownership to each material risk",
    "State the leading indicator, trigger, response timeframe and contingency for each",
    "Reconcile financial downside with burn rate and funding constraints",
    "Give residual risk, evidence needed and a no-launch condition",
    "Cross-reference—not copy—financial and delivery assumptions"]},
  10: {purpose:"Strategic trade-offs, not generic SWOT adjectives",deliverables:[
    "Ground each strength or weakness in case-specific mechanics and evidence status",
    "Separate controllable operational weaknesses from external threats",
    "State the funding, research or roadmap consequence of each priority issue",
    "Do not count unverified hypotheses as proven strengths"]},
  11: {purpose:"Buyer/user validation with honest samples",deliverables:[
    "Distinguish observed customers from hypothetical research personas",
    "Set out consented research questions about accessibility, safeguarding and privacy",
    "Define acquisition, conversion, retention and feedback measures without claiming results",
    "Identify data and sample bias with falsifiable product-market-fit gates"]},
  12: {purpose:"Commercial acquisition consistent with finance and operations",deliverables:[
    "Define targeted channel experiments with privacy, consent and accessibility safeguards",
    "Separate speculative marketing budgets from committed expenditure",
    "Explain the fully loaded CAC denominator, contribution margin and stop/scale decision criteria",
    "Tie lead or booking volume to actual service delivery and cash capacity"]},
  13: {purpose:"Evidence-led endorsement and interview preparation, never a guarantee",deliverables:[
    "Map innovation, viability and scalability claims to proof held, proof missing, action owner and dependency",
    "Distinguish established eligibility requirements from provider policies needing current official verification",
    "Propose hard interview questions with honest, specific answers and explicit unknowns",
    "Provide evidence index, sequencing, ownership and no-submit conditions",
    "Never invent endorsing body engagement, endorsement probabilities or actual supporting letters"]},
};

export function getPremiumSectionEditorialGuidance(tier: string, sectionNumber: number): string {
  if (!["founder", "founder_pro", "founder_pass_90d"].includes(tier)) return "";
  const role = EDITORIAL_SECTIONS[sectionNumber];
  if (!role) return "";
  return [
    "NEW MEMBERSHIP EDITORIAL POLICY (OVERRIDES GENERIC EXAMPLES ABOVE):",
    "Purpose: " + role.purpose,
    "Depth must come from relevant methods, decision thresholds, calculations, limitations and evidence—not repeated filler or artificial page-padding.",
    "If an input is missing, identify how to verify it; do not invent an outcome, source, partner, patent or sale.",
    "Use specialised metrics such as forecasting error, LTV:CAC and research validation ONLY if appropriate to the sector and supported by evidence. Never present examples as actual results.",
    "Avoid FinTech-only sales benchmarks, fixed compliance budgets and named academic references unless relevant and supplied.",
    "Maintain the same financial baseline in every section. New scenarios must be labelled and independently derived.",
    "Use sector-specific subsections, no duplicate main heading, no SVG or HTML diagrams. Prefer Markdown tables for real comparative inputs.",
    "Distinct required contributions:",
    ...role.deliverables.map((item,index) => String(index+1) + ". " + item),
  ].join("\n");
}
