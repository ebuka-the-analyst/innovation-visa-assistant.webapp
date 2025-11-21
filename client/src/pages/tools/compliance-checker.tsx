import { useState } from "react";
import { Card } from "@/components/ui/card";

export default function ComplianceChecker() {
  const [checklist, setChecklist] = useState({
    business_plan: false,
    unique_genuine: false,
    market_need: false,
    founder_involved: false,
    realistic_viability: false,
    job_creation: false,
    scalability_evidence: false,
    capital_appropriate: false,
    legitimate_funds: false,
    english_b2: false,
    personal_savings_1270: false,
    savings_28_days: false,
    no_switching_restrictions: false,
    endorsement_letter: false,
    document_authenticity: false,
  });

  const completed = Object.values(checklist).filter(Boolean).length;
  const total = Object.keys(checklist).length;
  const percentage = Math.round((completed / total) * 100);

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Compliance Checker</h1>
          <p className="text-muted-foreground mt-2">
            Ensure your application meets all UK Innovation Founder Visa requirements
          </p>
        </div>

        {/* Progress */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Compliance Progress</h2>
            <span className="text-2xl font-bold text-blue-600">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{completed} of {total} items completed</p>
        </Card>

        {/* Business Criteria */}
        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-lg">Business Criteria (Endorser Assessment)</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.business_plan}
                onChange={() => toggleCheck('business_plan')}
                className="w-4 h-4"
                data-testid="check-business-plan"
              />
              <span>Have a genuine, original business plan</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.unique_genuine}
                onChange={() => toggleCheck('unique_genuine')}
                className="w-4 h-4"
                data-testid="check-unique-genuine"
              />
              <span>Plan meets a market need or creates competitive advantage</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.market_need}
                onChange={() => toggleCheck('market_need')}
                className="w-4 h-4"
                data-testid="check-market-need"
              />
              <span>Evidence of market research and opportunity validation</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.founder_involved}
                onChange={() => toggleCheck('founder_involved')}
                className="w-4 h-4"
                data-testid="check-founder-involved"
              />
              <span>Founder is instrumental founder (not just joining)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.realistic_viability}
                onChange={() => toggleCheck('realistic_viability')}
                className="w-4 h-4"
                data-testid="check-realistic-viability"
              />
              <span>Plan is realistic and achievable with your resources</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.job_creation}
                onChange={() => toggleCheck('job_creation')}
                className="w-4 h-4"
                data-testid="check-job-creation"
              />
              <span>Evidence of job creation and growth potential</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.scalability_evidence}
                onChange={() => toggleCheck('scalability_evidence')}
                className="w-4 h-4"
                data-testid="check-scalability-evidence"
              />
              <span>Plan demonstrates scalability to national/international markets</span>
            </label>
          </div>
        </Card>

        {/* Financial Requirements */}
        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-lg">Financial Requirements</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.capital_appropriate}
                onChange={() => toggleCheck('capital_appropriate')}
                className="w-4 h-4"
                data-testid="check-capital-appropriate"
              />
              <span>Funding amount is appropriate for your business stage</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.legitimate_funds}
                onChange={() => toggleCheck('legitimate_funds')}
                className="w-4 h-4"
                data-testid="check-legitimate-funds"
              />
              <span>Funds have legitimate, verifiable sources (no laundering concerns)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.personal_savings_1270}
                onChange={() => toggleCheck('personal_savings_1270')}
                className="w-4 h-4"
                data-testid="check-personal-savings"
              />
              <span>Have £1,270 personal savings (mandatory for all applicants)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.savings_28_days}
                onChange={() => toggleCheck('savings_28_days')}
                className="w-4 h-4"
                data-testid="check-savings-28days"
              />
              <span>Personal savings held for 28 consecutive days</span>
            </label>
          </div>
        </Card>

        {/* Language & Eligibility */}
        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-lg">Language & Eligibility</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.english_b2}
                onChange={() => toggleCheck('english_b2')}
                className="w-4 h-4"
                data-testid="check-english-b2"
              />
              <span>Meet English B2 level requirement (GCSE/A-Level/UK degree/IELTS 7.0+)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.no_switching_restrictions}
                onChange={() => toggleCheck('no_switching_restrictions')}
                className="w-4 h-4"
                data-testid="check-switching-restrictions"
              />
              <span>Not coming from restricted visa (Visitor/Student/Seasonal Worker)</span>
            </label>
          </div>
        </Card>

        {/* Documentation */}
        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-lg">Documentation</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.endorsement_letter}
                onChange={() => toggleCheck('endorsement_letter')}
                className="w-4 h-4"
                data-testid="check-endorsement-letter"
              />
              <span>Endorsement letter from approved body (within 3 months of application)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.document_authenticity}
                onChange={() => toggleCheck('document_authenticity')}
                className="w-4 h-4"
                data-testid="check-document-authenticity"
              />
              <span>All documents authentic and certified (translations where needed)</span>
            </label>
          </div>
        </Card>

        {/* Status */}
        <Card className={`p-6 ${percentage === 100 ? 'bg-green-50 dark:bg-green-950/30' : percentage >= 80 ? 'bg-yellow-50 dark:bg-yellow-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
          <h2 className="font-bold mb-2">Compliance Status</h2>
          <p className={`${percentage === 100 ? 'text-green-600' : percentage >= 80 ? 'text-yellow-600' : 'text-red-600'} font-semibold`}>
            {percentage === 100 
              ? "✓ All requirements met - Ready to apply"
              : percentage >= 80 
              ? `⚠ ${total - completed} items remaining`
              : `✗ ${total - completed} critical items need completion`}
          </p>
        </Card>
      </div>
    </div>
  );
}
