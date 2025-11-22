import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthHeader } from "@/components/AuthHeader";
import { useState } from "react";

export default function ComplianceChecker() {
  const [checklist, setChecklist] = useState({
    businessPlan: false,
    financialDocs: false,
    personalSavings: false,
    englishProof: false,
    companyRegistration: false,
    taxCompliance: false,
    crb: false,
    addressProof: false,
    investorAgreements: false,
    innovationEvidence: false,
    marketResearch: false,
    ipDocumentation: false,
    endorsementLetter: false,
    foundersId: false,
    fundingProof: false,
  });

  const checks = Object.values(checklist);
  const completedCount = checks.filter(Boolean).length;
  const totalCount = checks.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const toggle = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const items = [
    { key: "businessPlan", label: "Comprehensive Business Plan" },
    { key: "financialDocs", label: "Financial Forecasts (3-5 years)" },
    { key: "personalSavings", label: "Personal Savings Evidence (£1,270)" },
    { key: "englishProof", label: "English Language Proof (B2+)" },
    { key: "companyRegistration", label: "UK Company Registration" },
    { key: "taxCompliance", label: "Tax Registration & Compliance" },
    { key: "crb", label: "CRB/DBS Clearance" },
    { key: "addressProof", label: "UK Address Proof" },
    { key: "investorAgreements", label: "Investment Agreements" },
    { key: "innovationEvidence", label: "Innovation Evidence" },
    { key: "marketResearch", label: "Market Research" },
    { key: "ipDocumentation", label: "IP Documentation" },
    { key: "endorsementLetter", label: "Endorser Assessment Letter" },
    { key: "foundersId", label: "Founder ID & Passports" },
    { key: "fundingProof", label: "Funding Legitimacy Proof" },
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Compliance Checker</h1>
            <p className="text-lg text-muted-foreground">15-point application readiness checklist</p>
          </div>

          <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-4xl font-bold">{percentage}%</p>
                <p className="text-xs text-muted-foreground mt-1">{completedCount} of {totalCount} items</p>
              </div>
              <div className="w-32 h-32 rounded-full bg-white border-4 border-primary flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold">{percentage}%</p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Compliance Checklist</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.key} className="flex items-center gap-3 p-3 border rounded hover:bg-accent/50 cursor-pointer" onClick={() => toggle(item.key as keyof typeof checklist)}>
                  <Checkbox checked={checklist[item.key as keyof typeof checklist]} onChange={() => toggle(item.key as keyof typeof checklist)} />
                  <span className={checklist[item.key as keyof typeof checklist] ? "line-through text-muted-foreground" : ""}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
