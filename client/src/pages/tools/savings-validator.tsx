import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

export default function SavingsValidator() {
  const [mainApplicant, setMainApplicant] = useState(0);
  const [partner, setPartner] = useState(0);
  const [children, setChildren] = useState(0);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const required = {
      main: 1270,
      partner: partner > 0 ? 285 : 0,
      children: children > 0 ? 315 + (children - 1) * 200 : 0,
    };

    const total = required.main + required.partner + required.children;
    const actual = mainApplicant + partner + children;
    const passed = actual >= total;

    setResult({
      required: total,
      actual,
      passed,
      breakdown: required,
    });
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Personal Savings Validator</h1>
            <p className="text-lg text-muted-foreground">Verify you have the mandatory £1,270 savings for 28 consecutive days</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Savings Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Main Applicant Savings (£)</label>
                  <Input type="number" value={mainApplicant} onChange={e => setMainApplicant(parseFloat(e.target.value) || 0)} placeholder="1270" className="mt-2" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Partner Savings (£) - if applicable</label>
                  <Input type="number" value={partner} onChange={e => setPartner(parseFloat(e.target.value) || 0)} placeholder="0" className="mt-2" />
                </div>

                <div>
                  <label className="text-sm font-medium">Children Count</label>
                  <Input type="number" value={children} onChange={e => setChildren(parseInt(e.target.value) || 0)} min="0" placeholder="0" className="mt-2" />
                </div>

                <Button onClick={calculate} className="w-full mt-4">Validate Savings</Button>
              </div>
            </Card>

            <Card className={`p-6 ${result?.passed ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="font-semibold mb-4">Validation Result</h3>
              {result && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Required</p>
                    <p className="text-2xl font-bold">£{result.required}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Savings</p>
                    <p className="text-2xl font-bold">£{result.actual}</p>
                  </div>
                  <div className={`text-sm font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {result.passed ? '✓ COMPLIANT' : '✗ SHORTFALL: £' + (result.required - result.actual)}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Savings Breakdown</h3>
            <div className="text-sm space-y-2 text-muted-foreground">
              <p>• Main Applicant: £1,270 (mandatory)</p>
              <p>• Partner: £285 (if applicable)</p>
              <p>• First Child: £315</p>
              <p>• Each Additional Child: £200</p>
              <p className="mt-4 font-medium text-foreground">Requirement: Must be held for 28 consecutive days before application</p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
