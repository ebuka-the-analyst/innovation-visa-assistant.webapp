/**
 * Fictional QA-only cases, not claims about real businesses or founders.
 * Counts and prices are planning assumptions. No public citations, signed
 * customers, IP rights, revenue or endorsements are implied.
 */
export type QaCaseId = "saas" | "hardware" | "marketplace";
export interface QaFinanceInput {
  counts: [number, number, number];
  unitRevenueGbp: number;
  unitVariableCostGbp: number;
  annualUnitsMultiplier: number;
  annualFixedCostsGbp: [number, number, number];
}
export interface QaFounderCase {
  id: QaCaseId;
  businessName: string;
  industry: string;
  product: string;
  innovationHypothesis: string;
  founderExperience: string;
  businessStage: string;
  evidenceGaps: string[];
  finance: QaFinanceInput;
}
export const QA_FOUNDER_CASES: Record<QaCaseId, QaFounderCase> = {
  saas: {
    id: "saas",
    businessName: "Fictional CircularSupply Software Ltd",
    industry: "UK business-to-business procurement software",
    product: "A prototype for tracking reusable packaging requests and retrieval across buyers and logistics partners",
    innovationHypothesis: "Can verified reuse-event records reduce manual reconciliation for small supply-chain operators?",
    founderExperience: "Fictional founder has three years of full-stack engineering experience; qualifications have not been independently verified",
    businessStage: "Idea / prototype specification; no verified paying customers, revenue, pilot agreement, IP filing or validation survey",
    evidenceGaps: [
      "No signed customer pilots or verified sales",
      "No independently verified environmental savings",
      "No external market-size research or competitor benchmark provided"
    ],
    finance: {
      counts: [8, 32, 84], // hypothetical average active paying accounts by year
      unitRevenueGbp: 220, // monthly subscription fee / account
      unitVariableCostGbp: 40, // monthly variable cost / account
      annualUnitsMultiplier: 12,
      annualFixedCostsGbp: [52000, 78000, 142000]
    }
  },
  hardware: {
    id: "hardware",
    businessName: "Fictional UrbanHeat Sensor Works Ltd",
    industry: "UK environmental sensors and monitoring",
    product: "Proposed low-power temperature and humidity sensor kit with an auditable environmental monitoring dashboard",
    innovationHypothesis: "Could combined low-power hardware and accountable calibration records enable easier monitoring by community organisations?",
    founderExperience: "Fictional founder studied electronic engineering; no verified professional certifications provided",
    businessStage: "Concept stage; no lab calibration, working IP protection, factory quotations, orders or institutional partnerships",
    evidenceGaps: [
      "No laboratory performance validation, accuracy claim or patent search",
      "No verified unit production costs or supplier quotations",
      "No evidence of demand, regulator acceptance or data-sharing approvals"
    ],
    finance: {
      counts: [90, 360, 900], // hypothetical units sold each year
      unitRevenueGbp: 320, // sales price per device
      unitVariableCostGbp: 175, // assumed manufacturing and fulfilment per device
      annualUnitsMultiplier: 1,
      annualFixedCostsGbp: [46000, 78000, 118000]
    }
  },
  marketplace: {
    id: "marketplace",
    businessName: "Fictional AccessibleVenue Connect Ltd",
    industry: "UK accessibility-focused services marketplace",
    product: "Concept for matching verified accessibility requirements with venue providers; no regulated claims are substantiated",
    innovationHypothesis: "Could structured, user-verified accessibility information reduce unsuitable venue bookings?",
    founderExperience: "Fictional founder has experience in operations and product design; not independently verified",
    businessStage: "Discovery only; no customers, platform build, accessibility audits, signed venues or safeguarding framework",
    evidenceGaps: [
      "No verified accessibility records or real provider inventory",
      "No evidence of conversion, churn or customer acquisition cost",
      "No confirmed marketplace demand or compliance approvals"
    ],
    finance: {
      counts: [450, 2900, 7700], // hypothetical completed transactions by year
      unitRevenueGbp: 12, // platform fee per transaction
      unitVariableCostGbp: 3, // variable cost per transaction
      annualUnitsMultiplier: 1,
      annualFixedCostsGbp: [36000, 61000, 105000]
    }
  }
};
export interface QaFinancialYear {
  year: number;
  units: number;
  revenueGbp: number;
  variableCostsGbp: number;
  fixedCostsGbp: number;
  operatingSurplusGbp: number;
}
export function deriveQaFinancials(caseData: QaFounderCase): QaFinancialYear[] {
  const f = caseData.finance;
  return f.counts.map((count, index) => {
    const units = count * f.annualUnitsMultiplier;
    const revenueGbp = units * f.unitRevenueGbp;
    const variableCostsGbp = units * f.unitVariableCostGbp;
    const fixedCostsGbp = f.annualFixedCostsGbp[index];
    return {
      year: index + 1, units, revenueGbp, variableCostsGbp,
      fixedCostsGbp, operatingSurplusGbp: revenueGbp - variableCostsGbp - fixedCostsGbp
    };
  });
}
