import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function SavingsValidator() {
  const [savings, setSavings] = useState(1270);
  const [dependents, setDependents] = useState(0);
  const [children, setChildren] = useState(0);

  const mandatorySavings = 1270;
  const partnerAmount = 285;
  const firstChildAmount = 315;
  const additionalChildAmount = 200;

  const totalRequired = mandatorySavings + (dependents > 0 ? partnerAmount : 0) + (children > 0 ? firstChildAmount : 0) + Math.max(0, children - 1) * additionalChildAmount;
  const isCompliant = savings >= totalRequired;

  const breakdown = [
    { label: "Personal minimum (28 days)", amount: mandatorySavings },
    ...(dependents > 0 ? [{ label: "Partner/Spouse", amount: partnerAmount }] : []),
    ...(children > 0 ? [{ label: "First child", amount: firstChildAmount }] : []),
    ...(children > 1 ? [{ label: `Additional ${children - 1} children`, amount: (children - 1) * additionalChildAmount }] : []),
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Personal Savings Validator</h1>
            <p className="text-lg text-muted-foreground">Verify mandatory £1,270 savings requirement for 28 consecutive days</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Your Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Savings Amount (£)</label>
                  <Input 
                    type="number" 
                    value={savings} 
                    onChange={(e) => setSavings(Number(e.target.value))} 
                    className="mt-2"
                    data-testid="input-savings-amount"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Dependents</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={dependents} 
                    onChange={(e) => setDependents(Number(e.target.value))} 
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Children</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={children} 
                    onChange={(e) => setChildren(Number(e.target.value))} 
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${isCompliant ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-start gap-3">
                {isCompliant ? (
                  <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div>
                  <h3 className={`font-bold text-lg ${isCompliant ? "text-green-600" : "text-red-600"}`}>
                    {isCompliant ? "✓ COMPLIANT" : "✗ NOT COMPLIANT"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isCompliant 
                      ? "Your savings meet the requirement" 
                      : `You need £${(totalRequired - savings).toLocaleString()} more`}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 mb-8">
            <h3 className="font-semibold mb-4">Required Breakdown</h3>
            <div className="space-y-3">
              {breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border rounded">
                  <span className="text-sm">{item.label}</span>
                  <span className="font-semibold">£{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between items-center font-bold text-lg">
              <span>Total Required</span>
              <span>£{totalRequired.toLocaleString()}</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Your Savings</p>
                <p className="text-3xl font-bold mt-2">£{savings.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Required</p>
                <p className="text-3xl font-bold mt-2">£{totalRequired.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isCompliant ? "Surplus" : "Shortfall"}</p>
                <p className={`text-3xl font-bold mt-2 ${isCompliant ? "text-green-600" : "text-red-600"}`}>
                  £{Math.abs(savings - totalRequired).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
