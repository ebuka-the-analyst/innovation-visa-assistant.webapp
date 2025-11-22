import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const COMPANY_TYPES = [
  { id: "ltd", name: "Limited Company (Ltd)", advantages: ["Limited liability", "Tax efficient", "Professional image", "Easy to raise capital"], disadvantages: ["More regulations", "Annual filing required", "Director responsibilities"], setupCost: 150, yearlyCompliance: 400 },
  { id: "llp", name: "Limited Liability Partnership (LLP)", advantages: ["Flexibility", "Limited liability", "Pass-through taxation", "Partner autonomy"], disadvantages: ["Complex setup", "Multiple directors", "Higher compliance"], setupCost: 300, yearlyCompliance: 600 },
  { id: "sole", name: "Sole Trader", advantages: ["Simple setup", "Low cost", "Full control", "Minimal paperwork"], disadvantages: ["Unlimited liability", "Less professional", "Harder to raise capital"], setupCost: 0, yearlyCompliance: 100 },
];

const FORMATION_STEPS = [
  { step: 1, title: "Choose Company Name", days: 1, cost: 0, description: "Search Companies House register and choose name" },
  { step: 2, title: "Prepare Documents", days: 2, cost: 50, description: "Prepare Memorandum & Articles of Association" },
  { step: 3, title: "File with Companies House", days: 1, cost: 150, description: "Submit incorporation documents online" },
  { step: 4, title: "Receive Certificate", days: 3, cost: 0, description: "Receive Certificate of Incorporation" },
  { step: 5, title: "Open Bank Account", days: 2, cost: 0, description: "Set up business bank account" },
  { step: 6, title: "Register for Tax", days: 1, cost: 0, description: "Register with HMRC for Self Assessment/Corporation Tax" },
];

const TAX_IMPLICATIONS = [
  { type: "Limited Company", corporateTax: "19%", nationalIns: "No", dividendTax: "8.75%", paperwork: "High", complexity: "High" },
  { type: "LLP", corporateTax: "Pass-through", nationalIns: "Yes (Class 2/4)", dividendTax: "N/A", paperwork: "High", complexity: "High" },
  { type: "Sole Trader", corporateTax: "Income tax", nationalIns: "Yes (Class 2)", dividendTax: "N/A", paperwork: "Low", complexity: "Low" },
];

const COMPLIANCE_REQUIREMENTS = [
  { id: "1", requirement: "File Annual Accounts with Companies House", frequency: "Yearly", penalty: "£150-£1,500", critical: true },
  { id: "2", requirement: "Submit Corporation Tax Return", frequency: "Yearly", penalty: "20% interest on unpaid tax", critical: true },
  { id: "3", requirement: "Pay Corporation Tax", frequency: "9 months after year-end", penalty: "Interest + penalties", critical: true },
  { id: "4", requirement: "PAYE if employing staff", frequency: "Monthly", penalty: "Significant fines", critical: true },
  { id: "5", requirement: "Update Statutory Register", frequency: "When changes occur", penalty: "£1,000+ fine", critical: false },
  { id: "6", requirement: "Annual Confirmation Statement", frequency: "Yearly", penalty: "£150-£1,500", critical: false },
  { id: "7", requirement: "Health & Safety Compliance", frequency: "Ongoing", penalty: "Up to £20,000+", critical: false },
  { id: "8", requirement: "Data Protection (GDPR)", frequency: "Ongoing", penalty: "Up to £20 million", critical: false },
];

