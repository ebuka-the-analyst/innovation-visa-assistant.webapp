import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

const COMPLIANCE_ITEMS = [
  { id: "1", category: "Business Criteria", label: "Genuine, original business plan", required: true },
  { id: "2", category: "Business Criteria", label: "Meets market need or competitive advantage", required: true },
  { id: "3", category: "Business Criteria", label: "Realistic and achievable goals", required: true },
  { id: "4", category: "Financial", label: "Mandatory savings £1,270 verified", required: true },
  { id: "5", category: "Financial", label: "Appropriate funding documented", required: true },
  { id: "6", category: "Language", label: "English B2 or higher proven", required: true },
  { id: "7", category: "Documentation", label: "All supporting documents organized", required: true },
  { id: "8", category: "Endorsement", label: "Endorsement endorser identified", required: true },
  { id: "9", category: "Eligibility", label: "Founder instrumental to business", required: true },
  { id: "10", category: "Evidence", label: "Job creation potential demonstrated", required: true },
  { id: "11", category: "Evidence", label: "Scalability evidence provided", required: false },
  { id: "12", category: "Evidence", label: "Market research completed", required: false },
  { id: "13", category: "Evidence", label: "Team credentials documented", required: false },
  { id: "14", category: "Evidence", label: "Financial projections prepared", required: false },
  { id: "15", category: "Evidence", label: "IP strategy defined", required: false },
];

export default function ComplianceChecker() {
  const [checks, setChecks] = useState<{ [key: string]: boolean }>({});

  const required = COMPLIANCE_ITEMS.filter(i => i.required);
  const optional = COMPLIANCE_ITEMS.filter(i => !i.required);

  const requiredCompleted = required.filter(i => checks[i.id]).length;
  const optionalCompleted = optional.filter(i => checks[i.id]).length;
  const totalProgress = (requiredCompleted + optionalCompleted) / COMPLIANCE_ITEMS.length;

  const isReadyToApply = requiredCompleted === required.length;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-4xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Compliance Checker</h1>
            <p className="text-lg text-muted-foreground">15-point application readiness checklist</p>
          </div>

          <Card className="p-6 mb-6">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{Math.round(totalProgress * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div style={{ width: `${totalProgress * 100}%` }} className="bg-primary h-3 rounded-full transition-all"></div>
              </div>
            </div>

            <div className={`text-sm font-semibold p-3 rounded-md ${isReadyToApply ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
              {isReadyToApply ? '✓ Ready to apply!' : '✗ Complete required items before applying'}
            </div>
          </Card>

          <div className="space-y-4">
            {[...required, ...optional].map(item => (
              <Card key={item.id} className="p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox checked={checks[item.id] || false} onCheckedChange={e => setChecks({...checks, [item.id]: !!e})} className="mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.category} {!item.required && '(optional)'}</p>
                  </div>
                </label>
              </Card>
            ))}
          </div>

          <Card className="p-4 mt-6 bg-blue-50">
            <p className="text-sm"><strong>Progress:</strong> {requiredCompleted}/{required.length} required · {optionalCompleted}/{optional.length} optional</p>
          </Card>
        </div>
      </div>
    </>
  );
}