export default function CompanyFormation() {
  const [selectedType, setSelectedType] = useState("ltd");
  const [companyName, setCompanyName] = useState("");
  const [estimatedRevenue, setEstimatedRevenue] = useState(0);
  const [employees, setEmployees] = useState(0);
  const [formationMonth, setFormationMonth] = useState("jan");
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState("overview");

  const selectedCompany = COMPANY_TYPES.find(t => t.id === selectedType);
  const totalSetupCost = selectedCompany!.setupCost;
  const firstYearCost = selectedCompany!.setupCost + selectedCompany!.yearlyCompliance;
  
  const timeline = FORMATION_STEPS.reduce((acc, s) => acc + s.days, 0);
  const timelineCost = FORMATION_STEPS.reduce((acc, s) => acc + s.cost, 0);

  const projectedTaxBurden = selectedType === "ltd" 
    ? Math.round((estimatedRevenue * 0.19) / 12)
    : selectedType === "llp"
    ? Math.round((estimatedRevenue * 0.20) / 12)
    : Math.round((estimatedRevenue * 0.32) / 12);

  const complianceCost = employees > 0 ? 2000 + (employees * 500) : 800;

  const timelineData = FORMATION_STEPS.map(s => ({
    step: s.step,
    cumulativeDays: FORMATION_STEPS.slice(0, s.step).reduce((acc, ss) => acc + ss.days, 0),
    cost: s.cost,
  }));

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const completionPercent = (checkedCount / COMPLIANCE_REQUIREMENTS.length) * 100;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Company Formation & Structure Guide</h1>
            <p className="text-lg text-muted-foreground">PhD-Level UK Company Formation Strategy & Compliance Planner</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { id: "overview", label: "Overview" },
              { id: "comparison", label: "Type Comparison" },
              { id: "formation", label: "Formation Steps" },
              { id: "tax", label: "Tax Implications" },
              { id: "compliance", label: "Compliance Checklist" },
              { id: "calculator", label: "Cost Calculator" },
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Company Formation Wizard</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium">Company Name</label>
                    <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g., TechStartup Ltd" className="mt-2" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_TYPES.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estimated Annual Revenue (£)</label>
                    <Input type="number" value={estimatedRevenue} onChange={e => setEstimatedRevenue(parseInt(e.target.value) || 0)} placeholder="100000" className="mt-2" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Employees (including you)</label>
                    <Input type="number" value={employees} onChange={e => setEmployees(parseInt(e.target.value) || 0)} min="1" className="mt-2" />
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
                  <h3 className="font-semibold mb-2">Setup Cost</h3>
                  <p className="text-3xl font-bold">£{totalSetupCost}</p>
                  <p className="text-sm text-muted-foreground mt-2">One-time investment</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                  <h3 className="font-semibold mb-2">Formation Timeline</h3>
                  <p className="text-3xl font-bold">{timeline} days</p>
                  <p className="text-sm text-muted-foreground mt-2">Average time to incorporation</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
                  <h3 className="font-semibold mb-2">Year 1 Total Cost</h3>
                  <p className="text-3xl font-bold">£{firstYearCost + timelineCost}</p>
                  <p className="text-sm text-muted-foreground mt-2">Setup + first year compliance</p>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">{selectedCompany?.name} - Advantages & Disadvantages</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">✓ Advantages</h4>
                    <ul className="space-y-2">
                      {selectedCompany?.advantages.map((adv, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span> {adv}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3">✗ Disadvantages</h4>
                    <ul className="space-y-2">
                      {selectedCompany?.disadvantages.map((dis, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span> {dis}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* COMPARISON TAB */}
          {activeTab === "comparison" && (
            <div className="space-y-6">
              <Card className="p-6 overflow-x-auto">
                <h2 className="text-2xl font-bold mb-4">Company Type Comparison Matrix</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left p-2">Feature</th>
                      {COMPANY_TYPES.map(t => <th key={t.id} className="text-center p-2">{t.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-2 font-semibold">Setup Cost</td> {COMPANY_TYPES.map(t => <td key={t.id} className="text-center p-2">£{t.setupCost}</td>)}</tr>
                    <tr className="border-b"><td className="p-2 font-semibold">Yearly Compliance</td> {COMPANY_TYPES.map(t => <td key={t.id} className="text-center p-2">£{t.yearlyCompliance}</td>)}</tr>
                    <tr className="border-b"><td className="p-2 font-semibold">Personal Liability</td> {[<td key="ltd" className="text-center p-2 text-green-600">✓ Limited</td>, <td key="llp" className="text-center p-2 text-green-600">✓ Limited</td>, <td key="sole" className="text-center p-2 text-red-600">✗ Unlimited</td>]}</tr>
                    <tr className="border-b"><td className="p-2 font-semibold">Tax Efficiency</td> {[<td key="ltd" className="text-center p-2">★★★★★</td>, <td key="llp" className="text-center p-2">★★★★☆</td>, <td key="sole" className="text-center p-2">★★☆☆☆</td>]}</tr>
                    <tr><td className="p-2 font-semibold">Paperwork</td> {[<td key="ltd" className="text-center p-2">High</td>, <td key="llp" className="text-center p-2">Very High</td>, <td key="sole" className="text-center p-2">Low</td>]}</tr>
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* FORMATION STEPS TAB */}
          {activeTab === "formation" && (
            <div className="space-y-6">
              <Card className="p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Formation Timeline & Checklist</h2>
                <div className="space-y-3">
                  {FORMATION_STEPS.map((step, idx) => (
                    <Card key={step.step} className={`p-4 ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'}`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{step.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-blue-600">⏱ {step.days} day(s)</span>
                            <span className="text-green-600">💷 £{step.cost}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Cumulative Timeline & Cost Projection</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" label={{ value: 'Formation Step', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis yAxisId="left" label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Cost (£)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="cumulativeDays" stroke="#11b6e9" name="Cumulative Days" />
                    <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#ffa536" name="Step Cost (£)" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {/* TAX IMPLICATIONS TAB */}
          {activeTab === "tax" && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Tax Implications by Company Type</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 bg-gray-50">
                        <th className="text-left p-3">Type</th>
                        <th className="text-center p-3">Corp Tax</th>
                        <th className="text-center p-3">National Insurance</th>
                        <th className="text-center p-3">Dividend Tax</th>
                        <th className="text-center p-3">Paperwork</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TAX_IMPLICATIONS.map((tax, i) => (
                        <tr key={i} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="p-3 font-semibold">{tax.type}</td>
                          <td className="text-center p-3">{tax.corporateTax}</td>
                          <td className="text-center p-3">{tax.nationalIns}</td>
                          <td className="text-center p-3">{tax.dividendTax}</td>
                          <td className="text-center p-3">{tax.paperwork}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {estimatedRevenue > 0 && (
                  <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
                    <h3 className="font-semibold mb-2">Estimated Monthly Tax Burden (Based on £{estimatedRevenue.toLocaleString()} revenue)</h3>
                    <p className="text-2xl font-bold text-blue-600">£{projectedTaxBurden.toLocaleString()}/month</p>
                    <p className="text-sm text-muted-foreground mt-2">This includes corporation tax, national insurance, and compliance costs.</p>
                  </Card>
                )}
              </Card>
            </div>
          )}

          {/* COMPLIANCE CHECKLIST TAB */}
          {activeTab === "compliance" && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Compliance & Regulatory Checklist</h2>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Compliance Progress</span>
                    <span className="text-sm font-medium">{Math.round(completionPercent)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div style={{ width: `${completionPercent}%` }} className="bg-primary h-3 rounded-full transition-all"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  {COMPLIANCE_REQUIREMENTS.map(req => (
                    <Card key={req.id} className={`p-4 ${checkedItems[req.id] ? 'bg-green-50' : 'bg-white'} border-l-4 ${req.critical ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox 
                          checked={checkedItems[req.id] || false}
                          onCheckedChange={e => setCheckedItems({...checkedItems, [req.id]: !!e})}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${checkedItems[req.id] ? 'line-through' : ''}`}>{req.requirement}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>📅 {req.frequency}</span>
                            <span className="text-red-600">⚠️ Penalty: {req.penalty}</span>
                            {req.critical && <span className="text-red-600 font-semibold">🔴 CRITICAL</span>}
                          </div>
                        </div>
                      </label>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* COST CALCULATOR TAB */}
          {activeTab === "calculator" && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Total Cost of Ownership Calculator</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Year 1 Costs</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Company Registration</span><span className="font-semibold">£{totalSetupCost}</span></div>
                      <div className="flex justify-between"><span>Formation Filing</span><span className="font-semibold">£{timelineCost}</span></div>
                      <div className="flex justify-between"><span>Compliance & Accounting</span><span className="font-semibold">£{selectedCompany?.yearlyCompliance}</span></div>
                      <div className="flex justify-between"><span>Payroll (if applicable)</span><span className="font-semibold">£{employees > 0 ? 500 * employees : 0}</span></div>
                      <div className="border-t-2 pt-2 flex justify-between font-bold"><span>Total Year 1</span><span>£{totalSetupCost + timelineCost + selectedCompany!.yearlyCompliance + (employees > 0 ? 500 * employees : 0)}</span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Years 2-5 Annual Costs</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Compliance & Accounting</span><span className="font-semibold">£{selectedCompany?.yearlyCompliance}</span></div>
                      <div className="flex justify-between"><span>Payroll Administration</span><span className="font-semibold">£{employees > 0 ? 500 * employees : 0}</span></div>
                      <div className="flex justify-between"><span>Annual Confirmation</span><span className="font-semibold">£100</span></div>
                      <div className="flex justify-between"><span>Tax Compliance</span><span className="font-semibold">£{complianceCost}</span></div>
                      <div className="border-t-2 pt-2 flex justify-between font-bold"><span>Annual Recurring</span><span>£{selectedCompany!.yearlyCompliance + (employees > 0 ? 500 * employees : 0) + 100 + complianceCost}</span></div>
                    </div>
                  </div>
                </div>

                <Card className="p-4 mt-6 bg-gradient-to-r from-primary/10 to-accent/10">
                  <h3 className="font-semibold mb-2">5-Year Total Cost of Ownership</h3>
                  <p className="text-3xl font-bold">£{(totalSetupCost + timelineCost + selectedCompany!.yearlyCompliance + (employees > 0 ? 500 * employees : 0)) + (4 * (selectedCompany!.yearlyCompliance + (employees > 0 ? 500 * employees : 0) + 100 + complianceCost))}</p>
                </Card>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
